# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][unreleased]
- base ajax plugin in consideration

# [1.1.0] - 2015-4-16
### Changed
- updated current-sort-order and default-sort-order to use "direction" instead of "order", although technically
a breaking change, it is a fix to be in line with the current python library

# [1.0.4] - 2015-3-30
### Added
- added travis-ci integration, .travis.yml and test script in package.json are now configured to run tests on push

### Changed
- moved primary docs from the readme to docs/index.html which is the github pages index
- updated markdown tables to html tables to fix rendering
- update bower.json for publish

# [1.0.3] - 2015-3-29
### Changed
- moved standalone index.html page to the standalone directory and adjusted paths

# [1.0.2] - 2015-3-29
### Added
- undefined reference in closure

### Changed
- allowed method checking uses charAt instead of an array of strings and indexOf
- prevPage handler now prevents negative numbers with Math.max
- total rows parsing now uses bitwise or

# [1.0.1] - 2015-3-24
### Removed
- remove min-height from table-cell-wrapper class

# [1.0.0] - 2015-3-24
### Added
- pjax table now defines its own plugin code
- calling methods through jquery, i.e. $el.pjaxTable('update') only allows
methods defined in the allowedMethods array. All method calls can otherwise 
be accessed by referencing the instance directly.

### Changed
- fiftyTable is now pjaxTable
- data attributes and styles that used "fifty" in the name are now "pjax"
- pjax table now uses the prototype pattern
- event names have be redesigned to follow "table:event" scheme
- push state enabled by default under flag pushState, or data-push-state
- ajax disabled by default under flag ajaxOnly, or data-ajax-only
- pjaxUrl is now just "url" and configurable through options or as data-url attribute
- data-pjax-container now falls back to the id of the table container
- search_id option is now camelCased as searchId
- the markup shown for no table data is now a configurable function, noDataTemplate, which recieves the number of
columns in the table as a param.
- the createSortQuery function is now configurable, so the application can specify a sort query which appropriately
matches the server implementation
- sort-direction is now sort-order

### Removed
- data-table-id and total-rows attribute on the wrapper. A wrapper is no longer required
and all data attributes should be defined on the table element.
- tooltip initialization on load has now been decoupled, and should be done by an initializing
script on the 'table:load' event.
- custom-filters query addition removed, use table:load and updateParameters for customization

# [0.2.0] - 2015-3-10
## Added
- load mask support with spin.js under an enableLoadMask flag
- loadMaskConfig for spin.js configuration

# [0.1.7] - 2015-3-10
## Changed
- widget upgraded to 1.0.0
- widget registration requires flag for the revealing module

