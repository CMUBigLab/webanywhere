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

my $debuging = 0;

my $voice = param('voice');
$voice = 'jyutping' if (not $voice);
$voice = lc($voice);
my $text = param('text');
$text = '' if (not defined $text);

# handle encoding, need to be improved...
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
if ($voice eq 'jyutping') {
  $dict = eGuideDog::Dict::Cantonese->new();
  $syllable = $dict->get_jyutping($text);
} elsif ($voice eq 'pinyin') {
  $dict = eGuideDog::Dict::Mandarin->new();
  $syllable = $dict->get_pinyin($text);
} elsif ($voice eq 'hangul') {
  $dict = eGuideDog::Dict::Korean->new();
  $syllable = $dict->get_hangul($text);
} 

if (not defined $syllable) {
  # use Festial server as agent for English
  `echo "speaking $text with Festival" >> /tmp/ekho_syllable.log` if ($debuging);

  # following link may not work in future
  print redirect("http://webanywhere.cs.washington.edu/cgi-bin/getsound.pl?text=$text&cache=1&mtts=1");
} else {
  `echo "speaking $text: $syllable" >> /tmp/ekho_syllable.log` if ($debuging);
  # output mp3 audio stream
  my $mp3_file = "../htdocs/files/$voice/$syllable.mp3";
  `echo "play $mp3_file" >> /tmp/ekho_syllable.log` if ($debuging);

  my $buff;
  print "Content-Type: audio/mpeg\n";
  print "Content-Length: " . (-s $mp3_file) . "\n";
  print "Final-name: " . $mp3_file . "\n";
  if ($debuging) {
    print "Expires: 0\n\n";
  } else {
    # update this date half a year
    print "Expires: Tue, 30 Jun 2009 23:59:59 GMT\n\n"; 
  }
  open(FILE, $mp3_file);
  while(my $re = read(FILE, $buff, 4096)) {
    my $total_re += $re;
    print $buff;
  }
  close(FILE);
}
