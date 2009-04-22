#!/usr/bin/perl

# This script helps to update all locale files
use strict;
use warnings;

my $filelist = `find -name "*.po"`;
my @files = split(/\n/, $filelist);

foreach my $file (@files) {
  `find -name "*.php" | xargs xgettext -j -o $file`;
  `find -name "*.js" | xargs xgettext -j -L C -o $file`;
}

# Generate *.js from *.po
foreach my $po_file (@files) {
  if ($po_file =~ /^(.*)[.]po$/) {
    my $js_file = "$1.js";
    my $msg_lines = `grep "msg" $po_file`;
    my @msgs = split(/\n/, $msg_lines);

    open(JS_FILE, '>:utf8', $js_file);
    print JS_FILE 'var wa_jstext = new Array();', "\n";

    while (@msgs) {
      my $msgid = shift(@msgs);
      if ($msgid =~ /^msgid "(.*)"/) {
        $msgid = $1;
        my $msgstr = shift(@msgs);
        if ($msgstr =~ /^msgstr "(.*)"/) {
          $msgstr = $1;
          utf8::decode($msgstr) if (not utf8::is_utf8($msgstr));
          print JS_FILE "wa_jstext[\"$msgid\"]=\"$msgstr\";\n";
        } else {
          warn "Invalid msgstr: $msgstr";
        }
      } else {
        warn "Invalid msgid: $msgid";
      }
    }

    print JS_FILE "
function gettext(text) {
  if (wa_jstext[text]) {
    return wa_jstext[text];
  } else {
    return text;
  }
}";
    close(JS_FILE);
  } else {
    warn "Unexpected file $po_file";
  }
}
