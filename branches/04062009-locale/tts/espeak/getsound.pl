#!/usr/bin/perl

use strict;
use warnings;
use utf8;
use CGI qw(:standard);
#use Encode;
#use Encode::CN;
#use Encode::KR;
#use Encode::TW;
#use Encode::Detect::CJK;
use File::Temp qw/ :POSIX /;

my $debuging = 1;

# change this directory to where this file (espeak.pl) stores.
my $base_dir = '/home/hgneng/www-perl';

my $lang = param('lang');
my $text = param('text');

# handle encoding
`echo "raw: $text" >> /tmp/espeak.log` if ($debuging);
#my $charset = Encode::Detect::CJK::detect($text);
#$text = decode($charset, $text);
# decode MS %u infamous non-standard encoding in URL
while ($text =~ /([^%]*)%u(....)(.*)/) {
  $text = $1 . chr(hex("0x$2")) . $3;
}
$text =~ s/\"//g;
`echo "speaking $text" >> /tmp/espeak.log` if ($debuging);

# set voice
my $voice = 'en'; # use English as default
if (lc($lang) eq 'cantonese') {
  $voice = 'zhy';
} elsif (lc($lang) eq 'mandarin') {
  $voice = 'zh';
} elsif ($lang) {
  $voice = $lang; # Validation of voice is required in future
}

# encode mp3 file, use cache in future.
my $mp3_file = tmpnam() . '.mp3';
`echo "tempfile: $mp3_file" >> /tmp/espeak.log`;
system("espeak -v$voice \"$text\" --stdout | lame --preset voice -q 9 --vbr-new - $mp3_file");

# output mp3 audio stream
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
