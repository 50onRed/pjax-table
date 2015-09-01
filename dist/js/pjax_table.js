(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var CellPluginMixin = require('./cell_plugin_mixin');

function AjaxMixin(el, options) {
  CellPluginMixin.call(this, el, options);

  this._url = options.url || this._$el.data('url');

  this._save = function save(data) {
    this._$el.trigger('plugin:before:save');

    return $.ajax({
      type: 'POST',
      url: this._url,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(data),
      context: this
    }).done(function (data, textStatus, jqXHR) {
      if (data.status === 'success') {
        this._$el.trigger('plugin:save:success', data);
      } else {
        this._$el.trigger('plugin:save:error', data);
      }
    }).fail(function (jqXHR, textStatus, errorThrown) {
      this._$el.trigger('plugin:save:error', {
        textStatus: textStatus,
        errorThrown: errorThrown,
        jqXHR: jqXHR
      });
    });
  };
}

module.exports = AjaxMixin;

},{"./cell_plugin_mixin":2}],2:[function(require,module,exports){
'use strict';

/**
*   @param {domElement} el the plugin target element reference
*   @param {object} options
*   @param {object} options.queryState: a copy of the table's current query state
*   @param {object} options.record: this table row's record object
*   @param {object} options.event: the click event that triggered plugin construction
*/
function CellPluginMixin(el, options) {
    this._$el = $(el);
    this._initialQueryState = options.queryState;
    this._record = options.record;
    return this;
}

module.exports = CellPluginMixin;

},{}],3:[function(require,module,exports){
'use strict';

/**
*
*/
function SearchBox(el, options) {
  this._$el = $(el);
  this._$searchFilter = this._$el.find('input[type="search"]');

  this._init();
}

SearchBox.prototype._init = function() {
  this._$el.find('.ui-search').click(this._onClickSearch.bind(this));
  this._$el.find('.ui-close').click(this._onClickClose.bind(this));
  this._$searchFilter.keyup(this._onInputKeyup.bind(this));
};

SearchBox.prototype._onClickSearch = function(e) {
  this._$el.trigger('search:submit', this._$searchFilter.val());
};

SearchBox.prototype._onInputKeyup = function(e) {
  this._$el.find('.ui-close').removeClass('hidden');
  if (e.which === 13) {          //enter / return
    this._$el.trigger('search:submit', $(e.currentTarget).val());
  } else if (e.which == 27) {    //escape
    this._clearSearch();
  }
};

SearchBox.prototype._onClickClose = function(e) {
  this._clearSearch();
};

SearchBox.prototype._clearSearch = function(e) {
  this._$searchFilter.val('');
  this._$el.trigger('search:clear');
  this._$el.find('.ui-close').addClass('hidden');
};

module.exports = SearchBox;

},{}],4:[function(require,module,exports){
'use strict';
var SearchBox = require('./search_box');
var slice = Array.prototype.slice;

$.fn.pjaxTableSearch = function(options) {
  var args = slice.call(arguments);
  var values = []; // return values

  $(this).each(function() {
    // get the current instance or create a new one
    var $el = $(this);
    var widget = $el.data('pjaxTableSearch');
    var methodReturn;

    if (!widget) {
      widget = $el.data('pjaxTableSearch', new SearchBox(this, options)).data('pjaxTableSearch');
    }

    // execute methods and return the method return or this element for chaining
    if (typeof options === 'string') {
      // special case for resetting widgets, cleanup and reset
      if (options === 'destroy') {
        if (typeof widget.destroy === 'function') {
          widget.destroy();
        }
        delete $el.data().pjaxTableSearch;
      } else if (typeof widget[options] === 'function' && options.charAt(0) !== '_') {
        methodReturn = widget[options].apply(widget, args.slice(1, args.length));
        values.push(methodReturn);
      } else {
        throw new Error('Invalid method: ' + options);
      }
    } else {
      values.push(widget);
    }
  });

  // return only 1 value if possible
  return values.length > 1 ? values : values[0];
};

// Auto init search boxes
$(function() { $('[data-pjax-table-search][data-auto-init="true"]').pjaxTableSearch({}); });

},{"./search_box":3}],5:[function(require,module,exports){
'use strict';
var PjaxTable = require('./table');
var slice = Array.prototype.slice;

// expose as jquery plugin
$.fn.pjaxTable = function(options) {
  var args = slice.call(arguments);
  var values = []; // return values

  $(this).each(function() {
    // get the current instance or create a new one
    var $el = $(this);
    var widget = $el.data('pjaxTable');
    var methodReturn;

    if (!widget) {
      widget = $el.data('pjaxTable', new PjaxTable(this, options)).data('pjaxTable');
    }

    // execute methods and return the method return or this element for chaining
    if (typeof options === 'string') {
      // special case for resetting widgets, cleanup and reset
      if (options === 'destroy') {
        if (typeof widget.destroy === 'function') {
          widget.destroy();
        }
        delete $el.data().pjaxTable;
      } else if (typeof widget[options] === 'function' && options.charAt(0) !== '_') {
        methodReturn = widget[options].apply(widget, args.slice(1, args.length));
        values.push(methodReturn);
      } else {
        throw new Error('Invalid method: ' + options);
      }
    } else {
      values.push(widget);
    }
  });

  // return only 1 value if possible
  return values.length > 1 ? values : values[0];
};

// expose construtor globally
window.PjaxTable = PjaxTable;

// auto-init tables
$(function(){ $('[data-pjax-table][data-auto-init]').pjaxTable(window.PjaxTableConfig = window.PjaxTableConfig || {}); });

},{"./table":6}],6:[function(require,module,exports){
'use strict';

/**
*   Table implements script controls for pjax table
*   "_" prefixed methods are considered internal usage only
*
*   @constructor
*
*   @param {object} el is the table container element the module is being initialized with
*   @param {object} options
*     @param {string} options.url the url to be used for fetching table markup
*     @param {Array<object>} options.refreshEvents a list of delegated event configurations that should trigger a table refresh.
*       event listeners are attached at the table container element level, filters are optional.
*       config example: [{ eventName: 'click', filter: '.my-class-selector' }]
*     @param {Array<object>} options.plugins a list of jQuery prototype based plugin configurations to be intialized and
*       re-initialized on table load. Plugins are initialized for each row, being passed the row record and current query state.
*       config example: [{ target: '[data-plugin-element-selector]', constructorName: 'myPlugin'}]
*     @param {boolean} options.ajaxOnly Flag for ajax only ( disabled by default )
*     @param {boolean} options.pushState Passes the push state flag to pjax ( push state enabled by default )
*     @param {boolean} options.paginated Flag for pagination ( enabled by default )
*     @param {string} options.pjaxContainer ID Selector for the pjax container, defaults to the initializing
*       element's id attribute
*     @param {Function} options.noDataTemplate A function to be used for creating the no data message
*     @param {string} options.searchId  A selector for a search box to be used with the table.
*     @param {string} options.sortQueryKey The key to be used in creating the sort query string
*     @param {string} options.pageQueryKey The key to be used in creating the page query string
*     @param {string} options.perPageQueryKey The key to be used in creating the per page query string
*     @param {string} options.searchQueryKey The key to be used in creating the search query string
*     @param {object} options.queryState an optional query state to extend with on initialization
*
*   Data Attribute Params, parameters expected to be included on the table container element for initialization
*   @param {string} data-url the url to be used for fetching table markup
*   @param {string} data-pjax-container the selector for the container to be passed to pjax requests
*   @param {boolean} data-ajax-only whether to not to disable pjax and enable ajax
*   @param {boolean} data-push-state a flag for whether or not to enable pjax push state
*   @param {boolean} data-paginated whether or not pagination is enabled
*   @param {string} data-search-id an optional search control element id
*   @param {string} data-sort-query-key the string key to be used in building the search query
*   @param {string} data-page-query-key the string key to be used in building the page query
*   @param {string} data-perpage-query-key the string key to be used in building the perpage query
*   @param {string} data-search-query-key the string key to be used in building the search query
*   @param {number} data-current-page the current page number
*   @param {number} data-current-perpage the current perpage number
*
*   Notes on search module:
*     Events which are registered within the table
*     search:submit triggers a table search query when triggered by the element specified in options.search_id
*     search:clear triggers a clearance of the current search query when triggered by the element specified in options.search_id
*
*   Events, triggered by the table on the table container element
*   @fires table:load - triggered any time the table has finished loading, including on successful initial load, update, or refresh
*   @fires table:sort {object} triggered when a column is sorted, includes direction and property
*   @fires table:page {object} triggered when a specific page has been chosen to jump to
*   @fires table:perpage {object} triggered when perpage dropdown selection has changed
*   @fires table:nextpage {object} triggered when next page in pagination clicked
*   @fires table:prevpage {object} triggered when prev page in pagination clicked
*   @fires table:select {object} triggered when a row is selected, passing the record object
*   @fires table:deselect {object} triggered when a row is deselected, passing the record object
*   @fires table:select:all - triggered when all records are selected using the check all box
*   @fires table:deselect:all - triggered when all records are deselected using the check all box
*   @fires table:shiftselect - triggered when a shift select is completed
*   @fires table:search {object} triggered when a search query is used to filter the table
*   @fires table:search:clear - triggered when a search query is cleared
*   @fires table:error - triggered when a pjax / ajax error occurs
*   @fires table:timeout - triggered when pjax times out
*/
function PjaxTable(el, options) {
  this._options = options || {};
  this._$el = $(el);
  this._$tbody = null;

  this._url = this._options.url || this._$el.data('pjax-url') || window.location.pathname;

  if (this._options.ajaxOnly !== undefined) {
    this._ajaxOnly = this._options.ajaxOnly;
  } else {
    this._ajaxOnly = this._$el.data('ajax-only') || false;
  }
  if (this._options.pushState !== undefined) {
    this._pushState = this._options.pushState;
  } else {
    this._pushState = this._$el.data('push-state') || true;
  }
  if (this._options.paginated !== undefined) {
    this._paginated = this._options.paginated;
  } else {
    this._paginated = this._$el.data('paginated') || true;
  }

  this._pjaxContainer = this._options.pjaxContainer || this._$el.data('pjax-container') || this._$el.attr('id');
  this._noDataTemplate = this._options.noDataTemplate || this._noDataTemplate;
  this._sortQueryKey = this._options.sortQueryKey || this._$el.data('sort-query-key') || 'order';
  this._pageQueryKey = this._options.pageQueryKey || this._$el.data('page-query-key') || 'page';
  this._perPageQueryKey = this._options.perPageQueryKey || this._$el.data('perpage-query-key') || 'perpage';
  this._searchQueryKey = this._options.searchQueryKey || this._$el.data('search-query-key') || 'q';
  this._querySyncFn = this._options.querySyncFn || null;

  this._totalRows = null;

  var searchId = this._options.searchId || this._$el.data('search-id') || null;
  this._$searchBox = searchId ? $(searchId) : null;

  this._sortMap = { asc: 'desc', desc: 'asc' };
  this._queryState = $.extend({}, this._options.queryState);

  this._init();
}

$.extend(PjaxTable.prototype, {

  _noDataTemplate: function(numColumns) {
    return [
      '<tr>',
        '<td class="empty-table-content" colspan="' + numColumns + '">',
          'Whoops! Looks like there\'s nothing in this table!',
        '</td>',
      '</tr>'
    ].join('');
  },

  _createSortQuery: function(property, direction) {
    var query = {};
    query[this._sortQueryKey] = property + '__' + direction;
    return query;
  },

  _desyncSort: function() {
    delete this._queryState[this._sortQueryKey];
  },

  _createPageQuery: function(page) {
    var query = {};
    query[this._pageQueryKey] = page;
    return query;
  },

  _createPerPageQuery: function(perpage) {
    var query = {};
    query[this._perPageQueryKey] = perpage;
    return query;
  },

  _createSearchQuery: function(searchStr) {
    var query = {};
    query[this._searchQueryKey] = searchStr;
    return query;
  },

  _desyncSearch: function() {
    delete this._queryState[this._searchQueryKey];
  },

  _syncSort: function(property, direction) {
    $.extend(this._queryState, this._createSortQuery(property, direction));
  },

  _syncPage: function(page) {
    $.extend(this._queryState, this._createPageQuery(page));
  },

  _syncPerPage: function(perpage) {
    $.extend(this._queryState, this._createPerPageQuery(perpage));
  },

  _syncSearch: function(searchStr) {
    $.extend(this._queryState, this._createSearchQuery(searchStr));
  },

  _load: function(params) {
    if (!this._ajaxOnly) {
      return $.pjax($.extend({
        url: this._url,
        data: this._queryState,
        push: this._pushState,
        container: this._pjaxContainer
      }, params));
    }

    this._addLoadMask();
    return $.ajax($.extend({
      type: 'GET',
      url: this._url,
      data: this._queryState,
      context: this
    }, params))
    .done(this._onAjaxSuccess)
    .fail(this._onAjaxError);
  },

  _addLoadMask: function() {
    var $loadMask = $('<div class="ui-load-mask">');
    this._$el.css({ position: 'relative' });
    this._$el.append($loadMask);
    $loadMask.spin(this._options.loadMaskConfig || 'small');
  },

  _removeLoadMask: function() {
    this._$el.find('.ui-load-mask').remove();
    this._$el.css({ position: '' });
  },

  // Syncs the query state with what's being displayed
  _syncQueryState: function() {
    var $table = this._$el.find('table');
    var page = $table.data('current-page');
    var perpage = $table.data('current-perpage');
    var sortProperty = $table.data('current-sort-property');
    var sortDirection = $table.data('current-sort-direction');
    var searchStr = $table.data('current-search-str');

    if (this._paginated) {
      this._syncPage(page);
      this._syncPerPage(perpage);
    }

    if (sortProperty) {
      this._syncSort(sortProperty, sortDirection);
    } else {
      this._desyncSort();
    }

    if (searchStr) {
      this._syncSearch(searchStr);
    } else {
      this._desyncSearch();
    }

    if (typeof this._querySyncFn === 'function') {
      $.extend(this._queryState, this._querySyncFn($table))
    }
  },

  _onTableLoaded: function() {
    // create this shortcut whenever the table loads
    this._$tbody = this._$el.find('tbody');

    var totalRows = this._$el.find('table').data('total-rows');
    this._totalRows = totalRows | 0;

    if (this._totalRows === 0) {
      this._$tbody.html(this._noDataTemplate(this.getNumColumns()));
    }

    this._$el.trigger('table:load');
  },

  _onAjaxSuccess: function(data, textStatus, jqXHR) {
    this._$el.html(data);
    this._onTableLoaded();
    this._removeLoadMask();
  },

  _onAjaxError: function(jqXHR, textStatus, errorThrown) {
    this._removeLoadMask();
    this._$el.trigger('table:error');
  },

  _onPjaxStart: function(e) {
    this._addLoadMask();
  },

  _onPjaxBeforeReplace: function(e) {
    e.stopPropagation();
    this._removeLoadMask();
  },

  _onPjaxTimeout: function(e) {
    e.preventDefault(); // prevent retry
    this._$el.trigger('table:timeout');
  },

  _onPjaxSuccess: function (e, data, status, xhr, options) {
    this._onTableLoaded();
    e.stopPropagation();
  },

  _onPjaxError: function (e, xhr, textStatus, error, options) {
    e.stopPropagation();
    e.preventDefault(); // prevent retry
    this._removeLoadMask();
    this._$el.trigger('table:error');
  },

  _onClickSortable: function (e) {
    var $sortable = $(e.target).closest('th[data-sortable="true"]');
    var property = $sortable.data('property');
    var direction = this._sortMap[$sortable.data('current-sort-direction')] || $sortable.data('default-sort-direction');

    this._$el.trigger('table:sort', this._createSortQuery(property, direction));
    this._syncSort(property, direction);
    this._syncPage(1); // reset the page to 1 when changing sort
    this._load();
  },

  _onPerPageSelect: function (e) {
    var perpage = $(e.currentTarget).data('value');

    this._$el.trigger('table:perpage', this._createPerPageQuery(perpage));
    this._syncPerPage(perpage);
    this._syncPage(1); // reset the page to 1 when changing per page
    this._load();
  },

  _onPageSelect: function (e) {
    var pageIndex = $(e.currentTarget).data('value');

    this._$el.trigger('table:page', this._createPageQuery(pageIndex));
    this._syncPage(pageIndex);
    this._load();
  },

  _onPrevPageSelect: function (e) {
    var pageIndex = parseInt(this._$el.find('table').data('current-page'));
    var prevPageIndex = Math.max(1, pageIndex - 1);

    this._$el.trigger('table:prevpage', this._createPageQuery(prevPageIndex));
    this._syncPage(prevPageIndex);
    this._load();
  },

  _onNextPageSelect: function (e) {
    var pageIndex = parseInt(this._$el.find('table').data('current-page'));
    var nextPageIndex = pageIndex + 1;

    this._$el.trigger('table:nextpage', this._createPageQuery(nextPageIndex));
    this._syncPage(nextPageIndex);
    this._load();
  },

  _onHeaderCheckboxChange: function (e) {
    var $checkbox = $(e.currentTarget);
    var property = $checkbox.parent('th').data('property');

    this._disableRowCheckboxChangeHandling();

    if ($checkbox.prop('checked')) {
      this._$el.find('td[data-property=' + property + '] input[type="checkbox"]').prop('checked', true);
      this._$tbody.find('tr').addClass('ui-selected');
      this._$el.trigger('table:select:all');
    } else {
      this._$el.find('td[data-property=' + property + '] input[type="checkbox"]').prop('checked', false);
      this._$tbody.find('tr').removeClass('ui-selected');
      this._$el.trigger('table:deselect:all');
    }

    this._enableRowCheckboxChangeHandling();
  },

  _onClickIdColumn: function(e) {
    $(this).closest('tr').data('shiftKey', e.shiftKey);
  },

  _onRowCheckboxChange: function (e) {
    var $checkbox = $(e.currentTarget);
    var $tr = $(e.currentTarget).closest('tr');
    var record = this._getRecord($tr.get(0));
    var shiftClickId = this._$el.data('last_selected');

    // handle shift click by selecting everything inbetween
    if (shiftClickId && $tr.data('shiftKey')) {
      this._disableRowCheckboxChangeHandling();
      this._shiftSelectRows($tr, shiftClickId);
      this._enableRowCheckboxChangeHandling();
    }

    // always set last selected, whether or not it was checked on or off
    this._$el.data('last_selected', record.id);

    // ignore header check all input for selected state
    if ($checkbox.prop('checked')) {
      $tr.addClass('ui-selected');
      this._$el.trigger('table:select', record);
    } else {
      $tr.removeClass('ui-selected');
      this._$el.find('th[data-select-all-enabled="true"] input[type="checkbox"]').prop('checked', false);
      this._$el.trigger('table:deselect', record);
    }
  },

  _shiftSelectRows: function($tr, shiftClickId) {
    var $lastSelectedTr = this._$tbody.find('td[data-property="id"][data-value="' + shiftClickId + '"]').parent();
    var $allVisibleRows = this._$tbody.find('tr');
    var currentSelectedIndex = $allVisibleRows.index($tr);
    var lastSelectedIndex = $allVisibleRows.index($lastSelectedTr);
    var start = Math.min(currentSelectedIndex, lastSelectedIndex);
    var end = Math.max(currentSelectedIndex, lastSelectedIndex);

    // if selecting from top down, don't process the first one
    if (lastSelectedIndex < currentSelectedIndex && $lastSelectedTr.hasClass('ui-selected')) {
      ++start;
    }
    ++end;

    $allVisibleRows.slice(start, end).each(function() {
      var $row = $(this);
      if (!$lastSelectedTr.hasClass('ui-selected')) {
        $row.removeClass('ui-selected').children().first().find('input').prop('checked', false);
      } else {
        $row.addClass('ui-selected').children().first().find('input').prop('checked', true);
      }
    });

    this._$el.trigger('table:shiftselect');
  },

  _onSubmitSearch: function(e, searchStr) {
    this._$el.trigger('table:search', this._createSearchQuery(searchStr));
    this._syncSearch(searchStr);
    this._syncPage(1);
    this._load();
  },

  _onClearSearch: function(e) {
    this._$el.trigger('table:search:clear');
    this._desyncSearch();
    this._syncPage(1);
    this._load();
  },

  /**
  *   Generic row level plugin initialization, providing the row record as a pojo ( plugins expected to be prototype based )
  *
  *   Notes:
  *     uses extend for the queryState to copy primitives so that the plugin has access to the current table state but cannot directly edit it
  *
  *   @param {Array.<object>}
  *     @param {string} (definition.target) the plugin target selector to be used with find on the row
  *     @param {string} (definition.constructorName) the name of the plugin constructor
  *     @param {object} (definition.options) options to be passed to the plugin (currently is not allowed to override table query state or row record)
  */
  _applyPlugins: function(pluginDefinitions) {
    $.each(pluginDefinitions, function(index, definition) {
      this._$el.on('click', definition.target, function(e) {
        var $currentTarget = $(e.currentTarget);
        if (!$currentTarget.data('plugin-initialized')) {
          $currentTarget[definition.constructorName]($.extend({}, definition.options, {
            queryState: $.extend({}, this._queryState), // copy
            record: this._getRecord($currentTarget.closest('tr').get(0)), // creates a new object based on DOM attributes
            event: e
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
        refreshEvent = this._options.refreshEvents[i];
        if (refreshEvent.filter) {
          this._$el.on(refreshEvent.eventName, refreshEvent.filter, this._onPluginRefreshEvent.bind(this));
        } else {
          this._$el.on(refreshEvent.eventName, this._onPluginRefreshEvent.bind(this));
        }
      }
    }
  },

  /**
  *  Enable / Disable change handling methods are used by select all to prevent each
  *  individual row from firing change events
  */
  _enableRowCheckboxChangeHandling: function() {
    this._checkboxChangeHandler = this._onRowCheckboxChange.bind(this);
    this._$el.on('change', 'td[data-property="id"] input[type="checkbox"]', this._checkboxChangeHandler);
  },

  _disableRowCheckboxChangeHandling: function() {
    this._$el.off('change', 'td[data-property="id"] input[type="checkbox"]', this._checkboxChangeHandler);
    this._checkboxChangeHandler = null;
  },

  _init: function() {
    this._syncQueryState();
    this._onTableLoaded();

    // pjax timing out, we want to cancel the automatic retry
    this._$el.on('pjax:timeout', this._onPjaxTimeout.bind(this));
    this._$el.on('pjax:success', this._onPjaxSuccess.bind(this));
    this._$el.on('pjax:start', this._onPjaxStart.bind(this));
    this._$el.on('pjax:beforeReplace', this._onPjaxBeforeReplace.bind(this));
    this._$el.on('pjax:error', this._onPjaxError.bind(this));

    this._$el.on('click', 'th[data-sortable="true"]', this._onClickSortable.bind(this));
    this._$el.on('click', '.ui-perpage-dropdown > li', this._onPerPageSelect.bind(this));
    this._$el.on('click', '.ui-page-select-dropdown > li', this._onPageSelect.bind(this));
    this._$el.on('click', '.ui-prev-page', this._onPrevPageSelect.bind(this));
    this._$el.on('click', '.ui-next-page', this._onNextPageSelect.bind(this));
    this._$el.on('change',
      'th[data-select-all-enabled="true"] input[type="checkbox"]',
      this._onHeaderCheckboxChange.bind(this)
    );
    this._enableRowCheckboxChangeHandling();
    this._$el.on('click', 'td[data-property="id"]', this._onClickIdColumn.bind(this));

    if (this._$searchBox) {
      this._$searchBox.on('search:submit', this._onSubmitSearch.bind(this));
      this._$searchBox.on('search:clear', this._onClearSearch.bind(this));
    }

    this.refreshPlugins();
    this._initPluginRefreshEvents();
  },

  /**
  *   @param {Object} a tr DOM element
  *   @return {Object}
  */
  _getRecord: function(rowEl) {
    var record = { additionalFields: {} };

    $(rowEl).children().each(function () {
      var $cell = $(this);
      var data = $cell.data();
      record[data.property] = data.value;

      // add additional fields, ignore constructures and objects / arrays, allow primitives
      $.each($cell.data(), function (key, value) {
        if (key !== 'property' && key !== 'value') {
          if (typeof value !== 'function' && typeof value !== 'object') {
            record.additionalFields[key] = value;
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
      if (this._getRecord(rowElement).id === id) {
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

    $.each(data, function (key, value) {
      var $cell = $row.find('td[data-property="' + key + '"]');
      $cell.data('value', value);
      $cell.find($cell.data('display-target')).text(value);

      if (typeof callback === 'function') {
        callback($cell, key, value);
      }
    });
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
  *  Updates parameters and triggers a table refresh
  *  @param {Object} key value pairs to update the query state with
  *  @param {Object} key value pairs to be used by load
  *  @return {Object} _this, the module instance object
  */
  update: function(data, loadParams) {
    this.updateParameters(data);
    this._load(loadParams);
    return this;
  },

  /**
  *  @param {Object} key value pairs to be used by load
  *  @return {Object} _this, the module instance object
  */
  load: function(loadParams) {
    this._load(loadParams);
    return this;
  },

  /**
  *  @return {Object} _this, the module instance object
  */
  refresh: function() {
    this._load();
    return this;
  },

  /**
  * @return {string} the url used by this table
  */
  getUrl: function() {
    return this._url;
  },

  /**
  *  @param {Object} key value pairs to update the query state with
  *  @return {Object} _this, the module instance object
  */
  updateParameters: function(data) {
    for (var key in data) {
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
    if (!options || (Array.isArray(options) && !options.length)) {
      return this;
    }

    if (typeof options === 'string') {
      // Remove a single item from the queryState
      delete this._queryState[options];
    } else if (Array.isArray(options)) {
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
  hasSelectedRecords: function() {
    return this._$tbody.find('tr.ui-selected').length > 0;
  },

  /**
  *   @return {number} number of selected rows
  */
  getNumSelectedRecords: function() {
    return this._$tbody.find('tr.ui-selected').length;
  },

  /**
  *   @return {Array.<object>} selected records
  */
  getSelectedRecords: function(formatFn) {
    return this._$tbody.find('tr.ui-selected').map(function (index, rowElement) {
      if (typeof formatFn === 'function') {
        return formatFn(this._getRecord(rowElement));
      }
      return this._getRecord(rowElement);
    }.bind(this)).get();
  },

  /**
  * @return {Array.<Numbers>} selected records
  */
  getSelectedRecordIds: function() {
    return this.getSelectedRecords(function(record) { return record.id; });
  },

  /**
  *   @return {Array.<object>} all records
  */
  getRecords: function() {
    return this._$tbody.find('tr').map(function (index, rowElement) {
      return this._getRecord(rowElement);
    }.bind(this)).get();
  },

  /**
  *   Updates cell values for a given row, using jQuery.data() which updates them in memory, not on the original element attributes
  *     * Note: for editable cells, and eventually all cells, with appropriate attributes, this will update the cell display value as well
  *     *       see updateRowFields for more details
  *
  *   @param {number} the id of the row, located in the row's first cell, data-property="id"
  *   @param {Object} and object of key value pairs to update corresponding cell data-property - data-value pairs
  *   @param {function} a callback to process the row
  */
  updateRow: function(id, data, callback) {
    this._updateRowFields(this._findRowById(id), data, callback);
  },

  getNumTotalRows: function() {
    return this._totalRows;
  }
});

module.exports = PjaxTable;

},{}]},{},[5,4,2,1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2VsbF9wbHVnaW5zL2FqYXhfbWl4aW4uanMiLCJzcmMvanMvY2VsbF9wbHVnaW5zL2NlbGxfcGx1Z2luX21peGluLmpzIiwic3JjL2pzL2V4dGVybmFsX3BsdWdpbnMvc2VhcmNoX2JveC5qcyIsInNyYy9qcy9leHRlcm5hbF9wbHVnaW5zL3NlYXJjaF9wbHVnaW4uanMiLCJzcmMvanMvcGpheF90YWJsZS5qcyIsInNyYy9qcy90YWJsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciBDZWxsUGx1Z2luTWl4aW4gPSByZXF1aXJlKCcuL2NlbGxfcGx1Z2luX21peGluJyk7XG5cbmZ1bmN0aW9uIEFqYXhNaXhpbihlbCwgb3B0aW9ucykge1xuICBDZWxsUGx1Z2luTWl4aW4uY2FsbCh0aGlzLCBlbCwgb3B0aW9ucyk7XG5cbiAgdGhpcy5fdXJsID0gb3B0aW9ucy51cmwgfHwgdGhpcy5fJGVsLmRhdGEoJ3VybCcpO1xuXG4gIHRoaXMuX3NhdmUgPSBmdW5jdGlvbiBzYXZlKGRhdGEpIHtcbiAgICB0aGlzLl8kZWwudHJpZ2dlcigncGx1Z2luOmJlZm9yZTpzYXZlJyk7XG5cbiAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgIHR5cGU6ICdQT1NUJyxcbiAgICAgIHVybDogdGhpcy5fdXJsLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgICAgIGNvbnRleHQ6IHRoaXNcbiAgICB9KS5kb25lKGZ1bmN0aW9uIChkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUikge1xuICAgICAgaWYgKGRhdGEuc3RhdHVzID09PSAnc3VjY2VzcycpIHtcbiAgICAgICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3BsdWdpbjpzYXZlOnN1Y2Nlc3MnLCBkYXRhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuXyRlbC50cmlnZ2VyKCdwbHVnaW46c2F2ZTplcnJvcicsIGRhdGEpO1xuICAgICAgfVxuICAgIH0pLmZhaWwoZnVuY3Rpb24gKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuICAgICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3BsdWdpbjpzYXZlOmVycm9yJywge1xuICAgICAgICB0ZXh0U3RhdHVzOiB0ZXh0U3RhdHVzLFxuICAgICAgICBlcnJvclRocm93bjogZXJyb3JUaHJvd24sXG4gICAgICAgIGpxWEhSOiBqcVhIUlxuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWpheE1peGluO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiogICBAcGFyYW0ge2RvbUVsZW1lbnR9IGVsIHRoZSBwbHVnaW4gdGFyZ2V0IGVsZW1lbnQgcmVmZXJlbmNlXG4qICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiogICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5xdWVyeVN0YXRlOiBhIGNvcHkgb2YgdGhlIHRhYmxlJ3MgY3VycmVudCBxdWVyeSBzdGF0ZVxuKiAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnJlY29yZDogdGhpcyB0YWJsZSByb3cncyByZWNvcmQgb2JqZWN0XG4qICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuZXZlbnQ6IHRoZSBjbGljayBldmVudCB0aGF0IHRyaWdnZXJlZCBwbHVnaW4gY29uc3RydWN0aW9uXG4qL1xuZnVuY3Rpb24gQ2VsbFBsdWdpbk1peGluKGVsLCBvcHRpb25zKSB7XG4gICAgdGhpcy5fJGVsID0gJChlbCk7XG4gICAgdGhpcy5faW5pdGlhbFF1ZXJ5U3RhdGUgPSBvcHRpb25zLnF1ZXJ5U3RhdGU7XG4gICAgdGhpcy5fcmVjb3JkID0gb3B0aW9ucy5yZWNvcmQ7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2VsbFBsdWdpbk1peGluO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbipcbiovXG5mdW5jdGlvbiBTZWFyY2hCb3goZWwsIG9wdGlvbnMpIHtcbiAgdGhpcy5fJGVsID0gJChlbCk7XG4gIHRoaXMuXyRzZWFyY2hGaWx0ZXIgPSB0aGlzLl8kZWwuZmluZCgnaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpO1xuXG4gIHRoaXMuX2luaXQoKTtcbn1cblxuU2VhcmNoQm94LnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl8kZWwuZmluZCgnLnVpLXNlYXJjaCcpLmNsaWNrKHRoaXMuX29uQ2xpY2tTZWFyY2guYmluZCh0aGlzKSk7XG4gIHRoaXMuXyRlbC5maW5kKCcudWktY2xvc2UnKS5jbGljayh0aGlzLl9vbkNsaWNrQ2xvc2UuYmluZCh0aGlzKSk7XG4gIHRoaXMuXyRzZWFyY2hGaWx0ZXIua2V5dXAodGhpcy5fb25JbnB1dEtleXVwLmJpbmQodGhpcykpO1xufTtcblxuU2VhcmNoQm94LnByb3RvdHlwZS5fb25DbGlja1NlYXJjaCA9IGZ1bmN0aW9uKGUpIHtcbiAgdGhpcy5fJGVsLnRyaWdnZXIoJ3NlYXJjaDpzdWJtaXQnLCB0aGlzLl8kc2VhcmNoRmlsdGVyLnZhbCgpKTtcbn07XG5cblNlYXJjaEJveC5wcm90b3R5cGUuX29uSW5wdXRLZXl1cCA9IGZ1bmN0aW9uKGUpIHtcbiAgdGhpcy5fJGVsLmZpbmQoJy51aS1jbG9zZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgaWYgKGUud2hpY2ggPT09IDEzKSB7ICAgICAgICAgIC8vZW50ZXIgLyByZXR1cm5cbiAgICB0aGlzLl8kZWwudHJpZ2dlcignc2VhcmNoOnN1Ym1pdCcsICQoZS5jdXJyZW50VGFyZ2V0KS52YWwoKSk7XG4gIH0gZWxzZSBpZiAoZS53aGljaCA9PSAyNykgeyAgICAvL2VzY2FwZVxuICAgIHRoaXMuX2NsZWFyU2VhcmNoKCk7XG4gIH1cbn07XG5cblNlYXJjaEJveC5wcm90b3R5cGUuX29uQ2xpY2tDbG9zZSA9IGZ1bmN0aW9uKGUpIHtcbiAgdGhpcy5fY2xlYXJTZWFyY2goKTtcbn07XG5cblNlYXJjaEJveC5wcm90b3R5cGUuX2NsZWFyU2VhcmNoID0gZnVuY3Rpb24oZSkge1xuICB0aGlzLl8kc2VhcmNoRmlsdGVyLnZhbCgnJyk7XG4gIHRoaXMuXyRlbC50cmlnZ2VyKCdzZWFyY2g6Y2xlYXInKTtcbiAgdGhpcy5fJGVsLmZpbmQoJy51aS1jbG9zZScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2VhcmNoQm94O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIFNlYXJjaEJveCA9IHJlcXVpcmUoJy4vc2VhcmNoX2JveCcpO1xudmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG4kLmZuLnBqYXhUYWJsZVNlYXJjaCA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gIHZhciB2YWx1ZXMgPSBbXTsgLy8gcmV0dXJuIHZhbHVlc1xuXG4gICQodGhpcykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAvLyBnZXQgdGhlIGN1cnJlbnQgaW5zdGFuY2Ugb3IgY3JlYXRlIGEgbmV3IG9uZVxuICAgIHZhciAkZWwgPSAkKHRoaXMpO1xuICAgIHZhciB3aWRnZXQgPSAkZWwuZGF0YSgncGpheFRhYmxlU2VhcmNoJyk7XG4gICAgdmFyIG1ldGhvZFJldHVybjtcblxuICAgIGlmICghd2lkZ2V0KSB7XG4gICAgICB3aWRnZXQgPSAkZWwuZGF0YSgncGpheFRhYmxlU2VhcmNoJywgbmV3IFNlYXJjaEJveCh0aGlzLCBvcHRpb25zKSkuZGF0YSgncGpheFRhYmxlU2VhcmNoJyk7XG4gICAgfVxuXG4gICAgLy8gZXhlY3V0ZSBtZXRob2RzIGFuZCByZXR1cm4gdGhlIG1ldGhvZCByZXR1cm4gb3IgdGhpcyBlbGVtZW50IGZvciBjaGFpbmluZ1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgcmVzZXR0aW5nIHdpZGdldHMsIGNsZWFudXAgYW5kIHJlc2V0XG4gICAgICBpZiAob3B0aW9ucyA9PT0gJ2Rlc3Ryb3knKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygd2lkZ2V0LmRlc3Ryb3kgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICB3aWRnZXQuZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSAkZWwuZGF0YSgpLnBqYXhUYWJsZVNlYXJjaDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHdpZGdldFtvcHRpb25zXSA9PT0gJ2Z1bmN0aW9uJyAmJiBvcHRpb25zLmNoYXJBdCgwKSAhPT0gJ18nKSB7XG4gICAgICAgIG1ldGhvZFJldHVybiA9IHdpZGdldFtvcHRpb25zXS5hcHBseSh3aWRnZXQsIGFyZ3Muc2xpY2UoMSwgYXJncy5sZW5ndGgpKTtcbiAgICAgICAgdmFsdWVzLnB1c2gobWV0aG9kUmV0dXJuKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBtZXRob2Q6ICcgKyBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWVzLnB1c2god2lkZ2V0KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHJldHVybiBvbmx5IDEgdmFsdWUgaWYgcG9zc2libGVcbiAgcmV0dXJuIHZhbHVlcy5sZW5ndGggPiAxID8gdmFsdWVzIDogdmFsdWVzWzBdO1xufTtcblxuLy8gQXV0byBpbml0IHNlYXJjaCBib3hlc1xuJChmdW5jdGlvbigpIHsgJCgnW2RhdGEtcGpheC10YWJsZS1zZWFyY2hdW2RhdGEtYXV0by1pbml0PVwidHJ1ZVwiXScpLnBqYXhUYWJsZVNlYXJjaCh7fSk7IH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIFBqYXhUYWJsZSA9IHJlcXVpcmUoJy4vdGFibGUnKTtcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuLy8gZXhwb3NlIGFzIGpxdWVyeSBwbHVnaW5cbiQuZm4ucGpheFRhYmxlID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgdmFyIHZhbHVlcyA9IFtdOyAvLyByZXR1cm4gdmFsdWVzXG5cbiAgJCh0aGlzKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIC8vIGdldCB0aGUgY3VycmVudCBpbnN0YW5jZSBvciBjcmVhdGUgYSBuZXcgb25lXG4gICAgdmFyICRlbCA9ICQodGhpcyk7XG4gICAgdmFyIHdpZGdldCA9ICRlbC5kYXRhKCdwamF4VGFibGUnKTtcbiAgICB2YXIgbWV0aG9kUmV0dXJuO1xuXG4gICAgaWYgKCF3aWRnZXQpIHtcbiAgICAgIHdpZGdldCA9ICRlbC5kYXRhKCdwamF4VGFibGUnLCBuZXcgUGpheFRhYmxlKHRoaXMsIG9wdGlvbnMpKS5kYXRhKCdwamF4VGFibGUnKTtcbiAgICB9XG5cbiAgICAvLyBleGVjdXRlIG1ldGhvZHMgYW5kIHJldHVybiB0aGUgbWV0aG9kIHJldHVybiBvciB0aGlzIGVsZW1lbnQgZm9yIGNoYWluaW5nXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgLy8gc3BlY2lhbCBjYXNlIGZvciByZXNldHRpbmcgd2lkZ2V0cywgY2xlYW51cCBhbmQgcmVzZXRcbiAgICAgIGlmIChvcHRpb25zID09PSAnZGVzdHJveScpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB3aWRnZXQuZGVzdHJveSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHdpZGdldC5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICAgICAgZGVsZXRlICRlbC5kYXRhKCkucGpheFRhYmxlO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygd2lkZ2V0W29wdGlvbnNdID09PSAnZnVuY3Rpb24nICYmIG9wdGlvbnMuY2hhckF0KDApICE9PSAnXycpIHtcbiAgICAgICAgbWV0aG9kUmV0dXJuID0gd2lkZ2V0W29wdGlvbnNdLmFwcGx5KHdpZGdldCwgYXJncy5zbGljZSgxLCBhcmdzLmxlbmd0aCkpO1xuICAgICAgICB2YWx1ZXMucHVzaChtZXRob2RSZXR1cm4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG1ldGhvZDogJyArIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZXMucHVzaCh3aWRnZXQpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gcmV0dXJuIG9ubHkgMSB2YWx1ZSBpZiBwb3NzaWJsZVxuICByZXR1cm4gdmFsdWVzLmxlbmd0aCA+IDEgPyB2YWx1ZXMgOiB2YWx1ZXNbMF07XG59O1xuXG4vLyBleHBvc2UgY29uc3RydXRvciBnbG9iYWxseVxud2luZG93LlBqYXhUYWJsZSA9IFBqYXhUYWJsZTtcblxuLy8gYXV0by1pbml0IHRhYmxlc1xuJChmdW5jdGlvbigpeyAkKCdbZGF0YS1wamF4LXRhYmxlXVtkYXRhLWF1dG8taW5pdF0nKS5wamF4VGFibGUod2luZG93LlBqYXhUYWJsZUNvbmZpZyA9IHdpbmRvdy5QamF4VGFibGVDb25maWcgfHwge30pOyB9KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4qICAgVGFibGUgaW1wbGVtZW50cyBzY3JpcHQgY29udHJvbHMgZm9yIHBqYXggdGFibGVcbiogICBcIl9cIiBwcmVmaXhlZCBtZXRob2RzIGFyZSBjb25zaWRlcmVkIGludGVybmFsIHVzYWdlIG9ubHlcbipcbiogICBAY29uc3RydWN0b3JcbipcbiogICBAcGFyYW0ge29iamVjdH0gZWwgaXMgdGhlIHRhYmxlIGNvbnRhaW5lciBlbGVtZW50IHRoZSBtb2R1bGUgaXMgYmVpbmcgaW5pdGlhbGl6ZWQgd2l0aFxuKiAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zXG4qICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy51cmwgdGhlIHVybCB0byBiZSB1c2VkIGZvciBmZXRjaGluZyB0YWJsZSBtYXJrdXBcbiogICAgIEBwYXJhbSB7QXJyYXk8b2JqZWN0Pn0gb3B0aW9ucy5yZWZyZXNoRXZlbnRzIGEgbGlzdCBvZiBkZWxlZ2F0ZWQgZXZlbnQgY29uZmlndXJhdGlvbnMgdGhhdCBzaG91bGQgdHJpZ2dlciBhIHRhYmxlIHJlZnJlc2guXG4qICAgICAgIGV2ZW50IGxpc3RlbmVycyBhcmUgYXR0YWNoZWQgYXQgdGhlIHRhYmxlIGNvbnRhaW5lciBlbGVtZW50IGxldmVsLCBmaWx0ZXJzIGFyZSBvcHRpb25hbC5cbiogICAgICAgY29uZmlnIGV4YW1wbGU6IFt7IGV2ZW50TmFtZTogJ2NsaWNrJywgZmlsdGVyOiAnLm15LWNsYXNzLXNlbGVjdG9yJyB9XVxuKiAgICAgQHBhcmFtIHtBcnJheTxvYmplY3Q+fSBvcHRpb25zLnBsdWdpbnMgYSBsaXN0IG9mIGpRdWVyeSBwcm90b3R5cGUgYmFzZWQgcGx1Z2luIGNvbmZpZ3VyYXRpb25zIHRvIGJlIGludGlhbGl6ZWQgYW5kXG4qICAgICAgIHJlLWluaXRpYWxpemVkIG9uIHRhYmxlIGxvYWQuIFBsdWdpbnMgYXJlIGluaXRpYWxpemVkIGZvciBlYWNoIHJvdywgYmVpbmcgcGFzc2VkIHRoZSByb3cgcmVjb3JkIGFuZCBjdXJyZW50IHF1ZXJ5IHN0YXRlLlxuKiAgICAgICBjb25maWcgZXhhbXBsZTogW3sgdGFyZ2V0OiAnW2RhdGEtcGx1Z2luLWVsZW1lbnQtc2VsZWN0b3JdJywgY29uc3RydWN0b3JOYW1lOiAnbXlQbHVnaW4nfV1cbiogICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5hamF4T25seSBGbGFnIGZvciBhamF4IG9ubHkgKCBkaXNhYmxlZCBieSBkZWZhdWx0IClcbiogICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5wdXNoU3RhdGUgUGFzc2VzIHRoZSBwdXNoIHN0YXRlIGZsYWcgdG8gcGpheCAoIHB1c2ggc3RhdGUgZW5hYmxlZCBieSBkZWZhdWx0IClcbiogICAgIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9ucy5wYWdpbmF0ZWQgRmxhZyBmb3IgcGFnaW5hdGlvbiAoIGVuYWJsZWQgYnkgZGVmYXVsdCApXG4qICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5wamF4Q29udGFpbmVyIElEIFNlbGVjdG9yIGZvciB0aGUgcGpheCBjb250YWluZXIsIGRlZmF1bHRzIHRvIHRoZSBpbml0aWFsaXppbmdcbiogICAgICAgZWxlbWVudCdzIGlkIGF0dHJpYnV0ZVxuKiAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy5ub0RhdGFUZW1wbGF0ZSBBIGZ1bmN0aW9uIHRvIGJlIHVzZWQgZm9yIGNyZWF0aW5nIHRoZSBubyBkYXRhIG1lc3NhZ2VcbiogICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlYXJjaElkICBBIHNlbGVjdG9yIGZvciBhIHNlYXJjaCBib3ggdG8gYmUgdXNlZCB3aXRoIHRoZSB0YWJsZS5cbiogICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNvcnRRdWVyeUtleSBUaGUga2V5IHRvIGJlIHVzZWQgaW4gY3JlYXRpbmcgdGhlIHNvcnQgcXVlcnkgc3RyaW5nXG4qICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5wYWdlUXVlcnlLZXkgVGhlIGtleSB0byBiZSB1c2VkIGluIGNyZWF0aW5nIHRoZSBwYWdlIHF1ZXJ5IHN0cmluZ1xuKiAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMucGVyUGFnZVF1ZXJ5S2V5IFRoZSBrZXkgdG8gYmUgdXNlZCBpbiBjcmVhdGluZyB0aGUgcGVyIHBhZ2UgcXVlcnkgc3RyaW5nXG4qICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5zZWFyY2hRdWVyeUtleSBUaGUga2V5IHRvIGJlIHVzZWQgaW4gY3JlYXRpbmcgdGhlIHNlYXJjaCBxdWVyeSBzdHJpbmdcbiogICAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnF1ZXJ5U3RhdGUgYW4gb3B0aW9uYWwgcXVlcnkgc3RhdGUgdG8gZXh0ZW5kIHdpdGggb24gaW5pdGlhbGl6YXRpb25cbipcbiogICBEYXRhIEF0dHJpYnV0ZSBQYXJhbXMsIHBhcmFtZXRlcnMgZXhwZWN0ZWQgdG8gYmUgaW5jbHVkZWQgb24gdGhlIHRhYmxlIGNvbnRhaW5lciBlbGVtZW50IGZvciBpbml0aWFsaXphdGlvblxuKiAgIEBwYXJhbSB7c3RyaW5nfSBkYXRhLXVybCB0aGUgdXJsIHRvIGJlIHVzZWQgZm9yIGZldGNoaW5nIHRhYmxlIG1hcmt1cFxuKiAgIEBwYXJhbSB7c3RyaW5nfSBkYXRhLXBqYXgtY29udGFpbmVyIHRoZSBzZWxlY3RvciBmb3IgdGhlIGNvbnRhaW5lciB0byBiZSBwYXNzZWQgdG8gcGpheCByZXF1ZXN0c1xuKiAgIEBwYXJhbSB7Ym9vbGVhbn0gZGF0YS1hamF4LW9ubHkgd2hldGhlciB0byBub3QgdG8gZGlzYWJsZSBwamF4IGFuZCBlbmFibGUgYWpheFxuKiAgIEBwYXJhbSB7Ym9vbGVhbn0gZGF0YS1wdXNoLXN0YXRlIGEgZmxhZyBmb3Igd2hldGhlciBvciBub3QgdG8gZW5hYmxlIHBqYXggcHVzaCBzdGF0ZVxuKiAgIEBwYXJhbSB7Ym9vbGVhbn0gZGF0YS1wYWdpbmF0ZWQgd2hldGhlciBvciBub3QgcGFnaW5hdGlvbiBpcyBlbmFibGVkXG4qICAgQHBhcmFtIHtzdHJpbmd9IGRhdGEtc2VhcmNoLWlkIGFuIG9wdGlvbmFsIHNlYXJjaCBjb250cm9sIGVsZW1lbnQgaWRcbiogICBAcGFyYW0ge3N0cmluZ30gZGF0YS1zb3J0LXF1ZXJ5LWtleSB0aGUgc3RyaW5nIGtleSB0byBiZSB1c2VkIGluIGJ1aWxkaW5nIHRoZSBzZWFyY2ggcXVlcnlcbiogICBAcGFyYW0ge3N0cmluZ30gZGF0YS1wYWdlLXF1ZXJ5LWtleSB0aGUgc3RyaW5nIGtleSB0byBiZSB1c2VkIGluIGJ1aWxkaW5nIHRoZSBwYWdlIHF1ZXJ5XG4qICAgQHBhcmFtIHtzdHJpbmd9IGRhdGEtcGVycGFnZS1xdWVyeS1rZXkgdGhlIHN0cmluZyBrZXkgdG8gYmUgdXNlZCBpbiBidWlsZGluZyB0aGUgcGVycGFnZSBxdWVyeVxuKiAgIEBwYXJhbSB7c3RyaW5nfSBkYXRhLXNlYXJjaC1xdWVyeS1rZXkgdGhlIHN0cmluZyBrZXkgdG8gYmUgdXNlZCBpbiBidWlsZGluZyB0aGUgc2VhcmNoIHF1ZXJ5XG4qICAgQHBhcmFtIHtudW1iZXJ9IGRhdGEtY3VycmVudC1wYWdlIHRoZSBjdXJyZW50IHBhZ2UgbnVtYmVyXG4qICAgQHBhcmFtIHtudW1iZXJ9IGRhdGEtY3VycmVudC1wZXJwYWdlIHRoZSBjdXJyZW50IHBlcnBhZ2UgbnVtYmVyXG4qXG4qICAgTm90ZXMgb24gc2VhcmNoIG1vZHVsZTpcbiogICAgIEV2ZW50cyB3aGljaCBhcmUgcmVnaXN0ZXJlZCB3aXRoaW4gdGhlIHRhYmxlXG4qICAgICBzZWFyY2g6c3VibWl0IHRyaWdnZXJzIGEgdGFibGUgc2VhcmNoIHF1ZXJ5IHdoZW4gdHJpZ2dlcmVkIGJ5IHRoZSBlbGVtZW50IHNwZWNpZmllZCBpbiBvcHRpb25zLnNlYXJjaF9pZFxuKiAgICAgc2VhcmNoOmNsZWFyIHRyaWdnZXJzIGEgY2xlYXJhbmNlIG9mIHRoZSBjdXJyZW50IHNlYXJjaCBxdWVyeSB3aGVuIHRyaWdnZXJlZCBieSB0aGUgZWxlbWVudCBzcGVjaWZpZWQgaW4gb3B0aW9ucy5zZWFyY2hfaWRcbipcbiogICBFdmVudHMsIHRyaWdnZXJlZCBieSB0aGUgdGFibGUgb24gdGhlIHRhYmxlIGNvbnRhaW5lciBlbGVtZW50XG4qICAgQGZpcmVzIHRhYmxlOmxvYWQgLSB0cmlnZ2VyZWQgYW55IHRpbWUgdGhlIHRhYmxlIGhhcyBmaW5pc2hlZCBsb2FkaW5nLCBpbmNsdWRpbmcgb24gc3VjY2Vzc2Z1bCBpbml0aWFsIGxvYWQsIHVwZGF0ZSwgb3IgcmVmcmVzaFxuKiAgIEBmaXJlcyB0YWJsZTpzb3J0IHtvYmplY3R9IHRyaWdnZXJlZCB3aGVuIGEgY29sdW1uIGlzIHNvcnRlZCwgaW5jbHVkZXMgZGlyZWN0aW9uIGFuZCBwcm9wZXJ0eVxuKiAgIEBmaXJlcyB0YWJsZTpwYWdlIHtvYmplY3R9IHRyaWdnZXJlZCB3aGVuIGEgc3BlY2lmaWMgcGFnZSBoYXMgYmVlbiBjaG9zZW4gdG8ganVtcCB0b1xuKiAgIEBmaXJlcyB0YWJsZTpwZXJwYWdlIHtvYmplY3R9IHRyaWdnZXJlZCB3aGVuIHBlcnBhZ2UgZHJvcGRvd24gc2VsZWN0aW9uIGhhcyBjaGFuZ2VkXG4qICAgQGZpcmVzIHRhYmxlOm5leHRwYWdlIHtvYmplY3R9IHRyaWdnZXJlZCB3aGVuIG5leHQgcGFnZSBpbiBwYWdpbmF0aW9uIGNsaWNrZWRcbiogICBAZmlyZXMgdGFibGU6cHJldnBhZ2Uge29iamVjdH0gdHJpZ2dlcmVkIHdoZW4gcHJldiBwYWdlIGluIHBhZ2luYXRpb24gY2xpY2tlZFxuKiAgIEBmaXJlcyB0YWJsZTpzZWxlY3Qge29iamVjdH0gdHJpZ2dlcmVkIHdoZW4gYSByb3cgaXMgc2VsZWN0ZWQsIHBhc3NpbmcgdGhlIHJlY29yZCBvYmplY3RcbiogICBAZmlyZXMgdGFibGU6ZGVzZWxlY3Qge29iamVjdH0gdHJpZ2dlcmVkIHdoZW4gYSByb3cgaXMgZGVzZWxlY3RlZCwgcGFzc2luZyB0aGUgcmVjb3JkIG9iamVjdFxuKiAgIEBmaXJlcyB0YWJsZTpzZWxlY3Q6YWxsIC0gdHJpZ2dlcmVkIHdoZW4gYWxsIHJlY29yZHMgYXJlIHNlbGVjdGVkIHVzaW5nIHRoZSBjaGVjayBhbGwgYm94XG4qICAgQGZpcmVzIHRhYmxlOmRlc2VsZWN0OmFsbCAtIHRyaWdnZXJlZCB3aGVuIGFsbCByZWNvcmRzIGFyZSBkZXNlbGVjdGVkIHVzaW5nIHRoZSBjaGVjayBhbGwgYm94XG4qICAgQGZpcmVzIHRhYmxlOnNoaWZ0c2VsZWN0IC0gdHJpZ2dlcmVkIHdoZW4gYSBzaGlmdCBzZWxlY3QgaXMgY29tcGxldGVkXG4qICAgQGZpcmVzIHRhYmxlOnNlYXJjaCB7b2JqZWN0fSB0cmlnZ2VyZWQgd2hlbiBhIHNlYXJjaCBxdWVyeSBpcyB1c2VkIHRvIGZpbHRlciB0aGUgdGFibGVcbiogICBAZmlyZXMgdGFibGU6c2VhcmNoOmNsZWFyIC0gdHJpZ2dlcmVkIHdoZW4gYSBzZWFyY2ggcXVlcnkgaXMgY2xlYXJlZFxuKiAgIEBmaXJlcyB0YWJsZTplcnJvciAtIHRyaWdnZXJlZCB3aGVuIGEgcGpheCAvIGFqYXggZXJyb3Igb2NjdXJzXG4qICAgQGZpcmVzIHRhYmxlOnRpbWVvdXQgLSB0cmlnZ2VyZWQgd2hlbiBwamF4IHRpbWVzIG91dFxuKi9cbmZ1bmN0aW9uIFBqYXhUYWJsZShlbCwgb3B0aW9ucykge1xuICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5fJGVsID0gJChlbCk7XG4gIHRoaXMuXyR0Ym9keSA9IG51bGw7XG5cbiAgdGhpcy5fdXJsID0gdGhpcy5fb3B0aW9ucy51cmwgfHwgdGhpcy5fJGVsLmRhdGEoJ3BqYXgtdXJsJykgfHwgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xuXG4gIGlmICh0aGlzLl9vcHRpb25zLmFqYXhPbmx5ICE9PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzLl9hamF4T25seSA9IHRoaXMuX29wdGlvbnMuYWpheE9ubHk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fYWpheE9ubHkgPSB0aGlzLl8kZWwuZGF0YSgnYWpheC1vbmx5JykgfHwgZmFsc2U7XG4gIH1cbiAgaWYgKHRoaXMuX29wdGlvbnMucHVzaFN0YXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzLl9wdXNoU3RhdGUgPSB0aGlzLl9vcHRpb25zLnB1c2hTdGF0ZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9wdXNoU3RhdGUgPSB0aGlzLl8kZWwuZGF0YSgncHVzaC1zdGF0ZScpIHx8IHRydWU7XG4gIH1cbiAgaWYgKHRoaXMuX29wdGlvbnMucGFnaW5hdGVkICE9PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzLl9wYWdpbmF0ZWQgPSB0aGlzLl9vcHRpb25zLnBhZ2luYXRlZDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9wYWdpbmF0ZWQgPSB0aGlzLl8kZWwuZGF0YSgncGFnaW5hdGVkJykgfHwgdHJ1ZTtcbiAgfVxuXG4gIHRoaXMuX3BqYXhDb250YWluZXIgPSB0aGlzLl9vcHRpb25zLnBqYXhDb250YWluZXIgfHwgdGhpcy5fJGVsLmRhdGEoJ3BqYXgtY29udGFpbmVyJykgfHwgdGhpcy5fJGVsLmF0dHIoJ2lkJyk7XG4gIHRoaXMuX25vRGF0YVRlbXBsYXRlID0gdGhpcy5fb3B0aW9ucy5ub0RhdGFUZW1wbGF0ZSB8fCB0aGlzLl9ub0RhdGFUZW1wbGF0ZTtcbiAgdGhpcy5fc29ydFF1ZXJ5S2V5ID0gdGhpcy5fb3B0aW9ucy5zb3J0UXVlcnlLZXkgfHwgdGhpcy5fJGVsLmRhdGEoJ3NvcnQtcXVlcnkta2V5JykgfHwgJ29yZGVyJztcbiAgdGhpcy5fcGFnZVF1ZXJ5S2V5ID0gdGhpcy5fb3B0aW9ucy5wYWdlUXVlcnlLZXkgfHwgdGhpcy5fJGVsLmRhdGEoJ3BhZ2UtcXVlcnkta2V5JykgfHwgJ3BhZ2UnO1xuICB0aGlzLl9wZXJQYWdlUXVlcnlLZXkgPSB0aGlzLl9vcHRpb25zLnBlclBhZ2VRdWVyeUtleSB8fCB0aGlzLl8kZWwuZGF0YSgncGVycGFnZS1xdWVyeS1rZXknKSB8fCAncGVycGFnZSc7XG4gIHRoaXMuX3NlYXJjaFF1ZXJ5S2V5ID0gdGhpcy5fb3B0aW9ucy5zZWFyY2hRdWVyeUtleSB8fCB0aGlzLl8kZWwuZGF0YSgnc2VhcmNoLXF1ZXJ5LWtleScpIHx8ICdxJztcbiAgdGhpcy5fcXVlcnlTeW5jRm4gPSB0aGlzLl9vcHRpb25zLnF1ZXJ5U3luY0ZuIHx8IG51bGw7XG5cbiAgdGhpcy5fdG90YWxSb3dzID0gbnVsbDtcblxuICB2YXIgc2VhcmNoSWQgPSB0aGlzLl9vcHRpb25zLnNlYXJjaElkIHx8IHRoaXMuXyRlbC5kYXRhKCdzZWFyY2gtaWQnKSB8fCBudWxsO1xuICB0aGlzLl8kc2VhcmNoQm94ID0gc2VhcmNoSWQgPyAkKHNlYXJjaElkKSA6IG51bGw7XG5cbiAgdGhpcy5fc29ydE1hcCA9IHsgYXNjOiAnZGVzYycsIGRlc2M6ICdhc2MnIH07XG4gIHRoaXMuX3F1ZXJ5U3RhdGUgPSAkLmV4dGVuZCh7fSwgdGhpcy5fb3B0aW9ucy5xdWVyeVN0YXRlKTtcblxuICB0aGlzLl9pbml0KCk7XG59XG5cbiQuZXh0ZW5kKFBqYXhUYWJsZS5wcm90b3R5cGUsIHtcblxuICBfbm9EYXRhVGVtcGxhdGU6IGZ1bmN0aW9uKG51bUNvbHVtbnMpIHtcbiAgICByZXR1cm4gW1xuICAgICAgJzx0cj4nLFxuICAgICAgICAnPHRkIGNsYXNzPVwiZW1wdHktdGFibGUtY29udGVudFwiIGNvbHNwYW49XCInICsgbnVtQ29sdW1ucyArICdcIj4nLFxuICAgICAgICAgICdXaG9vcHMhIExvb2tzIGxpa2UgdGhlcmVcXCdzIG5vdGhpbmcgaW4gdGhpcyB0YWJsZSEnLFxuICAgICAgICAnPC90ZD4nLFxuICAgICAgJzwvdHI+J1xuICAgIF0uam9pbignJyk7XG4gIH0sXG5cbiAgX2NyZWF0ZVNvcnRRdWVyeTogZnVuY3Rpb24ocHJvcGVydHksIGRpcmVjdGlvbikge1xuICAgIHZhciBxdWVyeSA9IHt9O1xuICAgIHF1ZXJ5W3RoaXMuX3NvcnRRdWVyeUtleV0gPSBwcm9wZXJ0eSArICdfXycgKyBkaXJlY3Rpb247XG4gICAgcmV0dXJuIHF1ZXJ5O1xuICB9LFxuXG4gIF9kZXN5bmNTb3J0OiBmdW5jdGlvbigpIHtcbiAgICBkZWxldGUgdGhpcy5fcXVlcnlTdGF0ZVt0aGlzLl9zb3J0UXVlcnlLZXldO1xuICB9LFxuXG4gIF9jcmVhdGVQYWdlUXVlcnk6IGZ1bmN0aW9uKHBhZ2UpIHtcbiAgICB2YXIgcXVlcnkgPSB7fTtcbiAgICBxdWVyeVt0aGlzLl9wYWdlUXVlcnlLZXldID0gcGFnZTtcbiAgICByZXR1cm4gcXVlcnk7XG4gIH0sXG5cbiAgX2NyZWF0ZVBlclBhZ2VRdWVyeTogZnVuY3Rpb24ocGVycGFnZSkge1xuICAgIHZhciBxdWVyeSA9IHt9O1xuICAgIHF1ZXJ5W3RoaXMuX3BlclBhZ2VRdWVyeUtleV0gPSBwZXJwYWdlO1xuICAgIHJldHVybiBxdWVyeTtcbiAgfSxcblxuICBfY3JlYXRlU2VhcmNoUXVlcnk6IGZ1bmN0aW9uKHNlYXJjaFN0cikge1xuICAgIHZhciBxdWVyeSA9IHt9O1xuICAgIHF1ZXJ5W3RoaXMuX3NlYXJjaFF1ZXJ5S2V5XSA9IHNlYXJjaFN0cjtcbiAgICByZXR1cm4gcXVlcnk7XG4gIH0sXG5cbiAgX2Rlc3luY1NlYXJjaDogZnVuY3Rpb24oKSB7XG4gICAgZGVsZXRlIHRoaXMuX3F1ZXJ5U3RhdGVbdGhpcy5fc2VhcmNoUXVlcnlLZXldO1xuICB9LFxuXG4gIF9zeW5jU29ydDogZnVuY3Rpb24ocHJvcGVydHksIGRpcmVjdGlvbikge1xuICAgICQuZXh0ZW5kKHRoaXMuX3F1ZXJ5U3RhdGUsIHRoaXMuX2NyZWF0ZVNvcnRRdWVyeShwcm9wZXJ0eSwgZGlyZWN0aW9uKSk7XG4gIH0sXG5cbiAgX3N5bmNQYWdlOiBmdW5jdGlvbihwYWdlKSB7XG4gICAgJC5leHRlbmQodGhpcy5fcXVlcnlTdGF0ZSwgdGhpcy5fY3JlYXRlUGFnZVF1ZXJ5KHBhZ2UpKTtcbiAgfSxcblxuICBfc3luY1BlclBhZ2U6IGZ1bmN0aW9uKHBlcnBhZ2UpIHtcbiAgICAkLmV4dGVuZCh0aGlzLl9xdWVyeVN0YXRlLCB0aGlzLl9jcmVhdGVQZXJQYWdlUXVlcnkocGVycGFnZSkpO1xuICB9LFxuXG4gIF9zeW5jU2VhcmNoOiBmdW5jdGlvbihzZWFyY2hTdHIpIHtcbiAgICAkLmV4dGVuZCh0aGlzLl9xdWVyeVN0YXRlLCB0aGlzLl9jcmVhdGVTZWFyY2hRdWVyeShzZWFyY2hTdHIpKTtcbiAgfSxcblxuICBfbG9hZDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgaWYgKCF0aGlzLl9hamF4T25seSkge1xuICAgICAgcmV0dXJuICQucGpheCgkLmV4dGVuZCh7XG4gICAgICAgIHVybDogdGhpcy5fdXJsLFxuICAgICAgICBkYXRhOiB0aGlzLl9xdWVyeVN0YXRlLFxuICAgICAgICBwdXNoOiB0aGlzLl9wdXNoU3RhdGUsXG4gICAgICAgIGNvbnRhaW5lcjogdGhpcy5fcGpheENvbnRhaW5lclxuICAgICAgfSwgcGFyYW1zKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fYWRkTG9hZE1hc2soKTtcbiAgICByZXR1cm4gJC5hamF4KCQuZXh0ZW5kKHtcbiAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgdXJsOiB0aGlzLl91cmwsXG4gICAgICBkYXRhOiB0aGlzLl9xdWVyeVN0YXRlLFxuICAgICAgY29udGV4dDogdGhpc1xuICAgIH0sIHBhcmFtcykpXG4gICAgLmRvbmUodGhpcy5fb25BamF4U3VjY2VzcylcbiAgICAuZmFpbCh0aGlzLl9vbkFqYXhFcnJvcik7XG4gIH0sXG5cbiAgX2FkZExvYWRNYXNrOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgJGxvYWRNYXNrID0gJCgnPGRpdiBjbGFzcz1cInVpLWxvYWQtbWFza1wiPicpO1xuICAgIHRoaXMuXyRlbC5jc3MoeyBwb3NpdGlvbjogJ3JlbGF0aXZlJyB9KTtcbiAgICB0aGlzLl8kZWwuYXBwZW5kKCRsb2FkTWFzayk7XG4gICAgJGxvYWRNYXNrLnNwaW4odGhpcy5fb3B0aW9ucy5sb2FkTWFza0NvbmZpZyB8fCAnc21hbGwnKTtcbiAgfSxcblxuICBfcmVtb3ZlTG9hZE1hc2s6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuXyRlbC5maW5kKCcudWktbG9hZC1tYXNrJykucmVtb3ZlKCk7XG4gICAgdGhpcy5fJGVsLmNzcyh7IHBvc2l0aW9uOiAnJyB9KTtcbiAgfSxcblxuICAvLyBTeW5jcyB0aGUgcXVlcnkgc3RhdGUgd2l0aCB3aGF0J3MgYmVpbmcgZGlzcGxheWVkXG4gIF9zeW5jUXVlcnlTdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyICR0YWJsZSA9IHRoaXMuXyRlbC5maW5kKCd0YWJsZScpO1xuICAgIHZhciBwYWdlID0gJHRhYmxlLmRhdGEoJ2N1cnJlbnQtcGFnZScpO1xuICAgIHZhciBwZXJwYWdlID0gJHRhYmxlLmRhdGEoJ2N1cnJlbnQtcGVycGFnZScpO1xuICAgIHZhciBzb3J0UHJvcGVydHkgPSAkdGFibGUuZGF0YSgnY3VycmVudC1zb3J0LXByb3BlcnR5Jyk7XG4gICAgdmFyIHNvcnREaXJlY3Rpb24gPSAkdGFibGUuZGF0YSgnY3VycmVudC1zb3J0LWRpcmVjdGlvbicpO1xuICAgIHZhciBzZWFyY2hTdHIgPSAkdGFibGUuZGF0YSgnY3VycmVudC1zZWFyY2gtc3RyJyk7XG5cbiAgICBpZiAodGhpcy5fcGFnaW5hdGVkKSB7XG4gICAgICB0aGlzLl9zeW5jUGFnZShwYWdlKTtcbiAgICAgIHRoaXMuX3N5bmNQZXJQYWdlKHBlcnBhZ2UpO1xuICAgIH1cblxuICAgIGlmIChzb3J0UHJvcGVydHkpIHtcbiAgICAgIHRoaXMuX3N5bmNTb3J0KHNvcnRQcm9wZXJ0eSwgc29ydERpcmVjdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2Rlc3luY1NvcnQoKTtcbiAgICB9XG5cbiAgICBpZiAoc2VhcmNoU3RyKSB7XG4gICAgICB0aGlzLl9zeW5jU2VhcmNoKHNlYXJjaFN0cik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2Rlc3luY1NlYXJjaCgpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdGhpcy5fcXVlcnlTeW5jRm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICQuZXh0ZW5kKHRoaXMuX3F1ZXJ5U3RhdGUsIHRoaXMuX3F1ZXJ5U3luY0ZuKCR0YWJsZSkpXG4gICAgfVxuICB9LFxuXG4gIF9vblRhYmxlTG9hZGVkOiBmdW5jdGlvbigpIHtcbiAgICAvLyBjcmVhdGUgdGhpcyBzaG9ydGN1dCB3aGVuZXZlciB0aGUgdGFibGUgbG9hZHNcbiAgICB0aGlzLl8kdGJvZHkgPSB0aGlzLl8kZWwuZmluZCgndGJvZHknKTtcblxuICAgIHZhciB0b3RhbFJvd3MgPSB0aGlzLl8kZWwuZmluZCgndGFibGUnKS5kYXRhKCd0b3RhbC1yb3dzJyk7XG4gICAgdGhpcy5fdG90YWxSb3dzID0gdG90YWxSb3dzIHwgMDtcblxuICAgIGlmICh0aGlzLl90b3RhbFJvd3MgPT09IDApIHtcbiAgICAgIHRoaXMuXyR0Ym9keS5odG1sKHRoaXMuX25vRGF0YVRlbXBsYXRlKHRoaXMuZ2V0TnVtQ29sdW1ucygpKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOmxvYWQnKTtcbiAgfSxcblxuICBfb25BamF4U3VjY2VzczogZnVuY3Rpb24oZGF0YSwgdGV4dFN0YXR1cywganFYSFIpIHtcbiAgICB0aGlzLl8kZWwuaHRtbChkYXRhKTtcbiAgICB0aGlzLl9vblRhYmxlTG9hZGVkKCk7XG4gICAgdGhpcy5fcmVtb3ZlTG9hZE1hc2soKTtcbiAgfSxcblxuICBfb25BamF4RXJyb3I6IGZ1bmN0aW9uKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuICAgIHRoaXMuX3JlbW92ZUxvYWRNYXNrKCk7XG4gICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOmVycm9yJyk7XG4gIH0sXG5cbiAgX29uUGpheFN0YXJ0OiBmdW5jdGlvbihlKSB7XG4gICAgdGhpcy5fYWRkTG9hZE1hc2soKTtcbiAgfSxcblxuICBfb25QamF4QmVmb3JlUmVwbGFjZTogZnVuY3Rpb24oZSkge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5fcmVtb3ZlTG9hZE1hc2soKTtcbiAgfSxcblxuICBfb25QamF4VGltZW91dDogZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gcHJldmVudCByZXRyeVxuICAgIHRoaXMuXyRlbC50cmlnZ2VyKCd0YWJsZTp0aW1lb3V0Jyk7XG4gIH0sXG5cbiAgX29uUGpheFN1Y2Nlc3M6IGZ1bmN0aW9uIChlLCBkYXRhLCBzdGF0dXMsIHhociwgb3B0aW9ucykge1xuICAgIHRoaXMuX29uVGFibGVMb2FkZWQoKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LFxuXG4gIF9vblBqYXhFcnJvcjogZnVuY3Rpb24gKGUsIHhociwgdGV4dFN0YXR1cywgZXJyb3IsIG9wdGlvbnMpIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGUucHJldmVudERlZmF1bHQoKTsgLy8gcHJldmVudCByZXRyeVxuICAgIHRoaXMuX3JlbW92ZUxvYWRNYXNrKCk7XG4gICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOmVycm9yJyk7XG4gIH0sXG5cbiAgX29uQ2xpY2tTb3J0YWJsZTogZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgJHNvcnRhYmxlID0gJChlLnRhcmdldCkuY2xvc2VzdCgndGhbZGF0YS1zb3J0YWJsZT1cInRydWVcIl0nKTtcbiAgICB2YXIgcHJvcGVydHkgPSAkc29ydGFibGUuZGF0YSgncHJvcGVydHknKTtcbiAgICB2YXIgZGlyZWN0aW9uID0gdGhpcy5fc29ydE1hcFskc29ydGFibGUuZGF0YSgnY3VycmVudC1zb3J0LWRpcmVjdGlvbicpXSB8fCAkc29ydGFibGUuZGF0YSgnZGVmYXVsdC1zb3J0LWRpcmVjdGlvbicpO1xuXG4gICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOnNvcnQnLCB0aGlzLl9jcmVhdGVTb3J0UXVlcnkocHJvcGVydHksIGRpcmVjdGlvbikpO1xuICAgIHRoaXMuX3N5bmNTb3J0KHByb3BlcnR5LCBkaXJlY3Rpb24pO1xuICAgIHRoaXMuX3N5bmNQYWdlKDEpOyAvLyByZXNldCB0aGUgcGFnZSB0byAxIHdoZW4gY2hhbmdpbmcgc29ydFxuICAgIHRoaXMuX2xvYWQoKTtcbiAgfSxcblxuICBfb25QZXJQYWdlU2VsZWN0OiBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBwZXJwYWdlID0gJChlLmN1cnJlbnRUYXJnZXQpLmRhdGEoJ3ZhbHVlJyk7XG5cbiAgICB0aGlzLl8kZWwudHJpZ2dlcigndGFibGU6cGVycGFnZScsIHRoaXMuX2NyZWF0ZVBlclBhZ2VRdWVyeShwZXJwYWdlKSk7XG4gICAgdGhpcy5fc3luY1BlclBhZ2UocGVycGFnZSk7XG4gICAgdGhpcy5fc3luY1BhZ2UoMSk7IC8vIHJlc2V0IHRoZSBwYWdlIHRvIDEgd2hlbiBjaGFuZ2luZyBwZXIgcGFnZVxuICAgIHRoaXMuX2xvYWQoKTtcbiAgfSxcblxuICBfb25QYWdlU2VsZWN0OiBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBwYWdlSW5kZXggPSAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgndmFsdWUnKTtcblxuICAgIHRoaXMuXyRlbC50cmlnZ2VyKCd0YWJsZTpwYWdlJywgdGhpcy5fY3JlYXRlUGFnZVF1ZXJ5KHBhZ2VJbmRleCkpO1xuICAgIHRoaXMuX3N5bmNQYWdlKHBhZ2VJbmRleCk7XG4gICAgdGhpcy5fbG9hZCgpO1xuICB9LFxuXG4gIF9vblByZXZQYWdlU2VsZWN0OiBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBwYWdlSW5kZXggPSBwYXJzZUludCh0aGlzLl8kZWwuZmluZCgndGFibGUnKS5kYXRhKCdjdXJyZW50LXBhZ2UnKSk7XG4gICAgdmFyIHByZXZQYWdlSW5kZXggPSBNYXRoLm1heCgxLCBwYWdlSW5kZXggLSAxKTtcblxuICAgIHRoaXMuXyRlbC50cmlnZ2VyKCd0YWJsZTpwcmV2cGFnZScsIHRoaXMuX2NyZWF0ZVBhZ2VRdWVyeShwcmV2UGFnZUluZGV4KSk7XG4gICAgdGhpcy5fc3luY1BhZ2UocHJldlBhZ2VJbmRleCk7XG4gICAgdGhpcy5fbG9hZCgpO1xuICB9LFxuXG4gIF9vbk5leHRQYWdlU2VsZWN0OiBmdW5jdGlvbiAoZSkge1xuICAgIHZhciBwYWdlSW5kZXggPSBwYXJzZUludCh0aGlzLl8kZWwuZmluZCgndGFibGUnKS5kYXRhKCdjdXJyZW50LXBhZ2UnKSk7XG4gICAgdmFyIG5leHRQYWdlSW5kZXggPSBwYWdlSW5kZXggKyAxO1xuXG4gICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOm5leHRwYWdlJywgdGhpcy5fY3JlYXRlUGFnZVF1ZXJ5KG5leHRQYWdlSW5kZXgpKTtcbiAgICB0aGlzLl9zeW5jUGFnZShuZXh0UGFnZUluZGV4KTtcbiAgICB0aGlzLl9sb2FkKCk7XG4gIH0sXG5cbiAgX29uSGVhZGVyQ2hlY2tib3hDaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICRjaGVja2JveCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICB2YXIgcHJvcGVydHkgPSAkY2hlY2tib3gucGFyZW50KCd0aCcpLmRhdGEoJ3Byb3BlcnR5Jyk7XG5cbiAgICB0aGlzLl9kaXNhYmxlUm93Q2hlY2tib3hDaGFuZ2VIYW5kbGluZygpO1xuXG4gICAgaWYgKCRjaGVja2JveC5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgIHRoaXMuXyRlbC5maW5kKCd0ZFtkYXRhLXByb3BlcnR5PScgKyBwcm9wZXJ0eSArICddIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgIHRoaXMuXyR0Ym9keS5maW5kKCd0cicpLmFkZENsYXNzKCd1aS1zZWxlY3RlZCcpO1xuICAgICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOnNlbGVjdDphbGwnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fJGVsLmZpbmQoJ3RkW2RhdGEtcHJvcGVydHk9JyArIHByb3BlcnR5ICsgJ10gaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgIHRoaXMuXyR0Ym9keS5maW5kKCd0cicpLnJlbW92ZUNsYXNzKCd1aS1zZWxlY3RlZCcpO1xuICAgICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOmRlc2VsZWN0OmFsbCcpO1xuICAgIH1cblxuICAgIHRoaXMuX2VuYWJsZVJvd0NoZWNrYm94Q2hhbmdlSGFuZGxpbmcoKTtcbiAgfSxcblxuICBfb25DbGlja0lkQ29sdW1uOiBmdW5jdGlvbihlKSB7XG4gICAgJCh0aGlzKS5jbG9zZXN0KCd0cicpLmRhdGEoJ3NoaWZ0S2V5JywgZS5zaGlmdEtleSk7XG4gIH0sXG5cbiAgX29uUm93Q2hlY2tib3hDaGFuZ2U6IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyICRjaGVja2JveCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcbiAgICB2YXIgJHRyID0gJChlLmN1cnJlbnRUYXJnZXQpLmNsb3Nlc3QoJ3RyJyk7XG4gICAgdmFyIHJlY29yZCA9IHRoaXMuX2dldFJlY29yZCgkdHIuZ2V0KDApKTtcbiAgICB2YXIgc2hpZnRDbGlja0lkID0gdGhpcy5fJGVsLmRhdGEoJ2xhc3Rfc2VsZWN0ZWQnKTtcblxuICAgIC8vIGhhbmRsZSBzaGlmdCBjbGljayBieSBzZWxlY3RpbmcgZXZlcnl0aGluZyBpbmJldHdlZW5cbiAgICBpZiAoc2hpZnRDbGlja0lkICYmICR0ci5kYXRhKCdzaGlmdEtleScpKSB7XG4gICAgICB0aGlzLl9kaXNhYmxlUm93Q2hlY2tib3hDaGFuZ2VIYW5kbGluZygpO1xuICAgICAgdGhpcy5fc2hpZnRTZWxlY3RSb3dzKCR0ciwgc2hpZnRDbGlja0lkKTtcbiAgICAgIHRoaXMuX2VuYWJsZVJvd0NoZWNrYm94Q2hhbmdlSGFuZGxpbmcoKTtcbiAgICB9XG5cbiAgICAvLyBhbHdheXMgc2V0IGxhc3Qgc2VsZWN0ZWQsIHdoZXRoZXIgb3Igbm90IGl0IHdhcyBjaGVja2VkIG9uIG9yIG9mZlxuICAgIHRoaXMuXyRlbC5kYXRhKCdsYXN0X3NlbGVjdGVkJywgcmVjb3JkLmlkKTtcblxuICAgIC8vIGlnbm9yZSBoZWFkZXIgY2hlY2sgYWxsIGlucHV0IGZvciBzZWxlY3RlZCBzdGF0ZVxuICAgIGlmICgkY2hlY2tib3gucHJvcCgnY2hlY2tlZCcpKSB7XG4gICAgICAkdHIuYWRkQ2xhc3MoJ3VpLXNlbGVjdGVkJyk7XG4gICAgICB0aGlzLl8kZWwudHJpZ2dlcigndGFibGU6c2VsZWN0JywgcmVjb3JkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHRyLnJlbW92ZUNsYXNzKCd1aS1zZWxlY3RlZCcpO1xuICAgICAgdGhpcy5fJGVsLmZpbmQoJ3RoW2RhdGEtc2VsZWN0LWFsbC1lbmFibGVkPVwidHJ1ZVwiXSBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOmRlc2VsZWN0JywgcmVjb3JkKTtcbiAgICB9XG4gIH0sXG5cbiAgX3NoaWZ0U2VsZWN0Um93czogZnVuY3Rpb24oJHRyLCBzaGlmdENsaWNrSWQpIHtcbiAgICB2YXIgJGxhc3RTZWxlY3RlZFRyID0gdGhpcy5fJHRib2R5LmZpbmQoJ3RkW2RhdGEtcHJvcGVydHk9XCJpZFwiXVtkYXRhLXZhbHVlPVwiJyArIHNoaWZ0Q2xpY2tJZCArICdcIl0nKS5wYXJlbnQoKTtcbiAgICB2YXIgJGFsbFZpc2libGVSb3dzID0gdGhpcy5fJHRib2R5LmZpbmQoJ3RyJyk7XG4gICAgdmFyIGN1cnJlbnRTZWxlY3RlZEluZGV4ID0gJGFsbFZpc2libGVSb3dzLmluZGV4KCR0cik7XG4gICAgdmFyIGxhc3RTZWxlY3RlZEluZGV4ID0gJGFsbFZpc2libGVSb3dzLmluZGV4KCRsYXN0U2VsZWN0ZWRUcik7XG4gICAgdmFyIHN0YXJ0ID0gTWF0aC5taW4oY3VycmVudFNlbGVjdGVkSW5kZXgsIGxhc3RTZWxlY3RlZEluZGV4KTtcbiAgICB2YXIgZW5kID0gTWF0aC5tYXgoY3VycmVudFNlbGVjdGVkSW5kZXgsIGxhc3RTZWxlY3RlZEluZGV4KTtcblxuICAgIC8vIGlmIHNlbGVjdGluZyBmcm9tIHRvcCBkb3duLCBkb24ndCBwcm9jZXNzIHRoZSBmaXJzdCBvbmVcbiAgICBpZiAobGFzdFNlbGVjdGVkSW5kZXggPCBjdXJyZW50U2VsZWN0ZWRJbmRleCAmJiAkbGFzdFNlbGVjdGVkVHIuaGFzQ2xhc3MoJ3VpLXNlbGVjdGVkJykpIHtcbiAgICAgICsrc3RhcnQ7XG4gICAgfVxuICAgICsrZW5kO1xuXG4gICAgJGFsbFZpc2libGVSb3dzLnNsaWNlKHN0YXJ0LCBlbmQpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJHJvdyA9ICQodGhpcyk7XG4gICAgICBpZiAoISRsYXN0U2VsZWN0ZWRUci5oYXNDbGFzcygndWktc2VsZWN0ZWQnKSkge1xuICAgICAgICAkcm93LnJlbW92ZUNsYXNzKCd1aS1zZWxlY3RlZCcpLmNoaWxkcmVuKCkuZmlyc3QoKS5maW5kKCdpbnB1dCcpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkcm93LmFkZENsYXNzKCd1aS1zZWxlY3RlZCcpLmNoaWxkcmVuKCkuZmlyc3QoKS5maW5kKCdpbnB1dCcpLnByb3AoJ2NoZWNrZWQnLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuXyRlbC50cmlnZ2VyKCd0YWJsZTpzaGlmdHNlbGVjdCcpO1xuICB9LFxuXG4gIF9vblN1Ym1pdFNlYXJjaDogZnVuY3Rpb24oZSwgc2VhcmNoU3RyKSB7XG4gICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOnNlYXJjaCcsIHRoaXMuX2NyZWF0ZVNlYXJjaFF1ZXJ5KHNlYXJjaFN0cikpO1xuICAgIHRoaXMuX3N5bmNTZWFyY2goc2VhcmNoU3RyKTtcbiAgICB0aGlzLl9zeW5jUGFnZSgxKTtcbiAgICB0aGlzLl9sb2FkKCk7XG4gIH0sXG5cbiAgX29uQ2xlYXJTZWFyY2g6IGZ1bmN0aW9uKGUpIHtcbiAgICB0aGlzLl8kZWwudHJpZ2dlcigndGFibGU6c2VhcmNoOmNsZWFyJyk7XG4gICAgdGhpcy5fZGVzeW5jU2VhcmNoKCk7XG4gICAgdGhpcy5fc3luY1BhZ2UoMSk7XG4gICAgdGhpcy5fbG9hZCgpO1xuICB9LFxuXG4gIC8qKlxuICAqICAgR2VuZXJpYyByb3cgbGV2ZWwgcGx1Z2luIGluaXRpYWxpemF0aW9uLCBwcm92aWRpbmcgdGhlIHJvdyByZWNvcmQgYXMgYSBwb2pvICggcGx1Z2lucyBleHBlY3RlZCB0byBiZSBwcm90b3R5cGUgYmFzZWQgKVxuICAqXG4gICogICBOb3RlczpcbiAgKiAgICAgdXNlcyBleHRlbmQgZm9yIHRoZSBxdWVyeVN0YXRlIHRvIGNvcHkgcHJpbWl0aXZlcyBzbyB0aGF0IHRoZSBwbHVnaW4gaGFzIGFjY2VzcyB0byB0aGUgY3VycmVudCB0YWJsZSBzdGF0ZSBidXQgY2Fubm90IGRpcmVjdGx5IGVkaXQgaXRcbiAgKlxuICAqICAgQHBhcmFtIHtBcnJheS48b2JqZWN0Pn1cbiAgKiAgICAgQHBhcmFtIHtzdHJpbmd9IChkZWZpbml0aW9uLnRhcmdldCkgdGhlIHBsdWdpbiB0YXJnZXQgc2VsZWN0b3IgdG8gYmUgdXNlZCB3aXRoIGZpbmQgb24gdGhlIHJvd1xuICAqICAgICBAcGFyYW0ge3N0cmluZ30gKGRlZmluaXRpb24uY29uc3RydWN0b3JOYW1lKSB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luIGNvbnN0cnVjdG9yXG4gICogICAgIEBwYXJhbSB7b2JqZWN0fSAoZGVmaW5pdGlvbi5vcHRpb25zKSBvcHRpb25zIHRvIGJlIHBhc3NlZCB0byB0aGUgcGx1Z2luIChjdXJyZW50bHkgaXMgbm90IGFsbG93ZWQgdG8gb3ZlcnJpZGUgdGFibGUgcXVlcnkgc3RhdGUgb3Igcm93IHJlY29yZClcbiAgKi9cbiAgX2FwcGx5UGx1Z2luczogZnVuY3Rpb24ocGx1Z2luRGVmaW5pdGlvbnMpIHtcbiAgICAkLmVhY2gocGx1Z2luRGVmaW5pdGlvbnMsIGZ1bmN0aW9uKGluZGV4LCBkZWZpbml0aW9uKSB7XG4gICAgICB0aGlzLl8kZWwub24oJ2NsaWNrJywgZGVmaW5pdGlvbi50YXJnZXQsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyICRjdXJyZW50VGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICBpZiAoISRjdXJyZW50VGFyZ2V0LmRhdGEoJ3BsdWdpbi1pbml0aWFsaXplZCcpKSB7XG4gICAgICAgICAgJGN1cnJlbnRUYXJnZXRbZGVmaW5pdGlvbi5jb25zdHJ1Y3Rvck5hbWVdKCQuZXh0ZW5kKHt9LCBkZWZpbml0aW9uLm9wdGlvbnMsIHtcbiAgICAgICAgICAgIHF1ZXJ5U3RhdGU6ICQuZXh0ZW5kKHt9LCB0aGlzLl9xdWVyeVN0YXRlKSwgLy8gY29weVxuICAgICAgICAgICAgcmVjb3JkOiB0aGlzLl9nZXRSZWNvcmQoJGN1cnJlbnRUYXJnZXQuY2xvc2VzdCgndHInKS5nZXQoMCkpLCAvLyBjcmVhdGVzIGEgbmV3IG9iamVjdCBiYXNlZCBvbiBET00gYXR0cmlidXRlc1xuICAgICAgICAgICAgZXZlbnQ6IGVcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgJGN1cnJlbnRUYXJnZXQuZGF0YSgncGx1Z2luLWluaXRpYWxpemVkJywgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgfSxcblxuICBfb25QbHVnaW5SZWZyZXNoRXZlbnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB0aGlzLnJlZnJlc2goKTtcbiAgfSxcblxuICAvKipcbiAgKiAgIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSB0YWJsZSBlbGVtZW50ICggd2l0aCBmaWx0ZXJzIHdoZW4gcHJvdmlkZWQgKSB0aGF0IHdpbGwgdHJpZ2dlciByZWZyZXNoXG4gICogICBTZWUgZG9jcyBhdCB0b3Agb2YgdGFibGUgbW9kdWxlIGZvciBkZXRhaWxzIG9uIHRoZSBzdHJ1Y3R1cmUgb2YgcmVmcmVzaCBldmVudHMgY29uZmlndXJhdGlvblxuICAqL1xuICBfaW5pdFBsdWdpblJlZnJlc2hFdmVudHM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW5ndGg7XG4gICAgdmFyIHJlZnJlc2hFdmVudDtcbiAgICBpZiAodGhpcy5fb3B0aW9ucy5yZWZyZXNoRXZlbnRzKSB7XG4gICAgICBsZW5ndGggPSB0aGlzLl9vcHRpb25zLnJlZnJlc2hFdmVudHMubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICByZWZyZXNoRXZlbnQgPSB0aGlzLl9vcHRpb25zLnJlZnJlc2hFdmVudHNbaV07XG4gICAgICAgIGlmIChyZWZyZXNoRXZlbnQuZmlsdGVyKSB7XG4gICAgICAgICAgdGhpcy5fJGVsLm9uKHJlZnJlc2hFdmVudC5ldmVudE5hbWUsIHJlZnJlc2hFdmVudC5maWx0ZXIsIHRoaXMuX29uUGx1Z2luUmVmcmVzaEV2ZW50LmJpbmQodGhpcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuXyRlbC5vbihyZWZyZXNoRXZlbnQuZXZlbnROYW1lLCB0aGlzLl9vblBsdWdpblJlZnJlc2hFdmVudC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgKiAgRW5hYmxlIC8gRGlzYWJsZSBjaGFuZ2UgaGFuZGxpbmcgbWV0aG9kcyBhcmUgdXNlZCBieSBzZWxlY3QgYWxsIHRvIHByZXZlbnQgZWFjaFxuICAqICBpbmRpdmlkdWFsIHJvdyBmcm9tIGZpcmluZyBjaGFuZ2UgZXZlbnRzXG4gICovXG4gIF9lbmFibGVSb3dDaGVja2JveENoYW5nZUhhbmRsaW5nOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9jaGVja2JveENoYW5nZUhhbmRsZXIgPSB0aGlzLl9vblJvd0NoZWNrYm94Q2hhbmdlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fJGVsLm9uKCdjaGFuZ2UnLCAndGRbZGF0YS1wcm9wZXJ0eT1cImlkXCJdIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXScsIHRoaXMuX2NoZWNrYm94Q2hhbmdlSGFuZGxlcik7XG4gIH0sXG5cbiAgX2Rpc2FibGVSb3dDaGVja2JveENoYW5nZUhhbmRsaW5nOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl8kZWwub2ZmKCdjaGFuZ2UnLCAndGRbZGF0YS1wcm9wZXJ0eT1cImlkXCJdIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXScsIHRoaXMuX2NoZWNrYm94Q2hhbmdlSGFuZGxlcik7XG4gICAgdGhpcy5fY2hlY2tib3hDaGFuZ2VIYW5kbGVyID0gbnVsbDtcbiAgfSxcblxuICBfaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fc3luY1F1ZXJ5U3RhdGUoKTtcbiAgICB0aGlzLl9vblRhYmxlTG9hZGVkKCk7XG5cbiAgICAvLyBwamF4IHRpbWluZyBvdXQsIHdlIHdhbnQgdG8gY2FuY2VsIHRoZSBhdXRvbWF0aWMgcmV0cnlcbiAgICB0aGlzLl8kZWwub24oJ3BqYXg6dGltZW91dCcsIHRoaXMuX29uUGpheFRpbWVvdXQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fJGVsLm9uKCdwamF4OnN1Y2Nlc3MnLCB0aGlzLl9vblBqYXhTdWNjZXNzLmJpbmQodGhpcykpO1xuICAgIHRoaXMuXyRlbC5vbigncGpheDpzdGFydCcsIHRoaXMuX29uUGpheFN0YXJ0LmJpbmQodGhpcykpO1xuICAgIHRoaXMuXyRlbC5vbigncGpheDpiZWZvcmVSZXBsYWNlJywgdGhpcy5fb25QamF4QmVmb3JlUmVwbGFjZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl8kZWwub24oJ3BqYXg6ZXJyb3InLCB0aGlzLl9vblBqYXhFcnJvci5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMuXyRlbC5vbignY2xpY2snLCAndGhbZGF0YS1zb3J0YWJsZT1cInRydWVcIl0nLCB0aGlzLl9vbkNsaWNrU29ydGFibGUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fJGVsLm9uKCdjbGljaycsICcudWktcGVycGFnZS1kcm9wZG93biA+IGxpJywgdGhpcy5fb25QZXJQYWdlU2VsZWN0LmJpbmQodGhpcykpO1xuICAgIHRoaXMuXyRlbC5vbignY2xpY2snLCAnLnVpLXBhZ2Utc2VsZWN0LWRyb3Bkb3duID4gbGknLCB0aGlzLl9vblBhZ2VTZWxlY3QuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fJGVsLm9uKCdjbGljaycsICcudWktcHJldi1wYWdlJywgdGhpcy5fb25QcmV2UGFnZVNlbGVjdC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl8kZWwub24oJ2NsaWNrJywgJy51aS1uZXh0LXBhZ2UnLCB0aGlzLl9vbk5leHRQYWdlU2VsZWN0LmJpbmQodGhpcykpO1xuICAgIHRoaXMuXyRlbC5vbignY2hhbmdlJyxcbiAgICAgICd0aFtkYXRhLXNlbGVjdC1hbGwtZW5hYmxlZD1cInRydWVcIl0gaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJyxcbiAgICAgIHRoaXMuX29uSGVhZGVyQ2hlY2tib3hDaGFuZ2UuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5fZW5hYmxlUm93Q2hlY2tib3hDaGFuZ2VIYW5kbGluZygpO1xuICAgIHRoaXMuXyRlbC5vbignY2xpY2snLCAndGRbZGF0YS1wcm9wZXJ0eT1cImlkXCJdJywgdGhpcy5fb25DbGlja0lkQ29sdW1uLmJpbmQodGhpcykpO1xuXG4gICAgaWYgKHRoaXMuXyRzZWFyY2hCb3gpIHtcbiAgICAgIHRoaXMuXyRzZWFyY2hCb3gub24oJ3NlYXJjaDpzdWJtaXQnLCB0aGlzLl9vblN1Ym1pdFNlYXJjaC5iaW5kKHRoaXMpKTtcbiAgICAgIHRoaXMuXyRzZWFyY2hCb3gub24oJ3NlYXJjaDpjbGVhcicsIHRoaXMuX29uQ2xlYXJTZWFyY2guYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgdGhpcy5yZWZyZXNoUGx1Z2lucygpO1xuICAgIHRoaXMuX2luaXRQbHVnaW5SZWZyZXNoRXZlbnRzKCk7XG4gIH0sXG5cbiAgLyoqXG4gICogICBAcGFyYW0ge09iamVjdH0gYSB0ciBET00gZWxlbWVudFxuICAqICAgQHJldHVybiB7T2JqZWN0fVxuICAqL1xuICBfZ2V0UmVjb3JkOiBmdW5jdGlvbihyb3dFbCkge1xuICAgIHZhciByZWNvcmQgPSB7IGFkZGl0aW9uYWxGaWVsZHM6IHt9IH07XG5cbiAgICAkKHJvd0VsKS5jaGlsZHJlbigpLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgdmFyICRjZWxsID0gJCh0aGlzKTtcbiAgICAgIHZhciBkYXRhID0gJGNlbGwuZGF0YSgpO1xuICAgICAgcmVjb3JkW2RhdGEucHJvcGVydHldID0gZGF0YS52YWx1ZTtcblxuICAgICAgLy8gYWRkIGFkZGl0aW9uYWwgZmllbGRzLCBpZ25vcmUgY29uc3RydWN0dXJlcyBhbmQgb2JqZWN0cyAvIGFycmF5cywgYWxsb3cgcHJpbWl0aXZlc1xuICAgICAgJC5lYWNoKCRjZWxsLmRhdGEoKSwgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGtleSAhPT0gJ3Byb3BlcnR5JyAmJiBrZXkgIT09ICd2YWx1ZScpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnZnVuY3Rpb24nICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJlY29yZC5hZGRpdGlvbmFsRmllbGRzW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfSxcblxuICAvKipcbiAgKiAgIEZpbmRzIGEgcm93IGJ5IGlkIGJ5IGNvbXBhcmluZyBhZ2FpbnN0IHRoZSBjZWxsIHdpdGggZGF0YS1wcm9wZXJ0PVwiaWRcIiwgdHlwaWNhbGx5IHRoZSBmaXJzdCBjZWxsXG4gICogICBAcGFyYW0ge251bWJlcn0gaWQgdGhlIGlkIHRvIG1hdGNoXG4gICogICBAcmV0dXJuIHtvYmplY3R9IHRoZSByb3cgRE9NIGVsZW1lbnRcbiAgKi9cbiAgX2ZpbmRSb3dCeUlkOiBmdW5jdGlvbihpZCkge1xuICAgIHJldHVybiB0aGlzLl8kdGJvZHkuZmluZCgndHInKS5maWx0ZXIoZnVuY3Rpb24gKGluZGV4LCByb3dFbGVtZW50KSB7XG4gICAgICBpZiAodGhpcy5fZ2V0UmVjb3JkKHJvd0VsZW1lbnQpLmlkID09PSBpZCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LmJpbmQodGhpcykpLmdldCgwKTtcbiAgfSxcblxuICAvKipcbiAgKiAgIFVwZGF0ZXMgY2VsbCB2YWx1ZXMgZm9yIGEgZ2l2ZW4gcm93LCB1c2luZyBqUXVlcnkuZGF0YSgpIHdoaWNoIHVwZGF0ZXMgdGhlbSBpbiBtZW1vcnksIG5vdCBvbiB0aGUgb3JpZ2luYWwgZWxlbWVudCBhdHRyaWJ1dGVzXG4gICogICAgICogTm90ZTogZm9yIGVkaXRhYmxlIGNlbGxzLCBhbmQgZXZlbnR1YWxseSBhbGwgY2VsbHMsIHdpdGggYXBwcm9wcmlhdGUgYXR0cmlidXRlcywgdGhpcyB3aWxsIHVwZGF0ZSB0aGUgY2VsbCBkaXNwbGF5IHZhbHVlIGFzIHdlbGxcbiAgKiAgIEBwYXJhbSB7b2JqZWN0fSB0aGUgcm93IERPTSBlbGVtZW50XG4gICogICBAcGFyYW0ge29iamVjdH0gdGhlIG9iamVjdCBvZiBrZXkgdmFsdWUgcGFpcnMgdG8gbWF0Y2ggYW5kIHVwZGF0ZVxuICAqL1xuICBfdXBkYXRlUm93RmllbGRzOiBmdW5jdGlvbihyb3csIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgdmFyICRyb3cgPSAkKHJvdyk7XG5cbiAgICAkLmVhY2goZGF0YSwgZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgIHZhciAkY2VsbCA9ICRyb3cuZmluZCgndGRbZGF0YS1wcm9wZXJ0eT1cIicgKyBrZXkgKyAnXCJdJyk7XG4gICAgICAkY2VsbC5kYXRhKCd2YWx1ZScsIHZhbHVlKTtcbiAgICAgICRjZWxsLmZpbmQoJGNlbGwuZGF0YSgnZGlzcGxheS10YXJnZXQnKSkudGV4dCh2YWx1ZSk7XG5cbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2FsbGJhY2soJGNlbGwsIGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAqICAgUmVmcmVzaGVzIHRoZSBjb25maWd1cmVkIHBsdWdpbnMgYnkgYXBwbHlpbmcgdGhlbSB0byBhbGwgcm93c1xuICAqICAgU2VlIGRvY3MgYXQgdG9wIG9mIHRhYmxlIG1vZHVsZSBvciBhcHBseVBsdWdpbnMgZm9yIHBsdWdpbiBkZWZpbnRpb24gZGV0YWlsc1xuICAqL1xuICByZWZyZXNoUGx1Z2luczogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX29wdGlvbnMucGx1Z2lucykge1xuICAgICAgdGhpcy5fYXBwbHlQbHVnaW5zKHRoaXMuX29wdGlvbnMucGx1Z2lucyk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAqICBVcGRhdGVzIHBhcmFtZXRlcnMgYW5kIHRyaWdnZXJzIGEgdGFibGUgcmVmcmVzaFxuICAqICBAcGFyYW0ge09iamVjdH0ga2V5IHZhbHVlIHBhaXJzIHRvIHVwZGF0ZSB0aGUgcXVlcnkgc3RhdGUgd2l0aFxuICAqICBAcGFyYW0ge09iamVjdH0ga2V5IHZhbHVlIHBhaXJzIHRvIGJlIHVzZWQgYnkgbG9hZFxuICAqICBAcmV0dXJuIHtPYmplY3R9IF90aGlzLCB0aGUgbW9kdWxlIGluc3RhbmNlIG9iamVjdFxuICAqL1xuICB1cGRhdGU6IGZ1bmN0aW9uKGRhdGEsIGxvYWRQYXJhbXMpIHtcbiAgICB0aGlzLnVwZGF0ZVBhcmFtZXRlcnMoZGF0YSk7XG4gICAgdGhpcy5fbG9hZChsb2FkUGFyYW1zKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvKipcbiAgKiAgQHBhcmFtIHtPYmplY3R9IGtleSB2YWx1ZSBwYWlycyB0byBiZSB1c2VkIGJ5IGxvYWRcbiAgKiAgQHJldHVybiB7T2JqZWN0fSBfdGhpcywgdGhlIG1vZHVsZSBpbnN0YW5jZSBvYmplY3RcbiAgKi9cbiAgbG9hZDogZnVuY3Rpb24obG9hZFBhcmFtcykge1xuICAgIHRoaXMuX2xvYWQobG9hZFBhcmFtcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLyoqXG4gICogIEByZXR1cm4ge09iamVjdH0gX3RoaXMsIHRoZSBtb2R1bGUgaW5zdGFuY2Ugb2JqZWN0XG4gICovXG4gIHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2xvYWQoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvKipcbiAgKiBAcmV0dXJuIHtzdHJpbmd9IHRoZSB1cmwgdXNlZCBieSB0aGlzIHRhYmxlXG4gICovXG4gIGdldFVybDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3VybDtcbiAgfSxcblxuICAvKipcbiAgKiAgQHBhcmFtIHtPYmplY3R9IGtleSB2YWx1ZSBwYWlycyB0byB1cGRhdGUgdGhlIHF1ZXJ5IHN0YXRlIHdpdGhcbiAgKiAgQHJldHVybiB7T2JqZWN0fSBfdGhpcywgdGhlIG1vZHVsZSBpbnN0YW5jZSBvYmplY3RcbiAgKi9cbiAgdXBkYXRlUGFyYW1ldGVyczogZnVuY3Rpb24oZGF0YSkge1xuICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICBpZih0eXBlb2YgZGF0YVtrZXldID09PSAndW5kZWZpbmVkJyB8fCBkYXRhW2tleV0gPT09IG51bGwpe1xuICAgICAgICBkZWxldGUgdGhpcy5fcXVlcnlTdGF0ZVtrZXldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcXVlcnlTdGF0ZVtrZXldID0gZGF0YVtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIC8qKlxuICAqICAgQHBhcmFtIHtzdHJpbmd8QXJyYXkuPHN0cmluZz58ZnVuY3Rpb259IGEgc3RyaW5nIGtleSwgYXJyYXkgb2Yga2V5cywgb3IgZnVuY3Rpb24gdG8gZmlsdGVyXG4gICogICBAcmV0dXJuIHtvYmplY3R9IF90aGlzLCB0aGUgbW9kdWxlIGluc3RhbmNlIG9iamVjdFxuICAqXG4gICogICBSZXR1cm5pbmcgdHJ1ZSBmcm9tIGEgZmlsdGVyIGZ1bmN0aW9uIHdpbGwgZGVsZXRlIHRoZSBjdXJyZW50IGtleSBpbiBpdGVyYXRpb25cbiAgKi9cbiAgcmVtb3ZlUGFyYW1ldGVyczogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucyB8fCAoQXJyYXkuaXNBcnJheShvcHRpb25zKSAmJiAhb3B0aW9ucy5sZW5ndGgpKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAvLyBSZW1vdmUgYSBzaW5nbGUgaXRlbSBmcm9tIHRoZSBxdWVyeVN0YXRlXG4gICAgICBkZWxldGUgdGhpcy5fcXVlcnlTdGF0ZVtvcHRpb25zXTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucykpIHtcbiAgICAgIC8vIFJlbW92ZSBhbGwgb2YgdGhlIGl0ZW1zIGluIHRoZSBhcnJheVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9xdWVyeVN0YXRlW29wdGlvbnNbaV1dO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIGRlbGV0aW5nIHdoaWxlIGl0ZXJhdGluZyBpcyBva2F5XG4gICAgICAkLmVhY2godGhpcy5fcXVlcnlTdGF0ZSwgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAob3B0aW9ucyhrZXksIHZhbHVlKSkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLl9xdWVyeVN0YXRlW2tleV07XG4gICAgICAgIH1cbiAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLyoqXG4gICogIEByZXR1cm4ge09iamVjdH0gdGhlIHF1ZXJ5IHN0YXRlXG4gICovXG4gIGdldFBhcmFtZXRlcnM6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICB2YXIgc3RhdGUgPSAkLmV4dGVuZCh7fSwgdGhpcy5fcXVlcnlTdGF0ZSk7XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICQuZWFjaChzdGF0ZSwgZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoIW9wdGlvbnMoa2V5LCB2YWx1ZSkpIHtcbiAgICAgICAgICBkZWxldGUgc3RhdGVba2V5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXRlO1xuICB9LFxuXG4gIC8qKlxuICAqICAgQHJldHVybiB7bnVtYmVyfSBudW1iZXIgb2Ygcm93c1xuICAqL1xuICBnZXROdW1SZWNvcmRzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fJHRib2R5LmZpbmQoJ3RyJykubGVuZ3RoO1xuICB9LFxuXG4gIC8qKlxuICAqICAgQHJldHVybiB7bnVtYmVyfSBudW1iZXIgb2YgY29sdW1uc1xuICAqICAgTm90ZTogdGhpcyBpcyBvbmx5IHRoZSBudW1iZXIgb2YgY29sdW1ucyBpbiB0aGUgaGVhZGVyLiAgSWYgc3Vic2VxdWVudCByb3dzIGluY2x1ZGVcbiAgKiAgIHN1YmhlYWRlcnMsIHNwbGl0IGNvbHVtbnMsIG9yIGNvbHVtbnMgd2l0aCBjb2xzcGFucyBvdGhlciB0aGFuIDEsIHRoaXMgd2lsbCBOT1QgcmV0dXJuXG4gICogICB0aGUgY29ycmVjdCBudW1iZXIgb2YgY29sdW1ucyBmb3IgdGhvc2Ugcm93cy5cbiAgKi9cbiAgZ2V0TnVtQ29sdW1uczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuXyRlbC5maW5kKCd0aGVhZCB0cicpLmNoaWxkcmVuKCkubGVuZ3RoO1xuICB9LFxuXG4gIC8qKlxuICAqICAgQHJldHVybiB7Ym9vbGVhbn0gaGFzIGFueSBzZWxlY3RlZCB2YWx1ZXNcbiAgKi9cbiAgaGFzU2VsZWN0ZWRSZWNvcmRzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fJHRib2R5LmZpbmQoJ3RyLnVpLXNlbGVjdGVkJykubGVuZ3RoID4gMDtcbiAgfSxcblxuICAvKipcbiAgKiAgIEByZXR1cm4ge251bWJlcn0gbnVtYmVyIG9mIHNlbGVjdGVkIHJvd3NcbiAgKi9cbiAgZ2V0TnVtU2VsZWN0ZWRSZWNvcmRzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fJHRib2R5LmZpbmQoJ3RyLnVpLXNlbGVjdGVkJykubGVuZ3RoO1xuICB9LFxuXG4gIC8qKlxuICAqICAgQHJldHVybiB7QXJyYXkuPG9iamVjdD59IHNlbGVjdGVkIHJlY29yZHNcbiAgKi9cbiAgZ2V0U2VsZWN0ZWRSZWNvcmRzOiBmdW5jdGlvbihmb3JtYXRGbikge1xuICAgIHJldHVybiB0aGlzLl8kdGJvZHkuZmluZCgndHIudWktc2VsZWN0ZWQnKS5tYXAoZnVuY3Rpb24gKGluZGV4LCByb3dFbGVtZW50KSB7XG4gICAgICBpZiAodHlwZW9mIGZvcm1hdEZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRGbih0aGlzLl9nZXRSZWNvcmQocm93RWxlbWVudCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuX2dldFJlY29yZChyb3dFbGVtZW50KTtcbiAgICB9LmJpbmQodGhpcykpLmdldCgpO1xuICB9LFxuXG4gIC8qKlxuICAqIEByZXR1cm4ge0FycmF5LjxOdW1iZXJzPn0gc2VsZWN0ZWQgcmVjb3Jkc1xuICAqL1xuICBnZXRTZWxlY3RlZFJlY29yZElkczogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2VsZWN0ZWRSZWNvcmRzKGZ1bmN0aW9uKHJlY29yZCkgeyByZXR1cm4gcmVjb3JkLmlkOyB9KTtcbiAgfSxcblxuICAvKipcbiAgKiAgIEByZXR1cm4ge0FycmF5LjxvYmplY3Q+fSBhbGwgcmVjb3Jkc1xuICAqL1xuICBnZXRSZWNvcmRzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fJHRib2R5LmZpbmQoJ3RyJykubWFwKGZ1bmN0aW9uIChpbmRleCwgcm93RWxlbWVudCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2dldFJlY29yZChyb3dFbGVtZW50KTtcbiAgICB9LmJpbmQodGhpcykpLmdldCgpO1xuICB9LFxuXG4gIC8qKlxuICAqICAgVXBkYXRlcyBjZWxsIHZhbHVlcyBmb3IgYSBnaXZlbiByb3csIHVzaW5nIGpRdWVyeS5kYXRhKCkgd2hpY2ggdXBkYXRlcyB0aGVtIGluIG1lbW9yeSwgbm90IG9uIHRoZSBvcmlnaW5hbCBlbGVtZW50IGF0dHJpYnV0ZXNcbiAgKiAgICAgKiBOb3RlOiBmb3IgZWRpdGFibGUgY2VsbHMsIGFuZCBldmVudHVhbGx5IGFsbCBjZWxscywgd2l0aCBhcHByb3ByaWF0ZSBhdHRyaWJ1dGVzLCB0aGlzIHdpbGwgdXBkYXRlIHRoZSBjZWxsIGRpc3BsYXkgdmFsdWUgYXMgd2VsbFxuICAqICAgICAqICAgICAgIHNlZSB1cGRhdGVSb3dGaWVsZHMgZm9yIG1vcmUgZGV0YWlsc1xuICAqXG4gICogICBAcGFyYW0ge251bWJlcn0gdGhlIGlkIG9mIHRoZSByb3csIGxvY2F0ZWQgaW4gdGhlIHJvdydzIGZpcnN0IGNlbGwsIGRhdGEtcHJvcGVydHk9XCJpZFwiXG4gICogICBAcGFyYW0ge09iamVjdH0gYW5kIG9iamVjdCBvZiBrZXkgdmFsdWUgcGFpcnMgdG8gdXBkYXRlIGNvcnJlc3BvbmRpbmcgY2VsbCBkYXRhLXByb3BlcnR5IC0gZGF0YS12YWx1ZSBwYWlyc1xuICAqICAgQHBhcmFtIHtmdW5jdGlvbn0gYSBjYWxsYmFjayB0byBwcm9jZXNzIHRoZSByb3dcbiAgKi9cbiAgdXBkYXRlUm93OiBmdW5jdGlvbihpZCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICB0aGlzLl91cGRhdGVSb3dGaWVsZHModGhpcy5fZmluZFJvd0J5SWQoaWQpLCBkYXRhLCBjYWxsYmFjayk7XG4gIH0sXG5cbiAgZ2V0TnVtVG90YWxSb3dzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fdG90YWxSb3dzO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQamF4VGFibGU7XG4iXX0=
