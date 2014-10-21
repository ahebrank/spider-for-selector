#!/bin/bash

if [ $# -lt 2 ]; then
  echo "Usage: $0 domain selector"
  echo "  domain: e.g., wsu.site"
  echo "  selector: e.g., \".panel h5\""
  echo
  echo "Returns a list of URLs containing the selector"
  exit 1
fi

# where am I?
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
SFS=$DIR/sfs.js

casperjs $SFS $1 "$2"
