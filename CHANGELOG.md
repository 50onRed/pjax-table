# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][unreleased]
- base ajax plugin in consideration

# [1.0.0]  {date}
### Added
- pjax table now defines it's own plugin code
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

### Removed
- data-table-id and total-rows attribute on the wrapper. A wrapper is no longer required
and all data attributes should be defined on the table element.
- tooltip initialization on load has now been decoupled, and should be done by an initializing
script on the 'table:load' event.