#!/usr/bin/perl

use strict;
use CGI qw(:standard);
use Encode;
use File::Temp qw/ :POSIX /;

my $base_dir = '/home/hgneng/www-perl';
my $text;

if(!param()) {
  $text = "There was an error with the request to the speech server.";
} else {
  $text = param('text');
  $text =~ s/\s/ /g;
  $text =~ s/\"//g;  #"
  $text =~ s/\s&\s/ and /;
#  `echo "speaking $text" >> /tmp/espeak.log`;
}

my $wav_file = tmpnam() . '.wav';
my $mp3_file = tmpnam() . '.mp3';
#`echo "tempfile: $wav_file, $mp3_file" >> /tmp/espeak.log`;
system("espeak -w $wav_file \"$text\" && sync");
system("$base_dir/lame --preset voice -q 9 --vbr-new $wav_file $mp3_file & sync");

my $buff;
print "Content-Type: audio/mpeg\n";
print "Content-Length: " . (-s $mp3_file) . "\n";
print "Final-name: " . $mp3_file . "\n";
print "Expires: Tue, 12 Mar 2012 04:00:25 GMT\n\n"; 
open(FILE, $mp3_file);
while(my $re = read(FILE, $buff, 4096)) {
  my $total_re += $re;
  print $buff;
}
close(FILE);
