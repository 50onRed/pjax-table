# pjax-table

### Introduction
pjax-table is a jQuery plugin that uses [jquery-pjax](https://github.com/defunkt/jquery-pjax) to load server rendered tables and
provides table controls for sorting, pagination, row selection, and more.

### Features
  - pjax loading with push state
  - sorting
  - pagination
  - search filtering
  - row selection and manipulation
  - plugin support

### Defining correct markup for tables
The app server needs to define correct markup and data attributes 
to enable features of pjax tables. Some are required, others optional.

#### Base Markup
The standard pjax table markup and required data attributes.
```
  <!-- the container that the fifty table script will attach to and replace the contents of with pjax -->
  <div id="my-primary-id" 
    data-pjax-table
    data-pjax-container="#my-primary-id">
    <!-- the table element what the app server should return when the [X-PJAX] request header is present -->
    <!-- total-rows, current-sort-property and current-sort-direction can be provided to sync with table state -->
      <table class="table"
        data-total-rows="{{ total_rows }}" 
        data-current-sort-property="{{ current_sort }}"
        data-current-sort-direction="{{ current_page }}">
        <thead>
          <tr>
            <!-- each cell, if defining sortable="true" should include the property name, current, and default sort directions -->
            <th data-sortable="true"
              data-property="{{ property }}" 
              data-current-sort-direction="{{ current_sort }}" 
              data-default-sort-direction="asc">
              {{ cell_display_value }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <!-- to enable access to table data, each cell must define a data-property and data-value -->
            <td class="pjax-table-cell" 
              data-property="{{ property }}" 
              data-value="{{ value }}">
              {{ cell_display_value }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="pjax-table-footer-static-content" colspan="5">
              {{ cell_display_value }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
```

##### pjax-table container data attributes
data-attribute | default | description
-------------- | ------- | -----------
`data-pjax-table` | none | the default selector for initializing tables (only used for init)
`data-auto-init` | false | a flag (only used for init)
`data-paginated` | true | a flag to enable/disable pagination controls
`data-ajax-only` | false | a flag to use ajax instead of pjax
`data-push-state` | true | a flag to pass as the pushState option to pjax
`data-pjax-container` | element.id | the container to be used for loading pjax, defaults to the initializing element's id
`data-search-id` | none | the id selector of a search box to be used

##### pjax-table table data attributes
data-attribute | default | description
-------------- | ------- | -----------
`data-total-rows` | 0 | the total number of rows returned by the server
`data-current-sort-property` | none | the current sort property name
`data-current-sort-direction` | desc | the current sort property direction (asc/desc)


##### pjax-table th data attributes
data-attribute | default | description
-------------- | ------- | -----------
`data-sortable` | true | whether or not this column is sortable
`data-property` | none | the property name to be used in the sort query
`data-current-sort-direction` | none | the current sort direction of this column
`data-default-sort-direction` | none | the default sort direction of this column


##### pjax-table td data attributes
data-attribute | default | description
-------------- | ------- | -----------
`data-property` | none | the property name for this cell
`data-value` | none | the value for this cell


##### pjax-table pagination data attributes
data-attribute | default | description
-------------- | ------- | -----------
`data-current-page` | defined by pagination markup | the current page 
`data-current-perpage` | defined by pagination markup | the current perpage 


##### pjax-table js options
key | default | description
--- | ------- | -----------
`ajaxOnly` | `data-ajax-only` or false | see `data-ajax-only` option
`pushState` | `data-push-state` or true | see `data-push-state` option
`paginated` | `data-paginated` or true | see `data-paginated` option
`pjaxContainer` | `data-pjax-container or element.id | see `data-pjax-container` option
`noDataTemplate` | see source | a function returning the default template to use for no data returned
`createSortQuery` | { order: 'propert_direction', page: 1 } | a function returning 
the structure of the sort query
`createPaginationQuery` | `{ page: 1 }` | a function returning the structure of the
pagination query
`createSearchQuery` | `{ q: 'query string' }` | a function returning the structure of
the search query

<!-- 
<div data-pjax-table data-auto-init="true"></div>

<table data-total-rows="{{ total_rows }}" 
       data-current-sort-property="{{ current_sort }}"
       data-current-sort-direction="{{ current_page }}">
  <thead>
    <tr>
      <th data-sortable="true"
          data-property="{{ property }}"
          data-current-sort-direction="{{ current_sort_direction }}">
        {{ header_value }}
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-property="{{ property }}"
          data-value="{{ value }}">
        {{ value }}
      </td>
    </tr>
  </tbody>
  <tfoot></tfoot>
</table> -->

#### Pagination
The current pagination markup makes use of bootstrap 3 classes and structure for buttons and dropdowns.
*BS3 is not currently included as a dependency. A base set of styles to make these functional without BS3 may soon be applied. Ideas are welcome.*
```
  <div class="pjax-table-pagination ui-pagination" 
    data-current-page="{{ current_page }}" 
    data-current-perpage="{{ per_page }}">
    <!-- -->
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
    <!-- -->
    <div class="pull-right btn-toolbar">
      {{#if on_last_page }}
        <div class="btn-group">
          <button type="button" class="btn btn-default btn-sm ui-prev-page" {{#if on_first_page }}disabled{{/if}}>
            <i class="fa fa-chevron-left"></i>
          </button>
        </div>
        <!-- -->
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
        <!-- -->
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

