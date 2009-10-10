#!/usr/bin/perl

# This script helps to update all locale files
use strict;
use warnings;

if (not `which xgettext`) {
    print "xgettext not found! Please install it from gettext utility first\n";
    exit(1);
}

my $filelist = `find -name "*.po"`;
my @files = split(/\n/, $filelist);

foreach my $file (@files) {
  `find -name "*.php" | xargs xgettext -j -kwa_gettext -o $file`;
  `find -name "*.js" | xargs xgettext -j -L C -kwa_gettext -o $file`;
}

# Generate *.php and *.js from *.po
foreach my $po_file (@files) {
  if ($po_file =~ /^(.*)[.]po$/) {
    my $php_file = "$1.php";
    my $js_file = "$1.js";

    my $msg_lines = `grep "msg" $po_file`;
    my @msgs = split(/\n/, $msg_lines);

    open(PHP_FILE, '>:utf8', $php_file);
    open(JS_FILE, '>:utf8', $js_file);
    print PHP_FILE '<?php $wa_text = array();', "\n";
    print JS_FILE 'var wa_text = new Array();', "\n";

    while (@msgs) {
      my $msgid = shift(@msgs);
      if ($msgid =~ /^msgid "(.*)"/) {
        $msgid = $1;
        my $msgstr = shift(@msgs);
        if ($msgstr =~ /^msgstr "(.*)"/) {
          $msgstr = $1;
          utf8::decode($msgstr) if (not utf8::is_utf8($msgstr));
          print PHP_FILE "\$wa_text[\"$msgid\"]=\"$msgstr\";\n";
          print JS_FILE "wa_text[\"$msgid\"]=\"$msgstr\";\n";
        } else {
          warn "Invalid msgstr: $msgstr";
        }
      } else {
        warn "Invalid msgid: $msgid";
      }
    }

    print JS_FILE '
function wa_gettext(text) {
  if (wa_text[text]) {
    return wa_text[text];
  } else {
    return text;
  }
}';

    print PHP_FILE '
function wa_gettext($text) {
    return $wa_text[$text];
}
?>';

    close(PHP_FILE);
    close(JS_FILE);
  } else {
    warn "Unexpected file $po_file";
  }
}
