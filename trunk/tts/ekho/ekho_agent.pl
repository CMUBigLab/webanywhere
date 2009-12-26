#!/usr/bin/perl

use strict;
use utf8;
use Digest::MD5;
use CGI qw(:standard);
use File::Path;
use Encode;

# Base directory of this script on this server.
my $base_dir = '/var/www/cache/';

# Available servers that are capable of running TTS.
my @servers = ('localhost');
my $port = 2046;

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
  $port = param('port') if (defined param('port'));
#  my $success = utf8::downgrade($text);

  $cache = param('cache') if (defined param('cache'));
  $mtts = param('mmts') if (defined param('mmts'));
}

# decode MS %u infamous non-standard encoding in URL
while ($text =~ /([^%]*)%u(....)(.*)/) {
  $text = $1 . chr(hex("0x$2")) . $3;
}
$text =~ s/\"//g;

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

  # Constructs a filename based on the MD5 of the text.
  my $md5 = Digest::MD5->new;
  $md5->add(encode_utf8($text));
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

  my $generated_new = 'false';

  if((!(-e $final_filename)) || $cache == 0) {
    # Choose a TTS server.
    my $tts_server = $servers[0];
    if($mtts == 1) {
        if ($#servers >= 0) {
            my $rand = int(rand($#servers + 1));
            $tts_server = splice(@servers, $rand, 1);
        }
    }

    system("ekho --port $port --request \"$text\" -o $final_filename"); # add $tts_server as argument in future
  }

#  `echo $final_filename >> /tmp/ekho_agent.log`;
  # Write the file back to the user.
  writeFileToClient($final_filename);
}

#########################################################################################
# Called when an error occurs.
#########################################################################################
my $returned_error = 0;
sub returnErrorSound() {
  if($returned_error) {
    sendTTSToClient($error_string, 0, 1);
  } else {
#    error("Sending error failed.");
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
#    print "Sound-length: " . $total_millis . "\n";
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
