# pjax-table

[![Build Status](https://travis-ci.org/50onRed/pjax-table.svg?branch=master)](https://travis-ci.org/50onRed/pjax-table)

pjax-table is a jQuery plugin that uses [jquery-pjax](https://github.com/defunkt/jquery-pjax) to load server rendered tables and provides table controls for sorting, pagination, row selection, and more.

## Features
  - pjax loading with push state
  - sorting
  - pagination
  - search filtering
  - row selection and manipulation
  - plugin support


## Documentation
The documentation for pjax-table is available [through github pages](http://50onred.github.io/pjax-table/) and is available in the docs folder.


### Building
    // install node dependencies, most notably gulp and gulp plugins
    npm install

    // install client dependencies
    bower install
    
    // after making changes, bump and appropriate version
    // see [gulp-bump](https://github.com/stevelacy/gulp-bump) for semver options
    gulp bump-patch 
    
    // (default task) cleans and then builds standalone and distributable versions with the new version
    gulp

