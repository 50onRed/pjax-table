(function ($, window) {
  'use strict'

  // formatting for cells with defined data-format attributes, uses numeral.js
  var displayFormatters = {
    usd: function (val) {
      return numeral(val).format('$0,0.00');
    },
    usd_thousandth: function (val) {
      return numeral(val).format('$0,0.000');
    }
  };

  var sortMap = { asc: 'desc', desc: 'asc' };

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
  *     @param {string} options.search_id  A selector for a search box to be used with the table. 
  *
  *   Data Attribute Params, parameters expected to be included on the table container element for initialization
  *   @param {string}  data-fifty-table-id the table id
  *   @param {string}  data-pjax-url the url to be used for loading the table with pjax
  *   @param {string}  data-pjax-container the selector for the container to be passed to pjax requests
  *   @param {boolean} data-push-state-enabled a flag for whether or not to enable pjax push state
  *   @param {boolean} data-paginated whether or not pagination is enabled
  *
  *   Events which trigger table functionality
  *     submit:search: triggers a table search query when triggered by the element specified in options.search_id
  *     clear:search:  triggers a clearance of the current search query when triggered by the element specified in options.search_id
  *
  *   Events, triggered on the table container element
  *     table:load triggered any time the table has finished loaded, on pjax success for initial load, update, and refresh
  *     table:sort {object}, triggered when a column is sorted, includes direction and property
  *     table:page {number}, triggered when a specific page has been chosen to jump to
  *     table:perpage {number}, triggered when perpage dropdown selection has changed
  *     table:nextpage {number}, triggered when next page in pagination clicked
  *     table:prevpage {number}, triggered when prev page in pagination clicked
  *     table:select {object}, triggered when a row is selected, passing the record object
  *     table:deselect {object}, triggered when a row is deselected, passing the record object
  *     table:select:all {}, triggered when all records are selected using the check all box
  *     table:deselect:all {}, triggered when all records are deselected using the check all box
  *     table:search {object}, triggered when a search query is used to filter the table
  *     table:search:clear {}, triggered when a search query is cleared
  */
  function Table(options) {
    this._options = options || {};
    this._$el = $(this);
    this._$tbody = null;

    var search_id = this._options.search_id || this._$el.data('search-id') || null;
    this._$searchBox = search_id ? $(search_id) : null;

    this._wrapperId = this._$el.data('fifty-table-id');
    this._pjaxURL = this._$el.data('pjax-url') || window.location.pathname;
    this._pjaxContainer = this._$el.data('pjax-container');  //should generally be the same as  $el
    this._pushState = this._$el.data('push-state-enabled');
    this._paginated = this._$el.data('paginated');
    this._totalRows = null;
    
    this._queryState = {};

    this._init();
  }

  $.extend(Table.prototype, {
    createSortQuery: function(property, sort_direction) {
      return {
        order: property + '__' + sort_direction,
        page: 1
      };
    },

    _pjaxForContainer: function() {
      $.pjax({
        url: this._pjaxURL,
        data: this._queryState,
        push: this._pushState,
        container: this._pjaxContainer
      });
    },

    // Syncs the query state with what's being displayed
    _syncQueryState: function() {
      var $wrapper = $('#' + this._wrapperId);
      var $pagination = this._$el.find('.ui-pagination');

      // Sync Pagination
      if(paginated) {
        var page = $pagination.data('current-page');
        var perpage = $pagination.data('current-perpage');
        $.extend(this._queryState, { perpage: perpage });
        $.extend(this._queryState, { page: page });
      }

      // Sync Sorting
      var sort_property = $wrapper.data('current-sort-property');
      var sort_direction = $wrapper.data('current-sort-direction');
      if(sort_property) {
        $.extend(this._queryState, this.createSortQuery(sort_property, sort_direction));
      } else {
        // Remove the sort property/direction from the current query state
        delete this._queryState.order;
      }

      //Sync Search
      var searchQuery = $wrapper.data('current-search-query');
      if (search_query) {
        $.extend(this._queryState, { q: searchQuery });
      }

      // TODO: this may need to be abstracted in the future, unless we bundle the filter builder
      // Sync Custom Filters
      $.extend(this._queryState, $wrapper.data('custom-filters'));
    },

    _onTableLoaded: function() {
      // create this shortcut whenever the table loads
      this._totalRows = $('#' + this._wrapperId).data('total-rows');
      this._$tbody = this._$el.find('tbody');
      
      var numColumns = this.getNumColumns();
      if (!this._totalRows) {
        this._$tbody.html('<tr><td class="empty-table-content" colspan="' + numColumns 
          + '">Whoops! Looks like there\'s nothing in this table!</td></tr>');
      }

      if ($.fn.tooltip) {
        this._$el.find('[data-toggle="tooltip"]').tooltip();
      }
    },

    _onPjaxTimeout: function(e) {
      e.preventDefault(); // prevent retry
    },

    _onPjaxSuccess: function (e, data, status, xhr, options) {
      this._onTableLoaded();
      e.stopPropagation();
      this._$el.trigger('table:load');
    },

    _onPjaxError: function (e, xhr, textStatus, error, options) {
      e.stopPropagation();
    },

    _onClickSortable: function (e) {
      var $sortable = $(e.target).closest('th[data-sortable="true"]');
      var property = $sortable.data('property');
      var sortDirection = sortMap[$sortable.data('current-sort-direction')] || $sortable.data('default-sort-direction');

      this._$el.trigger('table:sort', { direction: sortDirection, property: property });
      $.extend(this._queryState, this.createSortQuery(property, sortDirection));
      this._pjaxForContainer();
    },

    _onPerPageSelect: function (e) {
      var perpage = $(e.currentTarget).data('value');

      this._$el.trigger('table:perpage', { perpage: perpage });
      $.extend(this._queryState, { perpage: perpage, page: 1 }); // reset the page to 1 when changing per page
      this._pjaxForContainer();
    },

    _onPageSelect: function (e) {
      var pageIndex = $(e.currentTarget).data('value');

      this._$el.trigger('table:page', { page: pageIndex });
      $.extend(this._queryState, { page: pageIndex });
      this._pjaxForContainer();
    },

    _onPrevPageSelect: function (e) {
      var pageIndex = parseInt($el.find('.ui-pagination').data('current-page'));

      this._$el.trigger('table:prevpage', { page: pageIndex - 1 });
      $.extend(this._queryState, { page: pageIndex - 1 });
      this._pjaxForContainer();
    },

    _onNextPageSelect: function (e) {
      var pageIndex = parseInt($el.find('.ui-pagination').data('current-page'));

      this._$el.trigger('table:nextpage', { page: pageIndex + 1 });
      $.extend(this._queryState, { page: pageIndex + 1 });
      this._pjaxForContainer();
    },

    _onRowCheckboxSelect: function (e) {
      var $checkbox = $(this);
      var property = $checkbox.parent('th').data('property');

      if ($checkbox.prop('checked')) {
        this._$el.find('td[data-property=' + property + '] input[type="checkbox"]').prop('checked', true);
        this._$tbody.find('tr').addClass('ui-selected');
        this._$el.trigger('select_all:table');
      } else {
        this._$el.find('td[data-property=' + property + '] input[type="checkbox"]').prop('checked', false);
        this._$tbody.find('tr').removeClass('ui-selected');
        this._$el.trigger('deselect_all:table');
      }
    },

    _onClickIdColumn: function(e) {
      $(this).closest('tr').data('shiftKey', e.shiftKey);
    },

    _onRowCheckboxChange: function (e) {
      var $checkbox = $(this);
      var $tr = $(this).closest('tr');
      var record = getRecord($tr.get(0));
      var shift_click_id = this._$el.data('last_selected');

      // handle shift click by selecting everything inbetween
      if (shift_click_id && $tr.data('shiftKey')) {
        this._shiftSelectRows($tr, shift_click_id);
      }
      // always set last selected, whether or not it was checked on or off
      this._$el.data('last_selected', record.id);

      // ignore header check all input for selected state
      if($checkbox.prop('checked')) {
        $tr.addClass('ui-selected');
        this._$el.trigger('table:select', record);
      } else {
        $tr.removeClass('ui-selected');
        this._$el.find('th[data-select-all-enabled="true"] input[type="checkbox"]').prop('checked', false);
        this._$el.trigger('table:deselect', record);
      }
    },

    _shiftSelectRows: function($tr, shift_click_id) {
      var $last_selected_tr = this._$tbody.find('td[data-value="' + shift_click_id + '"]').parent();
      var $all_visible_rows = this._$tbody.find('tr');
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
        if (!$last_selected_tr.hasClass('ui-selected')) {
          $row.removeClass('ui-selected').children().first().find('input').prop('checked', false);
        } else {
          $row.addClass('ui-selected').children().first().find('input').prop('checked', true);
        }
      });
    },

    _onSubmitSearch: function(e, query) {
      this._$el.trigger('table:search', { query: query });
      $.extend(this._queryState, { q: query, page: 1 });
      this._pjaxForContainer();
    },

    _onClearSearch: function(e) {
      this._$el.trigger('table:search:clear');
      $.extend(this._queryState, { q: '', page: 1});
      this._pjaxForContainer();
    },

    /**
    *   Refreshes the configured plugins by applying them to all rows
    *   See docs at top of table module or applyPlugins for plugin defintion details
    */
    refreshPlugins: function() {
      if (this._options.plugins) {
        this._applyPlugins(this._options.plugins);
      }
    },

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
    _applyPlugins: function(pluginDefinitions) {
      $.each(pluginDefinitions, function(index, definition) {
        this._$el.on('click', definition.target, function(e) {
          var $currentTarget = $(e.currentTarget);
          if (!$currentTarget.data('plugin-initialized')) {
            $currentTarget[definition.constructorName]($.extend({}, definition.options, {
              queryState: $.extend({}, this._queryState), // copy
              record: this._getRecord($currentTarget.closest('tr').get(0)) // creates a new object based on DOM attributes
            }));
            $currentTarget.data('plugin-initialized', true);
          }
        }.bind(this));
      }.bind(this));
    },

    _onPluginRefreshEvent: function(e) {
      this.refresh();
    },

    /**
    *   Adds event listeners to the table element ( with filters when provided ) that will trigger refresh
    *   See docs at top of table module for details on the structure of refresh events configuration
    */
    _initPluginRefreshEvents: function() {
      var length;
      var refreshEvent;
      if (this._options.refreshEvents) {
        length = this._options.refreshEvents.length;
        for (var i = 0; i < length; i++) {
          refreshEvent = options.refreshEvents[i];
          if (refreshEvent.filter) {
            this._$el.on(refreshEvent.eventName, refreshEvent.filter, this._onPluginRefreshEvent.bind(this));
          } else {
            this._$el.on(refreshEvent.eventName, this._onPluginRefreshEvent.bind(this));
          }
        }
      }
    },

    _init: function() {
      this._syncQueryState();
      this._onTableLoaded();

      // pjax timing out, we want to cancel the automatic retry
      this._$el.on('pjax:timeout', this._onPjaxTimeout);
      this._$el.on('pjax:success', this._onPjaxSuccess.bind(this));
      this._$el.on('pjax:error', this._onPjaxError);

      this._$el.on('click', 'th[data-sortable="true"]', this._onClickSortable.bind(this));
      this._$el.on('click', '.ui-perpage-dropdown > li', this._onPerPageSelect.bind(this));
      this._$el.on('click', '.ui-page-select-dropdown > li', this._onPageSelect.bind(this));
      this._$el.on('click', '.ui-prev-page', this._onPrevPageSelect.bind(this));
      this._$el.on('click', '.ui-next-page', this._onNextPageSelect.bind(this));
      this._$el.on('change', 
        'th[data-select-all-enabled="true"] input[type="checkbox"]',
        this._onRowCheckboxSelect.bind(this)
      );
      this._$el.on('click', 'td[data-property="id"]', this._onClickIdColumn.bind(this));
      this._$el.on('change', 'input[type="checkbox"]', this._onRowCheckboxChange.bind(this));

      if (this._$searchBox) {
        this._$searchBox.on('submit:search', this._onSubmitSearch.bind(this));
        this._$searchBox.on('clear:search', this._onClearSearch.bind(this));
      }
    
      this.refreshPlugins();
      this._initPluginRefreshEvents();
    },

    /**
    *  Updates parameters and triggers a table refresh
    *  @param {Object} key value pairs to update the query state with
    *  @return {Object} _this, the module instance object
    */
    update: function(data) {
      this.updateParameters(data);
      this._pjaxForContainer();
      return this;
    },

    /**
    *  @return {Object} _this, the module instance object
    */
    refresh: function() {
      this._pjaxForContainer();
      return this;
    },

    /**
    * @return {string} the url used by this table
    */
    getUrl: function() {
      return this._pjaxUrl;
    },

    /**
    *  @param {Object} key value pairs to update the query state with
    *  @return {Object} _this, the module instance object
    */
    updateParameters: function(data) {
      for(var key in data) {
        if(typeof data[key] === 'undefined' || data[key] === null){
          delete this._queryState[key];
        } else {
          this._queryState[key] = data[key];
        }
      }

      return this;
    },

    /**
    *   @param {string|Array.<string>|function} a string key, array of keys, or function to filter
    *   @return {object} _this, the module instance object
    *
    *   Returning true from a filter function will delete the current key in iteration
    */
    removeParameters: function(options) {
      if(!options){
        return this;
      }

      if(typeof options === 'string') {
        // Remove a single item from the queryState
        delete this._queryState[options];
      } else if(Array.isArray(options)) {
        // Remove all of the items in the array
        for (var i = 0; i < options.length; i++) {
          delete this._queryState[options[i]];
        }
      } else if (typeof options === 'function') {
        // deleting while iterating is okay
        $.each(this._queryState, function(key, value) {
          if (options(key, value)) {
            delete this._queryState[key];
          }
        }.bind(this));
      } else {
        throw new Error('Must provide a string or array');
      }

      return this;
    },

    /**
    *  @return {Object} the query state
    */
    getParameters: function(options) {
      var state = $.extend({}, this._queryState);

      if (typeof options === 'function') {
        $.each(state, function(key, value) {
          if (!options(key, value)) {
            delete state[key];
          }
        });
      }

      return state;
    },

    /**
    *   @param {Object} a tr DOM element
    *   @return {Object}
    */
    _getRecord: function(rowEl) {
      var record = { additional_fields: {} };

      $(rowEl).children().each(function () {
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
    },

    /**
    *   Finds a row by id by comparing against the cell with data-propert="id", typically the first cell
    *   @param {number} id the id to match
    *   @return {object} the row DOM element
    */
    _findRowById: function(id) {
      return this._$tbody.find('tr').filter(function (index, rowElement) {
        if (this._getRecord(this).id === id) {
          return true;
        }
        return false;
      }.bind(this)).get(0);
    },

    /**
    *   Updates cell values for a given row, using jQuery.data() which updates them in memory, not on the original element attributes
    *     * Note: for editable cells, and eventually all cells, with appropriate attributes, this will update the cell display value as well
    *   @param {object} the row DOM element
    *   @param {object} the object of key value pairs to match and update
    */
    _updateRowFields: function(row, data, callback) {
      var $row = $(row);
      var $cell;
      var format;

      $.each(data, function (key, value) {
        $cell = $row.find('td[data-property="' + key + '"]');
        $cell.data(key, value);
        format = $cell.data('format');

        if (format) {
          value = displayFormatters[format](value);
        }
        $cell.find($cell.data('display-target')).text(value);

        if (typeof callback === 'function') {
          callback($cell, key, value);
        }
      });
    },

    /**
    *   @return {number} number of rows
    */
    getNumRecords: function() {
      return this._$tbody.find('tr').length;
    },

    /**
    *   @return {number} number of columns
    *   Note: this is only the number of columns in the header.  If subsequent rows include
    *   subheaders, split columns, or columns with colspans other than 1, this will NOT return
    *   the correct number of columns for those rows.
    */
    getNumColumns: function() {
      return this._$el.find('thead tr').children().length;
    },

    /**
    *   @return {boolean} has any selected values
    */
    hasSelected: function() {
      return this._$tbody.find('tr.ui-selected').length > 0;
    },

    /**
    *   @return {number} number of selected rows
    */
    getNumSelected: function() {
      return this._$tbody.find('tr.ui-selected').length;
    },

    /**
    *   @return {Array.<object>} selected records
    */
    getSelected: function(formatFn) {
      return this._$tbody.find('tr.ui-selected').map(function (index, rowElement) {
        if (typeof formatFn === 'function') {
          return formatFn(getRecord(this));
        }
        return this._getRecord(this);
      }.bind(this)).get();
    },

    /**
    * @return {Array.<Numbers>} selected records
    */
    getSelectedIds: function() {
      return this.getSelected().map(function(record) { return record.id; });
    },

    /**
    *   @return {Array.<object>} all records
    */
    getAllRecords: function() {
      return this._$tbody.find('tr').map(function (index, rowElement) {
        return this._getRecord(this);
      }.bind(this)).get();
    },

    /**
    *   Updates cell values for a given row, using jQuery.data() which updates them in memory, not on the original element attributes
    *     * Note: for editable cells, and eventually all cells, with appropriate attributes, this will update the cell display value as well
    *     *       see updateRowFields for more details
    *
    *   @param {number} the id of the row, located in the row's first cell, data-property="id"
    *   @param {Object} and object of key value pairs to update corresponding cell data-property - data-value pairs
    */
    updateRow: function(id, data, callback) {
      this._updateRowFields(this._findRowById(id), data, callback);
    },

    getTotalRows: function() {
      return this._totalRows;
    }
  });


    // init();
    // $.extend(_this, {
    //   update: update,
    //   refresh: refresh,
    //   refreshPlugins: refreshPlugins,
    //   getUrl: getUrl,
    //   updateParameters: updateParameters,
    //   removeParameters: removeParameters,
    //   getParameters: getParameters,
    //   getNumRecords: getNumRecords,
    //   getNumColumns: getNumColumns,
    //   hasSelected: hasSelected,
    //   getNumSelected: getNumSelected,
    //   getSelected: getSelected,
    //   getSelectedIds: getSelectedIds,
    //   getAllRecords: getAllRecords,
    //   applyPlugins: applyPlugins,
    //   updateRow: updateRow,
    //   getTotalRows: getTotalRows
    // });
    // return _this;
    
    // TODO: WIDGET CODE
    // TODO: UPDATE WINDOW TO USE PJAXTABLE ?

  // auto-init tables
  $(function(){ $('[data-fifty-table][data-auto-init]').fiftyTable({}); });
})(jQuery, window);
