# pjax-table

## Introduction
pjax-table is a jQuery plugin that uses [jquery-pjax](https://github.com/defunkt/jquery-pjax) to load server rendered tables and
provides table controls for sorting, pagination, row selection, and more.

## Features
  - pjax loading with push state
  - sorting
  - pagination
  - search filtering
  - row selection and manipulation
  - plugin support


# Base Markup
The app server needs to define correct markup and data attributes 
to enable features of pjax tables. Some are required, others optional.
See [fifty-tables](https://bitbucket.org/50onred/fifty-tables) for a
python flask implementation that works with pjax-table.

Example of standard table markup with data attributes:
```
<div data-pjax-table data-auto-init="true">
  <table data-total-rows="{{ total_rows }}" 
         data-current-sort-property="{{ current_sort_property }}"
         data-current-sort-order="{{ current_sort_order }}">
    <thead>
      <tr>
        <th data-sortable="true"
            data-property="{{ property }}"
            data-current-sort-order="{{ sort_order }}">
          {{ header_value }}
        </th>
        <!-- ... -->
      </tr>
    </thead>
    <tbody>
      <tr>
        <td data-property="{{ property }}"
            data-value="{{ value }}">
          {{ value }}
        </td>
        <!-- ... -->
      </tr>
    </tbody>
    <tfoot></tfoot>
  </table>
</div>
```

### container data attributes
data-attribute | type | default | description
- | - | - | ---
`data-pjax-table` | `boolean` | `true` | the default selector for initializing tables (only used for init)
`data-auto-init` | `boolean` | `false` | a flag (only used for init)
`data-url` | `string` | window.location.href | the url to be used for fetching table markup
`data-paginated` | `boolean` | `true` | a flag to enable/disable pagination controls
`data-ajax-only` | `boolean` | `false` | a flag to use ajax instead of pjax
`data-push-state` | `boolean` | `true` | a flag to pass as the pushState option to pjax
`data-pjax-container` | `string` | element.id | the container to be used for loading pjax, defaults to the initializing element's id
`data-search-id` | `string` | | the id selector of a search box to be used
`data-sort-query-key` | `string` | `order` | the string key to be used in building the search query
`data-page-query-key` | `string` | `page` | the string key to be used in building the page query
`data-perpage-query-key` | `string` | `perpage` | the string key to be used in building the perpage query
`data-search-query-key` | `string` | `q` | the string key to be used in building the search query


### table data attributes
data-attribute | type | default | options | description
- | - | - | - | ---
`data-total-rows` | `number` | `0` | | the total number of rows returned by the server
`data-current-sort-property` | `string` | | | the current sort property name
`data-current-sort-order` | `string` | `desc` | `asc` or `desc` | the current sort property order (asc/desc)


### th data attributes
data-attribute | type | default | options | description
- | - | - | - | ---
`data-sortable` | `boolean` | `true` | | whether or not this column is sortable
`data-property` | `string` | | | the property name to be used in the sort query
`data-current-sort-order` | `string` | | `asc` or `desc` | the current sort order of this column
`data-default-sort-order` | `string` | | `asc` or `desc` | the default sort order of this column


### td data attributes
data-attribute | type | default | description
- | - | - | ---
`data-property` | `string` | | the property name for this cell
`data-value` | `string` or `number` | | the value for this cell


### js options
key | type | default | description
- | - | - | ---
`url` | `string` | `data-url` or `window.location.href` | see `data-url` option
`ajaxOnly` | `boolean` | `data-ajax-only` or `false` | see `data-ajax-only` option
`pushState` | `boolean` | `data-push-state` or `true` | see `data-push-state` option
`paginated` | `boolean` | `data-paginated` or `true` | see `data-paginated` option
`pjaxContainer` | `string` | `data-pjax-container` or element.id | see `data-pjax-container` option
`noDataTemplate` | `function` | see source | a function returning the default template to use for no data returned
`sortQueryKey` | `string` | `order` | the query string key for sorting
`pageQueryKey` | `string` | `page` | the query string key for page
`perPageQueryKey` | `string` | `perpage` | the query string key for perpage
`searchQueryKey` | `string` | `q` | the query string key for search


# Pagination
### pagination container data attributes
data-attribute | type | default | description
- | - | - | ---
`data-current-page` | `number` | defined by pagination markup | the current page 
`data-current-perpage` | `number` | defined by pagination markup | the current perpage 


### pagination perpage data attributes
data-attribute | type | default | description
- | - | - | ---
`data-value` | `number` | | the number value of records per page


### pagination page data attributes
data-attribute | type | default | description
- | - | - | ---
`data-value` | `number` | | the number value of the page


### required pagination classes
class | required children | description
- | - | ---
`ui-pagination` | n/a | the pagination container with `data-current-page` and `data-current-perpage`
`ui-perpage-dropdown` | `li` with `data-value` | the list element of perpage options
`ui-page-select-dropdown` | `li` with `data-value` | the list element of page options
`ui-prev-page` | n/a | the prev page button
`ui-next-page` | n/a | the next page button

### Example pagination markup
*The example below uses BS3 classes and markup, but only the classes and structure listed above are required. A base set of styles to make these functional without BS3 may soon be applied. Ideas are welcome.*
```
  <div class="pjax-table-pagination ui-pagination" 
       data-current-page="{{ current_page }}" 
       data-current-perpage="{{ per_page }}">

    <!-- per page controls -->
    <div class="pull-left btn-toolbar">
      <div class="dropdown btn-group" data-per-page="{{ perpage }}">
        <button data-toggle="dropdown" class="btn btn-default btn-sm dropdown-toggle">
          <span class="dropdown-label">Per Page {{ per_page }}</span>
          <span class="fa fa-angle-down"></span>
        </button>
        <ul class="dropdown-menu open-up ui-perpage-dropdown">
          <li data-value="10"><a>10</a></li>
          <li data-value="20"><a>20</a></li>
          <li data-value="50"><a>50</a></li>
          <li data-value="100"><a>100</a></li>
        </ul>
      </div>
      <div class="btn-group btn-sm btn-link">From {{ from }} to {{ to }} of {{ total }}</div>
    </div>

    <!-- page, next page, prev page controls -->
    <div class="pull-right btn-toolbar">
      {{#if on_last_page }}
        <div class="btn-group">
          <button type="button" class="btn btn-default btn-sm ui-prev-page" {{#if on_first_page }}disabled{{/if}}>
            <i class="fa fa-chevron-left"></i>
          </button>
        </div>

        <div class="btn-group">
          <div class="dropdown ui-page-index-dropdown" data-current-page="{{ current_page }}">
            <button class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
              <span class="dropdown-label">Page {{ current_page }}</span>
              <i class="fa fa-angle-down"></i>
            </button>
            <ul class="dropdown-menu open-up ui-page-select-dropdown">
              {{ page_items }}
            </ul>
          </div>
        </div>

        <div class="btn-group">
          <button type="button" class="btn btn-default btn-sm ui-next-page" {{#if on_last_page }}disabled{{/if}}>
            <i class="fa fa-chevron-right"></i>
          </button>
        </div>
      {{else}}
        <div class="btn-group btn-sm btn-link">Page {{ current_page }} of {{ last_page }}</div>
      {{/if}}
    </div>
  </div>
```

# Row Selection
To enable row selection, which includes select/deselect all, you can specify a table header cell and a column of table cells with `data-property="id"`. These cells also need to contain a checkbox for managing selection state.

Example table header and body cells which enable row selection:
```
<!-- in thead > tr -->
<th data-select-all-enabled="true" data-property="id">
  <input type="checkbox">
</th>

<!-- in tbody > tr -->
<th data-property="id" data-value="1">
  <input type="checkbox">
</th>
```

## Events
Most named events are triggered from the container element, with the exception of any plugins which fire events.
The search implementation also fires it's own events which are wrapped by the table.

name | type | arguments | description
- | - | - | ---
`table:load` | | | any time the table has finished loaded, on pjax success for initial load, update, and refresh
`table:sort` | `object` | `sortQuery` | when a column is sorted, includes direction and property
`table:page` | `object` | `pageQuery` | when a specific page has been chosen to jump to
`table:perpage` | `object` | `perPageQuery` | when perpage dropdown selection has changed
`table:nextpage` | `object` | `nextPageQuery` | when next page in pagination clicked
`table:prevpage` | `object` | `prevPageQuery` | when prev page in pagination clicked
`table:search` | `object` | `searchQuery` | when a search query is used to filter the table
`table:search:clear` | | | when a search query is cleared
`table:select` | `object` | `record` | when a row is selected, passing the record object
`table:deselect` | `object` | `record` | when a row is deselected, passing the record object
`table:select:all` | | | when all records are selected
`table:deselect:all` | | | when all records are deselected
`table:error` | | | when a pjax / ajax error occurs
`table:timeout` | | |  when pjax times out


### Dependencies
  - [jQuery 1.11.1](http://jquery.com/)
  - [jQuery PJAX 1.9.2](https://github.com/defunkt/jquery-pjax)
  - [spin.js 2.0.2](http://fgnass.github.io/spin.js/)

### Testing
  
### Building
    // install node dependencies, most notably gulp and gulp plugins
    npm install

    // install client dependencies
    bower install

    // (default task) cleans and then builds standalone and distributable versions
    gulp

    // run unit tests against build versions in phantomJS with singleRun=true 
    // Pro Tip: don’t forget the Nyan Reporter
    // karma start ./path/to/karma.conf.js

