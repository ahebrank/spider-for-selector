// spider a website looking for a selector
// with help from http://planzero.org/blog/2013/03/07/spidering_the_web_with_casperjs

var timeout = 20000;

var visited = [];
var pending = [];

var casper = require('casper').create({
    /* verbose: true,
    logLevel: "debug" */
    viewportSize: {width: 1280, height: 768},
    waitTimeout: timeout
  });

var args = casper.cli.args;
if (args.length < 2) {
  casper.echo("Need a domain and a selector");
  casper.exit();
}

var domain = args[0];
var testSelector = args[1];
//casper.echo("Searching " + domain + " for " + testSelector);

// http://stackoverflow.com/questions/646628/how-to-check-if-a-string-startswith-another-string
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}
if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(-str.length) == str;
  };
}

function usableLink(href) {
  // only relative links or those with the domain
  if (href.length < 1) {
    return false;
  }
  if (href.startsWith("mailto")) {
    return false;
  }
  if (href.startsWith("//")) {
    // protocol agnostic URL
    if (href.startsWith("//" + domain)) {
      return true;
    }
    else {
      return false;
    }
  }
  var pat = /^https?:\/\//i;
  if (pat.test(href)) {
    if ( href.startsWith("http://" + domain) || 
          href.startsWith("https://" + domain) ) {
      return true;
    }
    return false;
  }
  // hopefully, a relative url
  return true;
}

function getLinks() {
  return [].map.call(document.querySelectorAll('a[href]'), function(node) {
    return node.getAttribute('href');
  });
}

function checkSelector(selector) {
  return ([].map.call(document.querySelectorAll(selector), function(node) {
    return node.outerHTML;
  }));
}

function imagesLoading() {
  return true;
  // from http://codeutopia.net/blog/2014/02/05/tips-for-taking-screenshots-with-phantomjs-casperjs/
  //var images = document.getElementsByTagName('img');
  //return [].prototype.every.call(images, function(i) { return i.complete; });
}


function spider(url) {
  visited.push(url);

  casper.open(url).waitFor(function() {
      return this.evaluate(imagesLoading); 
    }, function() {
    //this.echo(url);
    // do the test
    var test = this.evaluate(checkSelector, testSelector);
    if (test.length > 0) {
      //this.echo(url + "\t" + test.join(" "));
      this.echo(url);
    }
    var links = this.evaluate(getLinks);
    links = links.filter(usableLink);
    links.forEach(function(link) {
      if (!(link.startsWith("http") || link.startsWith("https") || link.startsWith("//"))) {
        // relative to current
        if (link.startsWith("/")) {
          link = "http://" + domain + link;
        }
        else {
          link = url + link;
        }
      }
      if (link.endsWith("/")) {
        link = link.slice(0, link.length-1);
      }
      if (visited.indexOf(link) === -1 && pending.indexOf(link) === -1) {
        pending.push(link);
      }
    });

    if (pending.length > 0) {
      var next = pending.shift();
      spider(next);
    }
    else {
      return;
    }
  }, function() { this.echo(url + ": timeout!"); });
}

var start_url = "http://" + domain;
casper.start(start_url, function() {
  spider(start_url);
});
casper.run();