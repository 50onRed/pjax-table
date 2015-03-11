# PJAX Table

50's Wrapper for [PJAX](https://github.com/defunkt/jquery-pjax) based tables.

### Features
  - pjax loading with push state
  - ajax loading fallback
  - sorting
  - pagination
    - next, prev, and go to page number
  - search filtering
  - row selection
  - utilities for accesing row data
  - utilities for manipulating rows
  - table cell plugin support

### Defining correct markup for tables
The app server needs to define correct markup and data attributes 
to enable features of pjax tables. Some are required, others optional. 

* data- attributes are required for functionality
* some ui- prefixed classes are required for relative js controls to function
* some classes are required for base css

#### Base Markup
The standard pjax table markup and required data attributes.
```
  <!-- the container that the fifty table script will attach to and replace the contents of with pjax -->
  <div id="my-primary-id" 
    data-pjax-container="#my-primary-id"
    data-pjax-table>
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

