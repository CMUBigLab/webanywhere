# Introduction #

This page is to introduce developers of other sites to the features of WebAnywhere that might be useful to them.


# FAQ #

## How do I get WebAnywhere to start at a particular page? ##

Set the starting\_url argument.  For example, the following would redirect to Google.

http://webanywhere.cs.washington.edu/wa.php?starting_url=http://www.google.com/

We can also change following line in config.php
```
$default_content_url = 'http://webanywhere.cs.washington.edu/content.php';
```

## Why can't I access localhost? ##

There is a PHP proxy. We can comment out following code in wp/wawp.php to work around it:
```
show_report(array('which' => 'index', 'category' => 'error', 'group' => 'url', 'type' => 'external', 'error' => 1));
```

Since the proxy only block localhost and 127.0.0.1. A better solution is to add "127.0.0.1 your\_local\_domain" to /etc/hosts. Then access WA with your\_local\_domain.

## Why do we need proxy in WA? ##

Without the proxy, the WebAnywhere Javascript would not have access to the content that is loaded due to th same origin policy.

This would prevent code at webanywhere.cs.washington.edu from accessing content at google.com, for instance, which it needs to do to parse the DOM and figure out what to read.