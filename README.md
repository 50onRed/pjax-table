# Fifty PJAX Table

50's Wrapper for [PJAX](https://github.com/defunkt/jquery-pjax) based tables which includes many defaults for 
working tables.

*Tables are under active development. When updating to a new version, make sure to reference the change log for any breaking changes*

### Features
  - pjax loading with push state
  - sorting
  - pagination
    - next, prev, and go to page number
  - search filtering
  - row selection
  - utilities for accesing row data
  - utilities for manipulating rows
  - plugin support

### Defining correct markup for tables
The app server needs to define correct markup and data attributes 
to enable features of pjax tables. Some are required, others optional.

##### Markup
The standard fifity table markup and relative data attributes
```
  <!-- the container that the fifty table script will attach to and replace the contents of with pjax -->
  <div id="my-primary-id"
    data-fifty-table-id="wrapper-id" 
    data-pjax-container="#my-primary-id" 
    data-push-state-enabled="true" 
    data-paginated="true">
    <!-- the table wrapper and the table elements are what the app server should return when the [X-PJAX] request header is present -->
    <!-- current-sort-property and current-sort-direction can be provided to sync with table state -->
    <div id="wrapper-id" 
      data-current-sort-property="{{ current_sort }}"
      data-current-sort-direction="{{ current_page }}">
      <table class="table">
        <thead>
          <!-- header row and header cells -->
          <tr class="fifty-table-header-row">
            <!-- each cell, if defining sortable="true" should include the property name, current, and default sort directions -->
            <th class="fifty-table-header sortable" 
              data-sortable="true"
              data-property="{{ property }}" 
              data-current-sort-direction="{{ current_sort }}" 
              data-default-sort-direction="asc">
              {{ cell_display_value }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- body rows and cells -->
          <tr class="fifty-table-row">
            <!-- to enable access to table data, each cell must define a data-property and data-value -->
            <td class="fifty-table-cell" 
              data-property="{{ property }}" 
              data-value="{{ value }}">
              {{ cell_display_value }}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <!-- footer rows and cells -->
          <tr class="fifty-table-footer-row">
            <td class="fifty-table-footer fifty-table-footer-static-content" colspan="5">
              {{ cell_display_value }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
```

##### Optional markup
For sorting by headers, appropriate data attributes should be included:
```
  <thead>

  </thead>
```

### Dependencies

### Testing

### Building
    // install node dependencies, most notably, gulp and gulp plugins
    npm install

    // install client dependencies
    bower install

    // (default task) cleans and then builds standalone and distributable versions
    gulp

    // run unit tests against build versions in phantomJS with singleRun=true 
    // Pro Tip: don’t forget the Nyan Reporter
    karma start ./path/to/karma.conf.js

    // (patch/minor/major) bump package.json and bower.json versions
    gulp bump-{type}

    // commit the bumped version
    git commit -m "bump version"

    // tag the bumped version in git
    git tag v0.0.1

    // push the bumped version with tags
    git push origin master --tags
