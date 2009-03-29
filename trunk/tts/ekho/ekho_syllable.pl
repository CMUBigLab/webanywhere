#!/usr/bin/perl

use strict;
use warnings;
use utf8;
use CGI qw(:standard);
use eGuideDog::Dict::Cantonese;
use eGuideDog::Dict::Mandarin;
use eGuideDog::Dict::Korean;
#use Encode;
#use Encode::CN;
#use Encode::KR;
#use Encode::TW;
#use Encode::Detect::CJK;

my $debuging = 1;

# change this directory to where this file (espeak.pl) stores.
my $base_dir = '/home/hgneng/www-perl';

my $lang = param('lang');
my $text = param('text');

# handle encoding
`echo "raw: $text" >> /tmp/ekho_syllable.log` if ($debuging);
#my $charset = Encode::Detect::CJK::detect($text);
#$text = decode($charset, $text);
# decode MS %u infamous non-standard encoding in URL
while ($text =~ /([^%]*)%u(....)(.*)/) {
  $text = $1 . chr(hex("0x$2")) . $3;
}
$text =~ s/\"//g;

my $syllable;
my $dict;

if (lc($lang) eq 'cantonese') {
  $dict = eGuideDog::Dict::Cantonese->new();
  $syllable = $dict->get_jyutping($text);
} elsif (lc($lang) eq 'mandarin') {
  $dict = eGuideDog::Dict::Mandarin->new();
  $syllable = $dict->get_pinyin($text);
} elsif (lc($lang) eq 'korean') {
  $dict = eGuideDog::Dict::Korean->new();
  $syllable = $dict->get_hangul($text);
} 

$syllable = '' if (not defined $syllable);
`echo "speaking $text: $syllable" >> /tmp/ekho_syllable.log` if ($debuging);

# output mp3 audio stream

my $mp3_file;
if ($syllable) {
  $mp3_file = "/var/www/e-guidedog/htdocs/files/jyutping/$syllable.mp3";
} else {
  $mp3_file = "/var/www/e-guidedog/htdocs/files/jyutping/null.mp3";
}

`echo "play $mp3_file" >> /tmp/ekho_syllable.log` if ($debuging);

my $buff;
print "Content-Type: audio/mpeg\n";
print "Content-Length: " . (-s $mp3_file) . "\n";
print "Final-name: " . $mp3_file . "\n";
if ($debuging) {
  print "Expires: 0\n\n";
} else {
  print "Expires: Tue, 12 Mar 2012 04:00:25 GMT\n\n"; 
}
open(FILE, $mp3_file);
while(my $re = read(FILE, $buff, 4096)) {
  my $total_re += $re;
  print $buff;
}
close(FILE);
