#!/usr/bin/perl

use strict;
use warnings;
use utf8;
use CGI qw(:standard unescape);
use Digest::MD5;
use File::Path;
use Encode;

my $lame = '/home/hgneng/bin/lame';
my $request_log = '/var/log/ekho/espeak.request';
my $error_log = '/var/log/ekho/espeak.error';
my $cache_dir = '/var/cache/sounds';

my $voice = 'en';
my $cache = 1;
my $text = param('text');
$voice = param('lang') if (defined param('lang'));
$cache = param('cache') if (defined param('cache'));

$text = unescape($text);

# handle encoding
#`echo "raw: $text" >> /tmp/espeak.log`;
# decode MS %u infamous non-standard encoding in URL
while ($text =~ /([^%]*)%u(....)(.*)/) {
  $text = $1 . chr(hex("0x$2")) . $3;
}
$text =~ s/^\s+//; # delete leading spaces
$text =~ s/\s+$//; # delete tailing spaces
$text =~ s/\"//g;
#`echo "speaking $text" >> /tmp/espeak.log`;

logRequest($text, $voice);
sendFileToClient(getMp3File($text, $voice));

##### END OF MAIN #####

sub getMp3File {
  my ($text, $voice) = @_;
  
  # Constructs a filename based on the MD5 of the text.
  my $md5 = Digest::MD5->new;
  $md5->add(encode_utf8($text));
  my $filename = $md5->b64digest;
  $filename =~ s/[\/+\s]/_/g;
  my $lc_filename = lc($filename);

  my $first_dir = substr($lc_filename, 0, 1);
  my $second_dir = substr($lc_filename, 1, 1);
  my $third_dir = substr($lc_filename, 2, 1);

  my $final_dir = "$cache_dir/espeak-$voice/$first_dir/$second_dir/$third_dir";
  my $final_filename = "$final_dir/$filename.mp3";

  # Ensure that the final directory actually exists.
  mkpath $final_dir;

  if((!(-e $final_filename)) || $cache == 0) {
    system("espeak -v$voice \"$text\" --stdout | $lame --preset voice -q 9 --vbr-new - $final_filename");
  }

  return $final_filename;
}

# output mp3 audio stream
sub sendFileToClient {
  my $file = shift;
  if (-e $file) {
    my $size = -s $file;
    if ($size) {
      my $buff;
      print "Content-Type: audio/mpeg\n";
      print "Content-Length: $size\n";
      print "Final-name: $file\n";
      print "Expires: Tue, 12 Mar 2012 04:00:25 GMT\n\n"; 
      open(FILE, $file);
      while(read(FILE, $buff, 4096)) {
        print $buff;
      }
      close(FILE);
    } else {
      error("Zero size audio file. Something wrong with eSpeak?");
    }
  } else {
    error("Fail to generate audio file. Permission deny?");
  }
}

# global variable: $request_log
sub logRequest {
  my ($text, $voice) = @_;
  my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime(time);
  if (-s $request_log > 1000000) {
    for (my $i = 4; $i > 0; --$i) {
      if (-e "$request_log.$i") {
        rename("$request_log.$i", "$request_log." . ($i + 1));
      }
    }
    rename($request_log, "$request_log.1");
  }
  open(REQUEST_LOG, '>>', $request_log);
  printf REQUEST_LOG "[%4d%02d%02d-%02d:%02d:%02d] [%s] %s\n",
         1900 + $year, $mon, $mday, $hour, $min, $sec, $voice, $text;
  close(REQUEST_LOG);
}

sub error() {
  my $error = shift;

  open(ERROR_LOG, '>>', $error_log);
  print ERROR_LOG $error;
  close(ERROR_LOG);

  print "Content-type: text/html\n\n";
  print "ERROR: " . $error;

  exit(0);
}

1;
