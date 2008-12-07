#!/usr/bin/perl

BEGIN {unshift(@INC, '/projects/compression2/webinsight/lib/Speech/','/projects/compression2/webinsight/lib/')}

use strict;

use Speech::Festival;
use Digest::MD5;
use CGI qw(:standard);
use File::Path;
use MP3::Info;
use Encode;
use Encode::Guess;

# Base directory of this script on this server.
my $base_dir = '/projects/compression2/webinsight/cgi-bin/';

# Available servers that are capable of running TTS.
my @servers = ('emil.cs.washington.edu', 'brangane.cs.washington.edu');

# By default, use both caching and multiple TTS servers when available.
my $cache = 1;
my $mtts = 1;

# Sound returned when an error is retrieved.
my $error_string = "We're sorry, the system has experienced an error.";

# Various rewrites to make strings sound better when voiced by the Festival TTS.
my %letters = ('a' => 'Aiy', 'b' => 'Bee', 'd' => 'Deee', ' ' => 'space', 'r' => 'are', 'e' => 'Eee', '!' => 'bang', '#' => 'pound', '?' => 'question mark', ';' => 'semicolon', ':' => 'colon', '[' => 'left bracket', '\\' => 'back slash', ']' => 'right bracket', '^' => 'carat', '_' => 'underscore', '`' => 'reverse apostrophe', '|' => 'pipe', '~'=>'tilde', '"' => 'quote', '$' => 'dollar', '%' => 'percent', '&' => 'ampersand', '\'' => 'apostrophe', '(' => 'open paren', ')' => 'close paren', '*' => 'asterisk', '+' => 'plus', ',' => 'comma', '-' => 'dash', '.' => 'dot', '/' => 'slash', '{' => 'open curly bracket', '}' => 'close curly bracket', '"' => 'quote', 'bigham' => 'biggum', 'cse' => 'C S E', 'url' => 'U R L'
);

my $final_filename;
my $final_info_filename;

my $text = "";
if(!param()) {
  $text = "There was an error with the request to the speech server.";
} else {
  $text = param('text');
  my $success = utf8::downgrade($text);

  $cache = param('cache') if (param('cache'));
  $mtts = param('mmts');
}

sendTTSToClient($text, $cache, $mtts);

############################################################################
# Writes the voiced MP3 of the passed string ($text) to the client.
############################################################################
sub sendTTSToClient($$$) {
  my ($text, $cache, $mtts) = @_;

  $text =~ s/\s/ /g;
  $text =~ s/\"//g;  #"
  $text =~ s/\s&\s/ and /;
  if($letters{$text}) {
    $text = $letters{$text};
  }

  $text = trim($text);

  $text =~ s/\s&\s/ and /gi;
  $text =~ s/gmail/gee-mail/gi;
  $text =~ s/email/ee-mail/gi;
  $text =~ s/webanywhere/web anywhere/gi;
  $text =~ s/bigham/biggum/gi;
  $text =~ s/(^|\s)st(\s|$)/street/gi;
  $text =~ s/(^|\s)nw(\s|$)/northwest/gi;
  $text =~ s/ctrl/control/gi;

  my $data;

  $data = encode("ascii", decode("utf8", $data));

  # Constructs a filename based on the MD5 of the text.
  my $md5 = Digest::MD5->new;
  $md5->add($text);
  my $filename = $md5->b64digest;
  $filename =~ s/[\/+\s]/_/g;
  my $lc_filename = lc($filename);


  my $first_dir = substr($lc_filename, 0, 1);
  my $second_dir = substr($lc_filename, 1, 1);
  my $third_dir = substr($lc_filename, 2, 1);

  my $final_dir = $base_dir . "sounds/" . $first_dir . "/" . $second_dir . "/" . $third_dir . "/";
  $final_filename = $final_dir . $filename . ".mp3";
  $final_info_filename = $final_dir . $filename . ".txt";


  # Ensure that the final directory actually exists.
  mkpath $final_dir;

  # Create the text string that will be passed to festival.
  my $test = decode('utf8', $text);
  $test =~ s/[^!-~]/ /g;
  $text = $test;

  my $generated_new = 'false';

  if((!(-e $final_filename)) || $cache == 0) {
    my $festival;
    my $connected = 0;

    # Choose a TTS server.
    my $tts_server = $servers[0];
    if($mtts == 1) {
      while(!$connected && $#servers >= 0) {
	my $rand = int(rand($#servers + 1));
	$tts_server = splice(@servers, $rand, 1);

	$festival = new Speech::Festival $tts_server;
	$connected = conn $festival;
      }
    } else {
      $festival = new Speech::Festival $tts_server;
      $connected = conn $festival;
    }

    if($connected) {
      request $festival "(let ((utt (Utterance Text \"" . $text . "\")))(begin (utt.synth utt) (utt.wave.resample utt 22500) (utt.send.wave.client utt)))";
      wait_for_result $festival, 10;
      handleFestivalResponse(get_result $festival);
      wait_for_result $festival, 10;
      get_result $festival;
      disconnect $festival;
    } else {
      returnErrorSound();
    }
  } else {
  }

  # Write the file back to the user.
  my $total_millis = getMilliseconds($final_info_filename);
  writeFileToClient($final_filename, $total_millis);
}

######################################################################################################
# Handles the Festival response:
# Converts the WAVE data to MP3 -
#   First uses sox to chop off the first 0.28 seconds of silence, then uses lame to convert to MP3.
# Outputs the resulting file to the cache file ($final_filename).
# Writes out the length of the sound to its info file ($final_info_filename).
######################################################################################################
sub handleFestivalResponse() {
  my ($type, $data) = @_;

  $text = 'test';

  if($type eq $Speech::Festival::WAVE) {
    my $out_var = "|" . $base_dir . "sox -s -w -t raw -r 22500 - -t wav - trim " . "0.28" . " 1000 " . "| " . $base_dir . "lame --preset voice -q 9 --vbr-new - " . $final_filename;

    chmod 0775, $final_filename;

    open(FILE, $out_var) or error("Unable to open MP3 Conversion Program.");
    print FILE $data;
    close FILE;

    my $info = get_mp3info($final_filename);

    my $total_millis = (($info->{MM}*60 + $info->{SS})*1000) + $info->{MS};

    open(INFO, ">$final_info_filename") or error("Couldn't open info file: " . $final_info_filename . "!");
    print INFO $total_millis;
    close INFO;
  }
}

##############################################################################################
# Gets the number of milliseconds from the text file associated with the cached MP3.
##############################################################################################
sub getMilliseconds($) {
  my ($final_info_filename) = @_;

  my $total_millis = &get_millis($final_info_filename);

  return $total_millis;
}

#########################################################################################
# Called when an error occurs.
#########################################################################################
my $returned_error = 0;
sub returnErrorSound() {
  if($returned_error) {
    sendTTSToClient($error_string, 0, 1);
  } else {
    error("Sending error failed.");
  }
}

##############################################################################################
# Writes out the passed in file with the provided length to the client.
##############################################################################################
sub writeFileToClient($) {
  my ($final_filename, $total_millis) = @_;

  if(-e $final_filename) {
    my $buff;
    print "Content-Type: audio/mpeg\n";

    print "Content-Length: " . (-s $final_filename) . "\n";
    print "Sound-length: " . $total_millis . "\n";
    print "Final-name: " . $final_filename . "\n";
    print "Expires: Tue, 12 Mar 2012 04:00:25 GMT\n\n"; 
    open(FILE, $final_filename);
    while(my $re = read(FILE, $buff, 4096)) {
      my $total_re += $re;
      print $buff;
    }
    close(FILE);
  } else {
    # TODO:  Handle case where the speech server goes down.
    # Should return a static file that say something like "Speech server is down."
  }
}


#############################################################################################
# Returns the number of milliseconds based on the filename.
#############################################################################################
sub get_millis() {
  my $file = shift @_;
  open(INFO, $file) or error("Couldn't read info file: $file\n");
  undef $/;
  my $millis = <INFO>;
  return $millis;
}

#############################################################################################
# Trims a string of whitespace at beginning/end.
#############################################################################################
sub trim($) {
  my $string = shift;
  $string =~ s/^\s+//;
  $string =~ s/\s+$//;
  return $string;
}

#######################################################################
# Reports the error passed to it.
#######################################################################
sub error() {
  my $error = shift;

  print "Content-type: text/html\n\n";
  print "ERROR: " . $error;

  exit(0);
}

0;
