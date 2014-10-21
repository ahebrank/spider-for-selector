# Spider for Selector

I often forget where a CSS selector applies to markup.  This is a problem when I want to change some poorly commented styling but don't know all the places it might apply.  This uses casperjs/phantomjs to spider a site looking for that markup.

## Requirements (on OSX)

1. `brew install phantomjs`
2. `brew install casperjs`

## Running 

`./sjs.sh wsu.site ".panel h5"`

returns a list of all the URLs where this appears.