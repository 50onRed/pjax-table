(function ($, Fifty) {
  /**
  *   Table implements script controls for fifty table
  *   * See bottom for table interface
  *
  *   @constructor
  *
  *   @param {object} "this" is the table container element the module is being initialized with
  *   @param {object} options
  *     @param {Array<object>} options.refreshEvents a list of delegated event configurations that should trigger a table refresh.
  *       event listeners are attached at the table container element level, filters are optional.
  *       config example: [{ eventName: 'click', filter: '.my-class-selector' }]
  *     @param {Array<object>} options.plugins a list of jquery prototype based plugin configurations to be intialized and
  *       re-initialized on table load. Plugins are initialized for each row, being passed the row record and current query state.
  *       config example: [{ target: '[data-plugin-element-selector]', constructorName: 'myPlugin'}]
  *     @param {string} options.search_id  A selector for a search box to be used with the table
  *
  *   Data Attribute Params, parameters expected to be included on the table container element for initialization
  *   @param {string}  data-fifty-table-id the table id
  *   @param {string}  data-pjax-url the url to be used for loading the table with pjax
  *   @param {string}  data-pjax-container the selector for the container to be passed to pjax requests
  *   @param {boolean} data-push-state-enabled a flag for whether or not to enable pjax push state
  *   @param {boolean} data-paginated whether or not pagination is enabled
  *
  *   Events, triggered on the table container element
  *     load.table: triggered any time the table has finished loaded, on pjax success for initial load, update, and refresh
  *     sort.table: {object}, triggered when a column is sorted, includes direction and property
  *     page.table: {number}, triggered when a specific page has been chosen to jump to
  *     perpage.table: {number}, triggered when perpage dropdown selection has changed
  *     nextpage.table: {number}, triggered when next page in pagination clicked
  *     prevpage.table: {number}, triggered when prev page in pagination clicked
  *     select.table: {object}, triggered when a row is selected, passing the record object
  *     deselect.table: {object}, triggered when a row is deselected, passing the record object
  *     select_all.table: triggered when all records are selected using the check all box
  *     deselect_all.table: triggered when all records are deselected using the check all box
  *     search.table: {object}, triggered when a search query is used to filter the table
  *     clear_search.table, triggered when a search query is cleared
  */
  function Table (options) {
    var _this = {};
    var options = options || {};
    var $el = $(this);
    var $tbody = null;
    var $searchBox = $('#' + (options.search_id || $el.data('search_id')));
    var $searchFilter = $searchBox.find('input[type="search"]')
    var wrapperId = $el.data('fifty-table-id');
    var pjax_url = $el.data('pjax-url') || window.location.pathname;
    var pjax_container = $el.data('pjax-container');  //should generally be the same as  $el
    var push_state = $el.data('push-state-enabled');
    var paginated = $el.data('paginated');
    var totalRows = null;
    var sortMap = { asc: 'desc', desc: 'asc' };
    var queryState = {};

    // formatting for cells with defined data-format attributes, uses numeral.js
    var displayFormatters = {
      usd: function (val) {
        return numeral(val).format('$0,0.00');
      },
      usd_thousandth: function (val) {
        return numeral(val).format('$0,0.000');
      }
    };

    function createSortQuery (property, sort_direction) {
      return {
        order: property + '__' + sort_direction,
        page: 1
      };
    }

    function pjaxForContainer() {
      $.pjax({
        url: pjax_url,
        data: queryState,
        push: push_state,
        container: pjax_container
      });
    }

    // Syncs the query state with what's being displayed
    function syncQueryState() {
      var $wrapper = $('#' + wrapperId);
      var $pagination = $el.find('.ui-pagination');
      // Sync Pagination
      if(paginated) {
        var page = $pagination.data('current-page');
        var perpage = $pagination.data('current-perpage');
        $.extend(queryState, { perpage: perpage });
        $.extend(queryState, { page: page });
      }

      // Sync Sorting
      var sort_property = $wrapper.data('current-sort-property');
      var sort_direction = $wrapper.data('current-sort-direction');
      if(sort_property) {
        $.extend(queryState, createSortQuery(sort_property, sort_direction));
      } else {
        // Remove the sort property/direction from the current query state
        delete queryState.order;
      }

      //Sync Search
      var search_query = $wrapper.data('current-search-query');
      if (search_query) {
        $.extend(queryState, { q: search_query });
        $searchFilter.val(search_query);
      }

      // TODO: this may need to be abstracted in the future, unless we bundle the filter builder
      // Sync Custom Filters
      $.extend(queryState, $wrapper.data('custom-filters'));
    }

    function onTableLoaded(){
      // create this shortcut whenever the table loads
      totalRows = $('#' + wrapperId).data('total-rows');
      $tbody = $el.find('tbody');

      var numColumns = getNumColumns();
      if (!totalRows) {
        $tbody.html('<tr><td class="empty-table-content" colspan="' + numColumns 
          + '">Whoops! Looks like there\'s nothing in this table!</td></tr>');
      }

      $el.find('[data-toggle="tooltip"]').tooltip();
    }

    function init () {
      syncQueryState();
      onTableLoaded();

      // pjax timing out, we want to cancel the automatic retry
      $el.on('pjax:timeout', function (e) {
        e.preventDefault(); // prevent retry
      });

      $el.on('pjax:success', function (e, data, status, xhr, options) {
        // syncQueryState();
        onTableLoaded();
        e.stopPropagation();
        $el.trigger('load.table');
      });

      $el.on('pjax:error', function (e, xhr, textStatus, error, options) {
        e.stopPropagation();
      });

      // Column Sort
      $el.on('click', 'th[data-sortable="true"]', function (e) {
        var $sortable = $(e.target).closest('th[data-sortable="true"]');
        var property = $sortable.data('property');
        var sort_direction = sortMap[$sortable.data('current-sort-direction')] || $sortable.data('default-sort-direction');

        $el.trigger('sort.table', { direction: sort_direction, property: property });
        $.extend(queryState, createSortQuery(property, sort_direction));
        pjaxForContainer();
      });

      // Perpage Selection
      $el.on('click', '.ui-perpage-dropdown > li', function (e) {
        var perpage = $(e.currentTarget).data('value');

        $el.trigger('perpage.table', { perpage: perpage });
        $.extend(queryState, { perpage: perpage, page: 1 }); // reset the page to 1 when changing per page
        pjaxForContainer();
      });

      // Page Selection
      $el.on('click', '.ui-page-select-dropdown > li', function (e) {
        var page_index = $(e.currentTarget).data('value');

        $el.trigger('page.table', { page: page_index });
        $.extend(queryState, { page: page_index });
        pjaxForContainer();
      });

      // Prev Page Selection
      $el.on('click', '.ui-prev-page', function (e) {
        var page_index = parseInt($el.find('.ui-pagination').data('current-page'));

        $el.trigger('prevpage.table', { page: page_index - 1 });
        $.extend(queryState, { page: page_index - 1 });
        pjaxForContainer();
      });

      // Next Page Selection
      $el.on('click', '.ui-next-page', function (e) {
        var page_index = parseInt($el.find('.ui-pagination').data('current-page'));

        $el.trigger('nextpage.table', { page: page_index + 1 });
        $.extend(queryState, { page: page_index + 1 });
        pjaxForContainer();
      });

      // Row Selection via Checkboxes
      $el.on('change', 'th[data-select-all-enabled="true"] input[type="checkbox"]', function (e) {
        var $checkbox = $(this);
        var property = $checkbox.parent('th').data('property');

        if ($checkbox.prop('checked')) {
          $el.find('td[data-property=' + property + '] input[type="checkbox"]').prop('checked', true);
          $tbody.find('tr').addClass('ui-selected');
          $el.trigger('select_all.table');
        } else {
          $el.find('td[data-property=' + property + '] input[type="checkbox"]').prop('checked', false);
          $tbody.find('tr').removeClass('ui-selected');
          $el.trigger('deselect_all.table');
        }
      });

      // Search 
      $searchFilter.keyup(function (e) {
        // if enter / return
        if (e.which === 13) {
          var query = $(this).val();
          
          $searchFilter.trigger('search.table', { query: query });
          $.extend(queryState, { q: query, page: 1 });
          pjaxForContainer();
        }
        // if esc clear search and load full table
        if (e.keyCode == 27) {
          $searchFilter.trigger('clear_search.table');
          $.extend(queryState, { q: '', page: 1 });
          pjaxForContainer();
        }
      });

      // Search clear
      $searchBox.on('click', '.ui-close', function() {
        $searchFilter.val('');
        $searchFilter.trigger('clear_search.table');
        $.extend(queryState, { q: '', page: 1});
        pjaxForContainer();
      });

      function shiftSelectRows($tr, shift_click_id) {
        var $last_selected_tr = $tbody.find('td[data-value="' + shift_click_id + '"]').parent();
        var $all_visible_rows = $tbody.find('tr');
        var current_selected_index = $all_visible_rows.index($tr);
        var last_selected_index = $all_visible_rows.index($last_selected_tr);
        var start = Math.min(current_selected_index, last_selected_index);
        var end = Math.max(current_selected_index, last_selected_index);
        
        // if selecting from top down, don't process the first one
        if (last_selected_index < current_selected_index && $last_selected_tr.hasClass('ui-selected')) {
          start += 1;
        } else {
          end +=1;
        }

        $all_visible_rows.slice(start, end).each(function() {
          var $row = $(this);
          if ($row.hasClass('ui-selected')) {
            $row.removeClass('ui-selected').children().first().find('input').prop('checked', false);
          } else {
            $row.addClass('ui-selected').children().first().find('input').prop('checked', true);
          }
        });
      }

      $el.on('click', 'td[data-property="id"]', function(e) {
        $(this).closest('tr').data('shiftKey', e.shiftKey);
      });

      // set row class on change to make selected row query easier
      $el.on('change', 'input[type="checkbox"]', function (e) {
        var $checkbox = $(this);
        var $tr = $(this).closest('tr');
        var record = getRecord($tr.get(0));
        var shift_click_id = $el.data('last_selected');

        // handle shift click by selecting everything inbetween
        if (shift_click_id && $tr.data('shiftKey')) {
          shiftSelectRows($tr, shift_click_id);
        }
        // always set last selected, whether or not it was checked on or off
        $el.data('last_selected', record.id);

        // ignore header check all input for selected state
        if($checkbox.prop('checked')) {
          $tr.addClass('ui-selected');
          $el.trigger('table.select', record);
        } else {
          $tr.removeClass('ui-selected');
          $el.find('th[data-select-all-enabled="true"] input[type="checkbox"]').prop('checked', false);
          $el.trigger('table.deselect', record);
        }
      });

      refreshPlugins();
      initRefreshEvents();
    }

    /**
    *   Refreshes the configured plugins by applying them to all rows
    *   See docs at top of table module or applyPlugins for plugin defintion details
    */
    function refreshPlugins() {
      if (options.plugins) {
        applyPlugins(options.plugins);
      }
    }

    /**
    *   Adds event listeners to the table element ( with filters when provided ) that will trigger refresh
    *   See docs at top of table module for details on the structure of refresh events configuration
    */
    function initRefreshEvents() {
      var length;
      var refreshEvent;
      if (options.refreshEvents) {
        length = options.refreshEvents.length;
        for (var i = 0; i < length; i++) {
          refreshEvent = options.refreshEvents[i];
          if (refreshEvent.filter) {
            $el.on(refreshEvent.eventName, refreshEvent.filter, function (e) { refresh(); });
          } else {
            $el.on(refreshEvent.eventName, function (e) { refresh(); });
          }
        }
      }
    }

    /**
    *  Updates parameters and triggers a table refresh
    *  @param {Object} key value pairs to update the query state with
    *  @return {Object} _this, the module instance object
    */
    function update(data) {
      updateParameters(data);
      pjaxForContainer();
      return _this;
    }

    /**
    *  @return {Object} _this, the module instance object
    */
    function refresh() {
      pjaxForContainer();
      return _this;
    }

    /**
    * @return {string} the url used by this table
    */
    function getUrl() {
      return pjax_url;
    }

    /**
    *  @param {Object} key value pairs to update the query state with
    *  @return {Object} _this, the module instance object
    */
    function updateParameters(data) {
      for(var key in data){
        if(typeof data[key] === 'undefined' || data[key] === null){
          delete queryState[key];
        } else {
          queryState[key] = data[key];
        }
      }

      return _this;
    }

    /**
    *   @param {string|Array.<string>|function} a string key, array of keys, or function to filter
    *   @return {object} _this, the module instance object
    *
    *   Returning true from a filter function will delete the current key in iteration
    */
    function removeParameters(options) {
      if(!options){
        return _this;
      }

      if(typeof options === 'string') {
        // Remove a single item from the queryState
        delete queryState[options];
      } else if(Array.isArray(options)) {
        // Remove all of the items in the array
        for (var i = 0; i < options.length; i++) {
          delete queryState[options[i]];
        }
      } else if (typeof options === 'function') {
        // deleting while iterating is okay
        $.each(queryState, function(key, value) {
          if (options(key, value)) {
            delete queryState[key];
          }
        });
      } else {
        throw new Error('Must provide a string or array');
      }

      return _this;
    }

    /**
    *  @return {Object} the query state
    */
    function getParameters(options) {
      var state = $.extend({}, queryState);

      if (typeof options === 'function') {
        $.each(state, function(key, value) {
          if (!options(key, value)) {
            delete state[key];
          }
        });
      }

      return state;
    }

    /**
    *   @param {Object} a tr DOM element
    *   @return {Object}
    */
    function getRecord(row) {
      var record = { additional_fields: {} };

      $(row).children().each(function () {
        var $cell = $(this);
        var data = $cell.data();

        record[data.property] = data.value;

        // add additional fields, ignore constructures and objects / arrays, allow primitives
        $.each($cell.data(), function (key, value) {
          if (key !== 'property' && key !== 'value') {
            if (typeof value !== 'function' && typeof value !== 'object') {
              record.additional_fields[key] = value;
            }
          }
        });
      });
      return record;
    }

    /**
    *   Finds a row by id by comparing against the cell with data-propert="id", typically the first cell
    *   @param {number} id the id to match
    *   @return {object} the row DOM element
    */
    function findRowById(id) {
      return $tbody.find('tr').filter(function (index, rowElement) {
        if (getRecord(this).id === id) {
          return true;
        }

        return false;
      }).get(0);
    }

    /**
    *   Updates cell values for a given row, using jQuery.data() which updates them in memory, not on the original element attributes
    *     * Note: for editable cells, and eventually all cells, with appropriate attributes, this will update the cell display value as well
    *   @param {object} the row DOM element
    *   @param {object} the object of key value pairs to match and update
    */
    function updateRowFields(row, data, callback) {
      var $row = $(row);
      var $cell;
      var format;

      $.each(data, function (key, value) {
        $cell = $row.find('td[data-property="' + key + '"]');
        $cell.data(key, value);
        format = $cell.data('format');

        if (format) {
          value = displayFormatters[format](value)
        }
        $cell.find($cell.data('display-target')).text(value);

        if (typeof callback === "function") {
          callback($cell, key, value);
        }
      });
    }

    /**
    *   @return {number} number of rows
    */
    function getNumRecords () {
      return $tbody.find('tr').length;
    }

    /**
    *   @return {number} number of columns
    *   Note: this is only the number of columns in the header.  If subsequent rows include
    *   subheaders, split columns, or columns with colspans other than 1, this will NOT return
    *   the correct number of columns for those rows.
    */
    function getNumColumns () {
      return $el.find('thead tr').children().length;
    }    


    /**
    *   @return {boolean} has any selected values
    */
    function hasSelected () {
      return $tbody.find('tr.ui-selected').length > 0;
    }

    /**
    *   @return {number} number of selected rows
    */
    function getNumSelected () {
      return $tbody.find('tr.ui-selected').length;
    }

    /**
    *   @return {Array.<object>} selected records
    */
    function getSelected (formatFn) {
      return $tbody.find('tr.ui-selected').map(function (index, rowElement) {
        if (typeof formatFn === 'function') {
          return formatFn(getRecord(this));
        }

        return getRecord(this);
      }).get();
    }

    /**
    * @return {Array.<Numbers>} selected records
    */
    function getSelectedIds () {
      return getSelected().map(function(record) { return record.id; });
    }

    /**
    *   @return {Array.<object>} all records
    */
    function getAllRecords () {
      return $tbody.find('tr').map(function (index, rowElement) {
        return getRecord(this);
      }).get();
    }

    /**
    *   Generic row level plugin initialization, providing the row record as a pojo ( plugins expected to be prototype based )
    *
    *   Notes:
    *     uses extend for the queryState to copy primitives so that the plugin has access to the current table state but cannot directly edit it
    *
    *   @param {Array.<object>}
    *     @param {string} (definition.target) the plugin target selector to be used with find on the row
    *     @param {string} (definition.costructorName) the name of the plugin constructor
    *     @param {object} (definition.options) options to be passed to the plugin (currently is not allowed to override table query state or row record)
    */
    function applyPlugins(pluginDefinitions) {
      $.each(pluginDefinitions, function(index, definition) {

        $el.on('click', definition.target, function(e) {
          var $currentTarget = $(e.currentTarget);
          if (!$currentTarget.data('plugin-initialized')) {
            $currentTarget[definition.constructorName]($.extend({}, definition.options, {
              queryState: $.extend({}, queryState), // copy
              record: getRecord($currentTarget.closest('tr').get(0)) // creates a new object based on DOM attributes
            }));
            $currentTarget.data('plugin-initialized', true);
          }
        });
      });
    }

    /**
    *   Updates cell values for a given row, using jQuery.data() which updates them in memory, not on the original element attributes
    *     * Note: for editable cells, and eventually all cells, with appropriate attributes, this will update the cell display value as well
    *     *       see updateRowFields for more details
    *
    *   @param {number} the id of the row, located in the row's first cell, data-property="id"
    *   @param {Object} and object of key value pairs to update corresponding cell data-property - data-value pairs
    */
    function updateRow (id, data, callback) {
      updateRowFields(findRowById(id), data, callback);
    }

    function getTotalRows() {
      return totalRows;
    }

    init();
    $.extend(_this, {
      update: update,
      refresh: refresh,
      refreshPlugins: refreshPlugins,
      getUrl: getUrl,
      updateParameters: updateParameters,
      removeParameters: removeParameters,
      getParameters: getParameters,
      getNumRecords: getNumRecords,
      getNumColumns: getNumColumns,
      hasSelected: hasSelected,
      getNumSelected: getNumSelected,
      getSelected: getSelected,
      getSelectedIds: getSelectedIds,
      getAllRecords: getAllRecords,
      applyPlugins: applyPlugins,
      updateRow: updateRow,
      getTotalRows: getTotalRows
    });
    return _this;
  }

  Fifty.widget('fiftyTable', Table);
})(jQuery, window.Fifty = window.Fifty || {});

// auto-init tables
$(function(){
  $('[data-fifty-table][data-auto-init]').each(function () {
    $(this).fiftyTable({});
  });
});
