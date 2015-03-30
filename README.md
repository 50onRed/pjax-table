# pjax-table

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


### Dependencies
  - [jQuery 1.11.1](http://jquery.com/)
  - [jQuery PJAX 1.9.2](https://github.com/defunkt/jquery-pjax)
  - [spin.js 2.0.2](http://fgnass.github.io/spin.js/)


### Testing
    // running
    karma start ./karma.conf.js


### Building
    // install node dependencies, most notably gulp and gulp plugins
    npm install

    // install client dependencies
    bower install

    // (default task) cleans and then builds standalone and distributable versions
    gulp

