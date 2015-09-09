(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var CellPluginMixin = require('./cell_plugin_mixin');

function AjaxCellMixin(el, options) {
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

if (typeof module === 'object') {
  module.exports = AjaxCellMixin;
} else if (typeof define === 'function') {
  define(function() { return AjaxCellMixin; });
} else {
  window.AjaxCellMixin = AjaxCellMixin;
}


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

if (typeof module === 'object') {
  module.exports = CellPluginMixin;
} else if (typeof define === 'function') {
  define(function() { return CellPluginMixin; });
} else {
  window.CellPluginMixin = CellPluginMixin;
}

},{}],3:[function(require,module,exports){
'use strict';
var AjaxCellMixin = require('./ajax_cell_mixin');
var widget = require('../util/widget');

/**
*   Editable Dropdown Plugin
*/
function EditableDropdownPlugin(element, options) {
  options.url = $(element).find('.ui-select-dropdown').data('url');
  AjaxCellMixin.call(this, element, options);
  this._record = options.record;
  this._requiredFields = this._$el.data('required-fields') ? this._$el.data('required-fields').split(',') : [];

  this._init();
}

EditableDropdownPlugin.prototype._init = function () {
  this._$el.on('click', '[data-dropdown-option]', this._createOnDropdownItemClick.bind(this));
  this._$el.on('plugin:save:success', this._onPluginSaveSuccess.bind(this));
  this._$el.on('plugin:save:error', this._onPluginSaveError.bind(this));
};

EditableDropdownPlugin.prototype._createOnDropdownItemClick = function (e) {
  var $item = $(e.currentTarget);
  var record = {};

  record.id = this._record.id;
  record[$item.data('name')] = $item.data('value');

  $.each(this._requiredFields, function (index, key) {
    record[key] = this._record.additionalFields[key];
  }.bind(this));

  var payload = {
    dropdown: this,
    selectedItem: $item,
    record: record
  };

  this._$el.trigger('dropdown:changed', payload);

  if (!payload.cancel) {
    this._saveChanges($item, record);
  }
};

EditableDropdownPlugin.prototype._saveChanges = function($selectedItem, record) {
  this._updateLabel($selectedItem);
  this._save(record);
};

EditableDropdownPlugin.prototype._updateLabel = function($selectedItem) {
  var $label = this._$el.find('.dropdown-label');
  var newSelection = $selectedItem.find('a').html();
  $label.html(newSelection);
};

EditableDropdownPlugin.prototype._onPluginSaveSuccess = function(e, data) {
  this._$el.trigger('message', { status: 'success', message: data.message });
};

EditableDropdownPlugin.prototype._onPluginSaveError = function(e, data) {
  this._$el.trigger('message', { status: 'error', message: data.message });
};

if (typeof module === 'object') {
  module.exports = EditableDropdownPlugin;
} else if (typeof define === 'function') {
  define(function() { return EditableDropdownPlugin; });
} else {
  window.EditableDropdownPlugin = EditableDropdownPlugin;
}

widget('editableDropdownPlugin', EditableDropdownPlugin);

},{"../util/widget":7,"./ajax_cell_mixin":1}],4:[function(require,module,exports){
'use strict';
var widget = require('../util/widget');
var AjaxCellMixin = require('./ajax_cell_mixin');

/**
*   A simple delete record by click plugin. Uses the row id (pk/primary key)
*   TODO: should probably use DELETE verb
*/
function RemoveRowPlugin(element, options) {
  AjaxCellMixin.call(this, element, options)

  this._pk = this._$el.data('pk'); // could use this or options.record.id

  this._init();
}

RemoveRowPlugin.prototype._init = function() {
  // since click initializes, it is also a trigger. no addition handler is attached
  this._onClick();
};

RemoveRowPlugin.prototype._onClick = function(e) {
  this._save({ pk: this._pk });
};

if (typeof module === 'object') {
  module.exports = RemoveRowPlugin;
} else if (typeof define === 'function') {
  define(function() { return RemoveRowPlugin; });
} else {
  window.RemoveRowPlugin = RemoveRowPlugin;
}

widget('removeRowPlugin', RemoveRowPlugin);

},{"../util/widget":7,"./ajax_cell_mixin":1}],5:[function(require,module,exports){
'use strict';
var widget = require('../util/widget');

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

if (typeof module === 'object') {
  module.exports = SearchBox;
} else if (typeof define === 'function') {
  define(function() { return SearchBox; });
} else {
  window.PjaxTableSearch = SearchBox;
}

widget('pjaxTableSearch', SearchBox);
// auto init search boxes
$(function() { $('[data-pjax-table-search][data-auto-init="true"]').pjaxTableSearch({}); });

},{"../util/widget":7}],6:[function(require,module,exports){
'use strict';
var widget = require('./util/widget');

// Bundled Plugin Mixins
var CellPluginMixin = require('./cell_plugins/cell_plugin_mixin');
var AjaxCellMixin = require('./cell_plugins/ajax_cell_mixin');

// Bundled Table Cell Plugins, ready for configuration
var EditableDropdownPlugin = require('./cell_plugins/editable_dropdown');
var RemoveRowPlugin = require('./cell_plugins/remove_row');

// Bundled External Plugins
var SearchBox = require('./external_plugins/search_box');

// Not Bundled
// EditableCellPlugin ( because it includes multiple additional dependencies )

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

if (typeof module === 'object') {
  module.exports = PjaxTable;
} else if (typeof define === 'function') {
  define(function() { return PjaxTable; });
}

// expose table and plugins so they may be easily extended at will
window.PjaxTable = PjaxTable;
window.PjaxTableShared = {
  CellPluginMixin: CellPluginMixin,
  AjaxCellMixin: AjaxCellMixin,
  EditableDropdownPlugin: EditableDropdownPlugin,
  RemoveRowPlugin: RemoveRowPlugin,
  SearchBox: SearchBox
};
widget('pjaxTable', PjaxTable);
// auto init
$(function(){ $('[data-pjax-table][data-auto-init]').pjaxTable(window.PjaxTableConfig = window.PjaxTableConfig || {}); });

},{"./cell_plugins/ajax_cell_mixin":1,"./cell_plugins/cell_plugin_mixin":2,"./cell_plugins/editable_dropdown":3,"./cell_plugins/remove_row":4,"./external_plugins/search_box":5,"./util/widget":7}],7:[function(require,module,exports){
'use strict';
var slice = Array.prototype.slice;

/**
*   @constructor
*   defaults to prototype based widget construction with new
*   supports module pattern through a flag
*
*   @param {string} name the name or namespace of the widget
*   @param {function} widgetConstructor the constructor function for the widget
*   @param {boolean} isModule whether this module is defined using the module pattern
*/
function widget(name, widgetConstructor) {
  var namespace = $;
  var names = name.split('.');
  var finalName = names.pop();
  var length;

  if (!names.length) {
    names = ['PjaxTable', 'widget']; //
  }

  length = names.length;
  for(var i = 0; i < length; i++) {
    if (!namespace[names[i]]) {
      namespace[names[i]] = {};
    }
    namespace = namespace[names[i]];
  }

  /**
  *   builder is the function that is attached to $.fn
  *   and controls instance construction or method execution
  *   on a jQuery object's element collection
  *
  *   @param {Object|string|undefined}
  *     object for configuration of a new instance
  *     string for method execution on instances in the collection
  *     undefined/nothing to receive the widget instance(s) in the collection
  *
  *   @return {Object|Array<object>|?|Array<?>} returns
  *     the widget instance object, and array of instance objects,
  *     anything returned by an instance method, or
  *     any array of any things returned by instance methods
  */
  function builder(options) {
    var args = slice.call(arguments);
    var values = []; // return values

    $(this).each(function() {
      // get the current instance or create a new one
      var $el = $(this);
      var widget = $el.data(finalName);
      var methodReturn;

      if (!widget) {
        widget = $el.data(finalName, new widgetConstructor(this, options)).data(finalName);
      }

      // execute methods and return the method return or this element for chaining
      if (typeof options === 'string') {
        // special case for resetting widgets, cleanup and reset
        if (options === 'destroy') {
          if (typeof widget.destroy === 'function') {
            widget.destroy();
          }
          delete $el.data()[finalName];
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

  if (!$.fn[finalName]) {
    $.fn[finalName] = builder;
  }
  namespace[finalName] = builder;

  return builder;
}

module.exports = widget;

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY2VsbF9wbHVnaW5zL2FqYXhfY2VsbF9taXhpbi5qcyIsInNyYy9qcy9jZWxsX3BsdWdpbnMvY2VsbF9wbHVnaW5fbWl4aW4uanMiLCJzcmMvanMvY2VsbF9wbHVnaW5zL2VkaXRhYmxlX2Ryb3Bkb3duLmpzIiwic3JjL2pzL2NlbGxfcGx1Z2lucy9yZW1vdmVfcm93LmpzIiwic3JjL2pzL2V4dGVybmFsX3BsdWdpbnMvc2VhcmNoX2JveC5qcyIsInNyYy9qcy9wamF4X3RhYmxlLmpzIiwic3JjL2pzL3V0aWwvd2lkZ2V0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG52YXIgQ2VsbFBsdWdpbk1peGluID0gcmVxdWlyZSgnLi9jZWxsX3BsdWdpbl9taXhpbicpO1xuXG5mdW5jdGlvbiBBamF4Q2VsbE1peGluKGVsLCBvcHRpb25zKSB7XG4gIENlbGxQbHVnaW5NaXhpbi5jYWxsKHRoaXMsIGVsLCBvcHRpb25zKTtcblxuICB0aGlzLl91cmwgPSBvcHRpb25zLnVybCB8fCB0aGlzLl8kZWwuZGF0YSgndXJsJyk7XG5cbiAgdGhpcy5fc2F2ZSA9IGZ1bmN0aW9uIHNhdmUoZGF0YSkge1xuICAgIHRoaXMuXyRlbC50cmlnZ2VyKCdwbHVnaW46YmVmb3JlOnNhdmUnKTtcblxuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgdHlwZTogJ1BPU1QnLFxuICAgICAgdXJsOiB0aGlzLl91cmwsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgY29udGV4dDogdGhpc1xuICAgIH0pLmRvbmUoZnVuY3Rpb24gKGRhdGEsIHRleHRTdGF0dXMsIGpxWEhSKSB7XG4gICAgICBpZiAoZGF0YS5zdGF0dXMgPT09ICdzdWNjZXNzJykge1xuICAgICAgICB0aGlzLl8kZWwudHJpZ2dlcigncGx1Z2luOnNhdmU6c3VjY2VzcycsIGRhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3BsdWdpbjpzYXZlOmVycm9yJywgZGF0YSk7XG4gICAgICB9XG4gICAgfSkuZmFpbChmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICB0aGlzLl8kZWwudHJpZ2dlcigncGx1Z2luOnNhdmU6ZXJyb3InLCB7XG4gICAgICAgIHRleHRTdGF0dXM6IHRleHRTdGF0dXMsXG4gICAgICAgIGVycm9yVGhyb3duOiBlcnJvclRocm93bixcbiAgICAgICAganFYSFI6IGpxWEhSXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbn1cblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gQWpheENlbGxNaXhpbjtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJykge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBBamF4Q2VsbE1peGluOyB9KTtcbn0gZWxzZSB7XG4gIHdpbmRvdy5BamF4Q2VsbE1peGluID0gQWpheENlbGxNaXhpbjtcbn1cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiogICBAcGFyYW0ge2RvbUVsZW1lbnR9IGVsIHRoZSBwbHVnaW4gdGFyZ2V0IGVsZW1lbnQgcmVmZXJlbmNlXG4qICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiogICBAcGFyYW0ge29iamVjdH0gb3B0aW9ucy5xdWVyeVN0YXRlOiBhIGNvcHkgb2YgdGhlIHRhYmxlJ3MgY3VycmVudCBxdWVyeSBzdGF0ZVxuKiAgIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zLnJlY29yZDogdGhpcyB0YWJsZSByb3cncyByZWNvcmQgb2JqZWN0XG4qICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMuZXZlbnQ6IHRoZSBjbGljayBldmVudCB0aGF0IHRyaWdnZXJlZCBwbHVnaW4gY29uc3RydWN0aW9uXG4qL1xuZnVuY3Rpb24gQ2VsbFBsdWdpbk1peGluKGVsLCBvcHRpb25zKSB7XG4gICAgdGhpcy5fJGVsID0gJChlbCk7XG4gICAgdGhpcy5faW5pdGlhbFF1ZXJ5U3RhdGUgPSBvcHRpb25zLnF1ZXJ5U3RhdGU7XG4gICAgdGhpcy5fcmVjb3JkID0gb3B0aW9ucy5yZWNvcmQ7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jykge1xuICBtb2R1bGUuZXhwb3J0cyA9IENlbGxQbHVnaW5NaXhpbjtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJykge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBDZWxsUGx1Z2luTWl4aW47IH0pO1xufSBlbHNlIHtcbiAgd2luZG93LkNlbGxQbHVnaW5NaXhpbiA9IENlbGxQbHVnaW5NaXhpbjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcbnZhciBBamF4Q2VsbE1peGluID0gcmVxdWlyZSgnLi9hamF4X2NlbGxfbWl4aW4nKTtcbnZhciB3aWRnZXQgPSByZXF1aXJlKCcuLi91dGlsL3dpZGdldCcpO1xuXG4vKipcbiogICBFZGl0YWJsZSBEcm9wZG93biBQbHVnaW5cbiovXG5mdW5jdGlvbiBFZGl0YWJsZURyb3Bkb3duUGx1Z2luKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucy51cmwgPSAkKGVsZW1lbnQpLmZpbmQoJy51aS1zZWxlY3QtZHJvcGRvd24nKS5kYXRhKCd1cmwnKTtcbiAgQWpheENlbGxNaXhpbi5jYWxsKHRoaXMsIGVsZW1lbnQsIG9wdGlvbnMpO1xuICB0aGlzLl9yZWNvcmQgPSBvcHRpb25zLnJlY29yZDtcbiAgdGhpcy5fcmVxdWlyZWRGaWVsZHMgPSB0aGlzLl8kZWwuZGF0YSgncmVxdWlyZWQtZmllbGRzJykgPyB0aGlzLl8kZWwuZGF0YSgncmVxdWlyZWQtZmllbGRzJykuc3BsaXQoJywnKSA6IFtdO1xuXG4gIHRoaXMuX2luaXQoKTtcbn1cblxuRWRpdGFibGVEcm9wZG93blBsdWdpbi5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuXyRlbC5vbignY2xpY2snLCAnW2RhdGEtZHJvcGRvd24tb3B0aW9uXScsIHRoaXMuX2NyZWF0ZU9uRHJvcGRvd25JdGVtQ2xpY2suYmluZCh0aGlzKSk7XG4gIHRoaXMuXyRlbC5vbigncGx1Z2luOnNhdmU6c3VjY2VzcycsIHRoaXMuX29uUGx1Z2luU2F2ZVN1Y2Nlc3MuYmluZCh0aGlzKSk7XG4gIHRoaXMuXyRlbC5vbigncGx1Z2luOnNhdmU6ZXJyb3InLCB0aGlzLl9vblBsdWdpblNhdmVFcnJvci5iaW5kKHRoaXMpKTtcbn07XG5cbkVkaXRhYmxlRHJvcGRvd25QbHVnaW4ucHJvdG90eXBlLl9jcmVhdGVPbkRyb3Bkb3duSXRlbUNsaWNrID0gZnVuY3Rpb24gKGUpIHtcbiAgdmFyICRpdGVtID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICB2YXIgcmVjb3JkID0ge307XG5cbiAgcmVjb3JkLmlkID0gdGhpcy5fcmVjb3JkLmlkO1xuICByZWNvcmRbJGl0ZW0uZGF0YSgnbmFtZScpXSA9ICRpdGVtLmRhdGEoJ3ZhbHVlJyk7XG5cbiAgJC5lYWNoKHRoaXMuX3JlcXVpcmVkRmllbGRzLCBmdW5jdGlvbiAoaW5kZXgsIGtleSkge1xuICAgIHJlY29yZFtrZXldID0gdGhpcy5fcmVjb3JkLmFkZGl0aW9uYWxGaWVsZHNba2V5XTtcbiAgfS5iaW5kKHRoaXMpKTtcblxuICB2YXIgcGF5bG9hZCA9IHtcbiAgICBkcm9wZG93bjogdGhpcyxcbiAgICBzZWxlY3RlZEl0ZW06ICRpdGVtLFxuICAgIHJlY29yZDogcmVjb3JkXG4gIH07XG5cbiAgdGhpcy5fJGVsLnRyaWdnZXIoJ2Ryb3Bkb3duOmNoYW5nZWQnLCBwYXlsb2FkKTtcblxuICBpZiAoIXBheWxvYWQuY2FuY2VsKSB7XG4gICAgdGhpcy5fc2F2ZUNoYW5nZXMoJGl0ZW0sIHJlY29yZCk7XG4gIH1cbn07XG5cbkVkaXRhYmxlRHJvcGRvd25QbHVnaW4ucHJvdG90eXBlLl9zYXZlQ2hhbmdlcyA9IGZ1bmN0aW9uKCRzZWxlY3RlZEl0ZW0sIHJlY29yZCkge1xuICB0aGlzLl91cGRhdGVMYWJlbCgkc2VsZWN0ZWRJdGVtKTtcbiAgdGhpcy5fc2F2ZShyZWNvcmQpO1xufTtcblxuRWRpdGFibGVEcm9wZG93blBsdWdpbi5wcm90b3R5cGUuX3VwZGF0ZUxhYmVsID0gZnVuY3Rpb24oJHNlbGVjdGVkSXRlbSkge1xuICB2YXIgJGxhYmVsID0gdGhpcy5fJGVsLmZpbmQoJy5kcm9wZG93bi1sYWJlbCcpO1xuICB2YXIgbmV3U2VsZWN0aW9uID0gJHNlbGVjdGVkSXRlbS5maW5kKCdhJykuaHRtbCgpO1xuICAkbGFiZWwuaHRtbChuZXdTZWxlY3Rpb24pO1xufTtcblxuRWRpdGFibGVEcm9wZG93blBsdWdpbi5wcm90b3R5cGUuX29uUGx1Z2luU2F2ZVN1Y2Nlc3MgPSBmdW5jdGlvbihlLCBkYXRhKSB7XG4gIHRoaXMuXyRlbC50cmlnZ2VyKCdtZXNzYWdlJywgeyBzdGF0dXM6ICdzdWNjZXNzJywgbWVzc2FnZTogZGF0YS5tZXNzYWdlIH0pO1xufTtcblxuRWRpdGFibGVEcm9wZG93blBsdWdpbi5wcm90b3R5cGUuX29uUGx1Z2luU2F2ZUVycm9yID0gZnVuY3Rpb24oZSwgZGF0YSkge1xuICB0aGlzLl8kZWwudHJpZ2dlcignbWVzc2FnZScsIHsgc3RhdHVzOiAnZXJyb3InLCBtZXNzYWdlOiBkYXRhLm1lc3NhZ2UgfSk7XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBFZGl0YWJsZURyb3Bkb3duUGx1Z2luO1xufSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nKSB7XG4gIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIEVkaXRhYmxlRHJvcGRvd25QbHVnaW47IH0pO1xufSBlbHNlIHtcbiAgd2luZG93LkVkaXRhYmxlRHJvcGRvd25QbHVnaW4gPSBFZGl0YWJsZURyb3Bkb3duUGx1Z2luO1xufVxuXG53aWRnZXQoJ2VkaXRhYmxlRHJvcGRvd25QbHVnaW4nLCBFZGl0YWJsZURyb3Bkb3duUGx1Z2luKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciB3aWRnZXQgPSByZXF1aXJlKCcuLi91dGlsL3dpZGdldCcpO1xudmFyIEFqYXhDZWxsTWl4aW4gPSByZXF1aXJlKCcuL2FqYXhfY2VsbF9taXhpbicpO1xuXG4vKipcbiogICBBIHNpbXBsZSBkZWxldGUgcmVjb3JkIGJ5IGNsaWNrIHBsdWdpbi4gVXNlcyB0aGUgcm93IGlkIChway9wcmltYXJ5IGtleSlcbiogICBUT0RPOiBzaG91bGQgcHJvYmFibHkgdXNlIERFTEVURSB2ZXJiXG4qL1xuZnVuY3Rpb24gUmVtb3ZlUm93UGx1Z2luKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgQWpheENlbGxNaXhpbi5jYWxsKHRoaXMsIGVsZW1lbnQsIG9wdGlvbnMpXG5cbiAgdGhpcy5fcGsgPSB0aGlzLl8kZWwuZGF0YSgncGsnKTsgLy8gY291bGQgdXNlIHRoaXMgb3Igb3B0aW9ucy5yZWNvcmQuaWRcblxuICB0aGlzLl9pbml0KCk7XG59XG5cblJlbW92ZVJvd1BsdWdpbi5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbigpIHtcbiAgLy8gc2luY2UgY2xpY2sgaW5pdGlhbGl6ZXMsIGl0IGlzIGFsc28gYSB0cmlnZ2VyLiBubyBhZGRpdGlvbiBoYW5kbGVyIGlzIGF0dGFjaGVkXG4gIHRoaXMuX29uQ2xpY2soKTtcbn07XG5cblJlbW92ZVJvd1BsdWdpbi5wcm90b3R5cGUuX29uQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gIHRoaXMuX3NhdmUoeyBwazogdGhpcy5fcGsgfSk7XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBSZW1vdmVSb3dQbHVnaW47XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gUmVtb3ZlUm93UGx1Z2luOyB9KTtcbn0gZWxzZSB7XG4gIHdpbmRvdy5SZW1vdmVSb3dQbHVnaW4gPSBSZW1vdmVSb3dQbHVnaW47XG59XG5cbndpZGdldCgncmVtb3ZlUm93UGx1Z2luJywgUmVtb3ZlUm93UGx1Z2luKTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciB3aWRnZXQgPSByZXF1aXJlKCcuLi91dGlsL3dpZGdldCcpO1xuXG4vKipcbipcbiovXG5mdW5jdGlvbiBTZWFyY2hCb3goZWwsIG9wdGlvbnMpIHtcbiAgdGhpcy5fJGVsID0gJChlbCk7XG4gIHRoaXMuXyRzZWFyY2hGaWx0ZXIgPSB0aGlzLl8kZWwuZmluZCgnaW5wdXRbdHlwZT1cInNlYXJjaFwiXScpO1xuXG4gIHRoaXMuX2luaXQoKTtcbn1cblxuU2VhcmNoQm94LnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl8kZWwuZmluZCgnLnVpLXNlYXJjaCcpLmNsaWNrKHRoaXMuX29uQ2xpY2tTZWFyY2guYmluZCh0aGlzKSk7XG4gIHRoaXMuXyRlbC5maW5kKCcudWktY2xvc2UnKS5jbGljayh0aGlzLl9vbkNsaWNrQ2xvc2UuYmluZCh0aGlzKSk7XG4gIHRoaXMuXyRzZWFyY2hGaWx0ZXIua2V5dXAodGhpcy5fb25JbnB1dEtleXVwLmJpbmQodGhpcykpO1xufTtcblxuU2VhcmNoQm94LnByb3RvdHlwZS5fb25DbGlja1NlYXJjaCA9IGZ1bmN0aW9uKGUpIHtcbiAgdGhpcy5fJGVsLnRyaWdnZXIoJ3NlYXJjaDpzdWJtaXQnLCB0aGlzLl8kc2VhcmNoRmlsdGVyLnZhbCgpKTtcbn07XG5cblNlYXJjaEJveC5wcm90b3R5cGUuX29uSW5wdXRLZXl1cCA9IGZ1bmN0aW9uKGUpIHtcbiAgdGhpcy5fJGVsLmZpbmQoJy51aS1jbG9zZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgaWYgKGUud2hpY2ggPT09IDEzKSB7ICAgICAgICAgIC8vZW50ZXIgLyByZXR1cm5cbiAgICB0aGlzLl8kZWwudHJpZ2dlcignc2VhcmNoOnN1Ym1pdCcsICQoZS5jdXJyZW50VGFyZ2V0KS52YWwoKSk7XG4gIH0gZWxzZSBpZiAoZS53aGljaCA9PSAyNykgeyAgICAvL2VzY2FwZVxuICAgIHRoaXMuX2NsZWFyU2VhcmNoKCk7XG4gIH1cbn07XG5cblNlYXJjaEJveC5wcm90b3R5cGUuX29uQ2xpY2tDbG9zZSA9IGZ1bmN0aW9uKGUpIHtcbiAgdGhpcy5fY2xlYXJTZWFyY2goKTtcbn07XG5cblNlYXJjaEJveC5wcm90b3R5cGUuX2NsZWFyU2VhcmNoID0gZnVuY3Rpb24oZSkge1xuICB0aGlzLl8kc2VhcmNoRmlsdGVyLnZhbCgnJyk7XG4gIHRoaXMuXyRlbC50cmlnZ2VyKCdzZWFyY2g6Y2xlYXInKTtcbiAgdGhpcy5fJGVsLmZpbmQoJy51aS1jbG9zZScpLmFkZENsYXNzKCdoaWRkZW4nKTtcbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jykge1xuICBtb2R1bGUuZXhwb3J0cyA9IFNlYXJjaEJveDtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJykge1xuICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBTZWFyY2hCb3g7IH0pO1xufSBlbHNlIHtcbiAgd2luZG93LlBqYXhUYWJsZVNlYXJjaCA9IFNlYXJjaEJveDtcbn1cblxud2lkZ2V0KCdwamF4VGFibGVTZWFyY2gnLCBTZWFyY2hCb3gpO1xuLy8gYXV0byBpbml0IHNlYXJjaCBib3hlc1xuJChmdW5jdGlvbigpIHsgJCgnW2RhdGEtcGpheC10YWJsZS1zZWFyY2hdW2RhdGEtYXV0by1pbml0PVwidHJ1ZVwiXScpLnBqYXhUYWJsZVNlYXJjaCh7fSk7IH0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHdpZGdldCA9IHJlcXVpcmUoJy4vdXRpbC93aWRnZXQnKTtcblxuLy8gQnVuZGxlZCBQbHVnaW4gTWl4aW5zXG52YXIgQ2VsbFBsdWdpbk1peGluID0gcmVxdWlyZSgnLi9jZWxsX3BsdWdpbnMvY2VsbF9wbHVnaW5fbWl4aW4nKTtcbnZhciBBamF4Q2VsbE1peGluID0gcmVxdWlyZSgnLi9jZWxsX3BsdWdpbnMvYWpheF9jZWxsX21peGluJyk7XG5cbi8vIEJ1bmRsZWQgVGFibGUgQ2VsbCBQbHVnaW5zLCByZWFkeSBmb3IgY29uZmlndXJhdGlvblxudmFyIEVkaXRhYmxlRHJvcGRvd25QbHVnaW4gPSByZXF1aXJlKCcuL2NlbGxfcGx1Z2lucy9lZGl0YWJsZV9kcm9wZG93bicpO1xudmFyIFJlbW92ZVJvd1BsdWdpbiA9IHJlcXVpcmUoJy4vY2VsbF9wbHVnaW5zL3JlbW92ZV9yb3cnKTtcblxuLy8gQnVuZGxlZCBFeHRlcm5hbCBQbHVnaW5zXG52YXIgU2VhcmNoQm94ID0gcmVxdWlyZSgnLi9leHRlcm5hbF9wbHVnaW5zL3NlYXJjaF9ib3gnKTtcblxuLy8gTm90IEJ1bmRsZWRcbi8vIEVkaXRhYmxlQ2VsbFBsdWdpbiAoIGJlY2F1c2UgaXQgaW5jbHVkZXMgbXVsdGlwbGUgYWRkaXRpb25hbCBkZXBlbmRlbmNpZXMgKVxuXG4vKipcbiogICBUYWJsZSBpbXBsZW1lbnRzIHNjcmlwdCBjb250cm9scyBmb3IgcGpheCB0YWJsZVxuKiAgIFwiX1wiIHByZWZpeGVkIG1ldGhvZHMgYXJlIGNvbnNpZGVyZWQgaW50ZXJuYWwgdXNhZ2Ugb25seVxuKlxuKiAgIEBjb25zdHJ1Y3RvclxuKlxuKiAgIEBwYXJhbSB7b2JqZWN0fSBlbCBpcyB0aGUgdGFibGUgY29udGFpbmVyIGVsZW1lbnQgdGhlIG1vZHVsZSBpcyBiZWluZyBpbml0aWFsaXplZCB3aXRoXG4qICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiogICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnVybCB0aGUgdXJsIHRvIGJlIHVzZWQgZm9yIGZldGNoaW5nIHRhYmxlIG1hcmt1cFxuKiAgICAgQHBhcmFtIHtBcnJheTxvYmplY3Q+fSBvcHRpb25zLnJlZnJlc2hFdmVudHMgYSBsaXN0IG9mIGRlbGVnYXRlZCBldmVudCBjb25maWd1cmF0aW9ucyB0aGF0IHNob3VsZCB0cmlnZ2VyIGEgdGFibGUgcmVmcmVzaC5cbiogICAgICAgZXZlbnQgbGlzdGVuZXJzIGFyZSBhdHRhY2hlZCBhdCB0aGUgdGFibGUgY29udGFpbmVyIGVsZW1lbnQgbGV2ZWwsIGZpbHRlcnMgYXJlIG9wdGlvbmFsLlxuKiAgICAgICBjb25maWcgZXhhbXBsZTogW3sgZXZlbnROYW1lOiAnY2xpY2snLCBmaWx0ZXI6ICcubXktY2xhc3Mtc2VsZWN0b3InIH1dXG4qICAgICBAcGFyYW0ge0FycmF5PG9iamVjdD59IG9wdGlvbnMucGx1Z2lucyBhIGxpc3Qgb2YgalF1ZXJ5IHByb3RvdHlwZSBiYXNlZCBwbHVnaW4gY29uZmlndXJhdGlvbnMgdG8gYmUgaW50aWFsaXplZCBhbmRcbiogICAgICAgcmUtaW5pdGlhbGl6ZWQgb24gdGFibGUgbG9hZC4gUGx1Z2lucyBhcmUgaW5pdGlhbGl6ZWQgZm9yIGVhY2ggcm93LCBiZWluZyBwYXNzZWQgdGhlIHJvdyByZWNvcmQgYW5kIGN1cnJlbnQgcXVlcnkgc3RhdGUuXG4qICAgICAgIGNvbmZpZyBleGFtcGxlOiBbeyB0YXJnZXQ6ICdbZGF0YS1wbHVnaW4tZWxlbWVudC1zZWxlY3Rvcl0nLCBjb25zdHJ1Y3Rvck5hbWU6ICdteVBsdWdpbid9XVxuKiAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLmFqYXhPbmx5IEZsYWcgZm9yIGFqYXggb25seSAoIGRpc2FibGVkIGJ5IGRlZmF1bHQgKVxuKiAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnB1c2hTdGF0ZSBQYXNzZXMgdGhlIHB1c2ggc3RhdGUgZmxhZyB0byBwamF4ICggcHVzaCBzdGF0ZSBlbmFibGVkIGJ5IGRlZmF1bHQgKVxuKiAgICAgQHBhcmFtIHtib29sZWFufSBvcHRpb25zLnBhZ2luYXRlZCBGbGFnIGZvciBwYWdpbmF0aW9uICggZW5hYmxlZCBieSBkZWZhdWx0IClcbiogICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnBqYXhDb250YWluZXIgSUQgU2VsZWN0b3IgZm9yIHRoZSBwamF4IGNvbnRhaW5lciwgZGVmYXVsdHMgdG8gdGhlIGluaXRpYWxpemluZ1xuKiAgICAgICBlbGVtZW50J3MgaWQgYXR0cmlidXRlXG4qICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLm5vRGF0YVRlbXBsYXRlIEEgZnVuY3Rpb24gdG8gYmUgdXNlZCBmb3IgY3JlYXRpbmcgdGhlIG5vIGRhdGEgbWVzc2FnZVxuKiAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc2VhcmNoSWQgIEEgc2VsZWN0b3IgZm9yIGEgc2VhcmNoIGJveCB0byBiZSB1c2VkIHdpdGggdGhlIHRhYmxlLlxuKiAgICAgQHBhcmFtIHtzdHJpbmd9IG9wdGlvbnMuc29ydFF1ZXJ5S2V5IFRoZSBrZXkgdG8gYmUgdXNlZCBpbiBjcmVhdGluZyB0aGUgc29ydCBxdWVyeSBzdHJpbmdcbiogICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnBhZ2VRdWVyeUtleSBUaGUga2V5IHRvIGJlIHVzZWQgaW4gY3JlYXRpbmcgdGhlIHBhZ2UgcXVlcnkgc3RyaW5nXG4qICAgICBAcGFyYW0ge3N0cmluZ30gb3B0aW9ucy5wZXJQYWdlUXVlcnlLZXkgVGhlIGtleSB0byBiZSB1c2VkIGluIGNyZWF0aW5nIHRoZSBwZXIgcGFnZSBxdWVyeSBzdHJpbmdcbiogICAgIEBwYXJhbSB7c3RyaW5nfSBvcHRpb25zLnNlYXJjaFF1ZXJ5S2V5IFRoZSBrZXkgdG8gYmUgdXNlZCBpbiBjcmVhdGluZyB0aGUgc2VhcmNoIHF1ZXJ5IHN0cmluZ1xuKiAgICAgQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMucXVlcnlTdGF0ZSBhbiBvcHRpb25hbCBxdWVyeSBzdGF0ZSB0byBleHRlbmQgd2l0aCBvbiBpbml0aWFsaXphdGlvblxuKlxuKiAgIERhdGEgQXR0cmlidXRlIFBhcmFtcywgcGFyYW1ldGVycyBleHBlY3RlZCB0byBiZSBpbmNsdWRlZCBvbiB0aGUgdGFibGUgY29udGFpbmVyIGVsZW1lbnQgZm9yIGluaXRpYWxpemF0aW9uXG4qICAgQHBhcmFtIHtzdHJpbmd9IGRhdGEtdXJsIHRoZSB1cmwgdG8gYmUgdXNlZCBmb3IgZmV0Y2hpbmcgdGFibGUgbWFya3VwXG4qICAgQHBhcmFtIHtzdHJpbmd9IGRhdGEtcGpheC1jb250YWluZXIgdGhlIHNlbGVjdG9yIGZvciB0aGUgY29udGFpbmVyIHRvIGJlIHBhc3NlZCB0byBwamF4IHJlcXVlc3RzXG4qICAgQHBhcmFtIHtib29sZWFufSBkYXRhLWFqYXgtb25seSB3aGV0aGVyIHRvIG5vdCB0byBkaXNhYmxlIHBqYXggYW5kIGVuYWJsZSBhamF4XG4qICAgQHBhcmFtIHtib29sZWFufSBkYXRhLXB1c2gtc3RhdGUgYSBmbGFnIGZvciB3aGV0aGVyIG9yIG5vdCB0byBlbmFibGUgcGpheCBwdXNoIHN0YXRlXG4qICAgQHBhcmFtIHtib29sZWFufSBkYXRhLXBhZ2luYXRlZCB3aGV0aGVyIG9yIG5vdCBwYWdpbmF0aW9uIGlzIGVuYWJsZWRcbiogICBAcGFyYW0ge3N0cmluZ30gZGF0YS1zZWFyY2gtaWQgYW4gb3B0aW9uYWwgc2VhcmNoIGNvbnRyb2wgZWxlbWVudCBpZFxuKiAgIEBwYXJhbSB7c3RyaW5nfSBkYXRhLXNvcnQtcXVlcnkta2V5IHRoZSBzdHJpbmcga2V5IHRvIGJlIHVzZWQgaW4gYnVpbGRpbmcgdGhlIHNlYXJjaCBxdWVyeVxuKiAgIEBwYXJhbSB7c3RyaW5nfSBkYXRhLXBhZ2UtcXVlcnkta2V5IHRoZSBzdHJpbmcga2V5IHRvIGJlIHVzZWQgaW4gYnVpbGRpbmcgdGhlIHBhZ2UgcXVlcnlcbiogICBAcGFyYW0ge3N0cmluZ30gZGF0YS1wZXJwYWdlLXF1ZXJ5LWtleSB0aGUgc3RyaW5nIGtleSB0byBiZSB1c2VkIGluIGJ1aWxkaW5nIHRoZSBwZXJwYWdlIHF1ZXJ5XG4qICAgQHBhcmFtIHtzdHJpbmd9IGRhdGEtc2VhcmNoLXF1ZXJ5LWtleSB0aGUgc3RyaW5nIGtleSB0byBiZSB1c2VkIGluIGJ1aWxkaW5nIHRoZSBzZWFyY2ggcXVlcnlcbiogICBAcGFyYW0ge251bWJlcn0gZGF0YS1jdXJyZW50LXBhZ2UgdGhlIGN1cnJlbnQgcGFnZSBudW1iZXJcbiogICBAcGFyYW0ge251bWJlcn0gZGF0YS1jdXJyZW50LXBlcnBhZ2UgdGhlIGN1cnJlbnQgcGVycGFnZSBudW1iZXJcbipcbiogICBOb3RlcyBvbiBzZWFyY2ggbW9kdWxlOlxuKiAgICAgRXZlbnRzIHdoaWNoIGFyZSByZWdpc3RlcmVkIHdpdGhpbiB0aGUgdGFibGVcbiogICAgIHNlYXJjaDpzdWJtaXQgdHJpZ2dlcnMgYSB0YWJsZSBzZWFyY2ggcXVlcnkgd2hlbiB0cmlnZ2VyZWQgYnkgdGhlIGVsZW1lbnQgc3BlY2lmaWVkIGluIG9wdGlvbnMuc2VhcmNoX2lkXG4qICAgICBzZWFyY2g6Y2xlYXIgdHJpZ2dlcnMgYSBjbGVhcmFuY2Ugb2YgdGhlIGN1cnJlbnQgc2VhcmNoIHF1ZXJ5IHdoZW4gdHJpZ2dlcmVkIGJ5IHRoZSBlbGVtZW50IHNwZWNpZmllZCBpbiBvcHRpb25zLnNlYXJjaF9pZFxuKlxuKiAgIEV2ZW50cywgdHJpZ2dlcmVkIGJ5IHRoZSB0YWJsZSBvbiB0aGUgdGFibGUgY29udGFpbmVyIGVsZW1lbnRcbiogICBAZmlyZXMgdGFibGU6bG9hZCAtIHRyaWdnZXJlZCBhbnkgdGltZSB0aGUgdGFibGUgaGFzIGZpbmlzaGVkIGxvYWRpbmcsIGluY2x1ZGluZyBvbiBzdWNjZXNzZnVsIGluaXRpYWwgbG9hZCwgdXBkYXRlLCBvciByZWZyZXNoXG4qICAgQGZpcmVzIHRhYmxlOnNvcnQge29iamVjdH0gdHJpZ2dlcmVkIHdoZW4gYSBjb2x1bW4gaXMgc29ydGVkLCBpbmNsdWRlcyBkaXJlY3Rpb24gYW5kIHByb3BlcnR5XG4qICAgQGZpcmVzIHRhYmxlOnBhZ2Uge29iamVjdH0gdHJpZ2dlcmVkIHdoZW4gYSBzcGVjaWZpYyBwYWdlIGhhcyBiZWVuIGNob3NlbiB0byBqdW1wIHRvXG4qICAgQGZpcmVzIHRhYmxlOnBlcnBhZ2Uge29iamVjdH0gdHJpZ2dlcmVkIHdoZW4gcGVycGFnZSBkcm9wZG93biBzZWxlY3Rpb24gaGFzIGNoYW5nZWRcbiogICBAZmlyZXMgdGFibGU6bmV4dHBhZ2Uge29iamVjdH0gdHJpZ2dlcmVkIHdoZW4gbmV4dCBwYWdlIGluIHBhZ2luYXRpb24gY2xpY2tlZFxuKiAgIEBmaXJlcyB0YWJsZTpwcmV2cGFnZSB7b2JqZWN0fSB0cmlnZ2VyZWQgd2hlbiBwcmV2IHBhZ2UgaW4gcGFnaW5hdGlvbiBjbGlja2VkXG4qICAgQGZpcmVzIHRhYmxlOnNlbGVjdCB7b2JqZWN0fSB0cmlnZ2VyZWQgd2hlbiBhIHJvdyBpcyBzZWxlY3RlZCwgcGFzc2luZyB0aGUgcmVjb3JkIG9iamVjdFxuKiAgIEBmaXJlcyB0YWJsZTpkZXNlbGVjdCB7b2JqZWN0fSB0cmlnZ2VyZWQgd2hlbiBhIHJvdyBpcyBkZXNlbGVjdGVkLCBwYXNzaW5nIHRoZSByZWNvcmQgb2JqZWN0XG4qICAgQGZpcmVzIHRhYmxlOnNlbGVjdDphbGwgLSB0cmlnZ2VyZWQgd2hlbiBhbGwgcmVjb3JkcyBhcmUgc2VsZWN0ZWQgdXNpbmcgdGhlIGNoZWNrIGFsbCBib3hcbiogICBAZmlyZXMgdGFibGU6ZGVzZWxlY3Q6YWxsIC0gdHJpZ2dlcmVkIHdoZW4gYWxsIHJlY29yZHMgYXJlIGRlc2VsZWN0ZWQgdXNpbmcgdGhlIGNoZWNrIGFsbCBib3hcbiogICBAZmlyZXMgdGFibGU6c2hpZnRzZWxlY3QgLSB0cmlnZ2VyZWQgd2hlbiBhIHNoaWZ0IHNlbGVjdCBpcyBjb21wbGV0ZWRcbiogICBAZmlyZXMgdGFibGU6c2VhcmNoIHtvYmplY3R9IHRyaWdnZXJlZCB3aGVuIGEgc2VhcmNoIHF1ZXJ5IGlzIHVzZWQgdG8gZmlsdGVyIHRoZSB0YWJsZVxuKiAgIEBmaXJlcyB0YWJsZTpzZWFyY2g6Y2xlYXIgLSB0cmlnZ2VyZWQgd2hlbiBhIHNlYXJjaCBxdWVyeSBpcyBjbGVhcmVkXG4qICAgQGZpcmVzIHRhYmxlOmVycm9yIC0gdHJpZ2dlcmVkIHdoZW4gYSBwamF4IC8gYWpheCBlcnJvciBvY2N1cnNcbiogICBAZmlyZXMgdGFibGU6dGltZW91dCAtIHRyaWdnZXJlZCB3aGVuIHBqYXggdGltZXMgb3V0XG4qL1xuZnVuY3Rpb24gUGpheFRhYmxlKGVsLCBvcHRpb25zKSB7XG4gIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICB0aGlzLl8kZWwgPSAkKGVsKTtcbiAgdGhpcy5fJHRib2R5ID0gbnVsbDtcblxuICB0aGlzLl91cmwgPSB0aGlzLl9vcHRpb25zLnVybCB8fCB0aGlzLl8kZWwuZGF0YSgncGpheC11cmwnKSB8fCB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG5cbiAgaWYgKHRoaXMuX29wdGlvbnMuYWpheE9ubHkgIT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX2FqYXhPbmx5ID0gdGhpcy5fb3B0aW9ucy5hamF4T25seTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9hamF4T25seSA9IHRoaXMuXyRlbC5kYXRhKCdhamF4LW9ubHknKSB8fCBmYWxzZTtcbiAgfVxuICBpZiAodGhpcy5fb3B0aW9ucy5wdXNoU3RhdGUgIT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX3B1c2hTdGF0ZSA9IHRoaXMuX29wdGlvbnMucHVzaFN0YXRlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX3B1c2hTdGF0ZSA9IHRoaXMuXyRlbC5kYXRhKCdwdXNoLXN0YXRlJykgfHwgdHJ1ZTtcbiAgfVxuICBpZiAodGhpcy5fb3B0aW9ucy5wYWdpbmF0ZWQgIT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX3BhZ2luYXRlZCA9IHRoaXMuX29wdGlvbnMucGFnaW5hdGVkO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX3BhZ2luYXRlZCA9IHRoaXMuXyRlbC5kYXRhKCdwYWdpbmF0ZWQnKSB8fCB0cnVlO1xuICB9XG5cbiAgdGhpcy5fcGpheENvbnRhaW5lciA9IHRoaXMuX29wdGlvbnMucGpheENvbnRhaW5lciB8fCB0aGlzLl8kZWwuZGF0YSgncGpheC1jb250YWluZXInKSB8fCB0aGlzLl8kZWwuYXR0cignaWQnKTtcbiAgdGhpcy5fbm9EYXRhVGVtcGxhdGUgPSB0aGlzLl9vcHRpb25zLm5vRGF0YVRlbXBsYXRlIHx8IHRoaXMuX25vRGF0YVRlbXBsYXRlO1xuICB0aGlzLl9zb3J0UXVlcnlLZXkgPSB0aGlzLl9vcHRpb25zLnNvcnRRdWVyeUtleSB8fCB0aGlzLl8kZWwuZGF0YSgnc29ydC1xdWVyeS1rZXknKSB8fCAnb3JkZXInO1xuICB0aGlzLl9wYWdlUXVlcnlLZXkgPSB0aGlzLl9vcHRpb25zLnBhZ2VRdWVyeUtleSB8fCB0aGlzLl8kZWwuZGF0YSgncGFnZS1xdWVyeS1rZXknKSB8fCAncGFnZSc7XG4gIHRoaXMuX3BlclBhZ2VRdWVyeUtleSA9IHRoaXMuX29wdGlvbnMucGVyUGFnZVF1ZXJ5S2V5IHx8IHRoaXMuXyRlbC5kYXRhKCdwZXJwYWdlLXF1ZXJ5LWtleScpIHx8ICdwZXJwYWdlJztcbiAgdGhpcy5fc2VhcmNoUXVlcnlLZXkgPSB0aGlzLl9vcHRpb25zLnNlYXJjaFF1ZXJ5S2V5IHx8IHRoaXMuXyRlbC5kYXRhKCdzZWFyY2gtcXVlcnkta2V5JykgfHwgJ3EnO1xuICB0aGlzLl9xdWVyeVN5bmNGbiA9IHRoaXMuX29wdGlvbnMucXVlcnlTeW5jRm4gfHwgbnVsbDtcblxuICB0aGlzLl90b3RhbFJvd3MgPSBudWxsO1xuXG4gIHZhciBzZWFyY2hJZCA9IHRoaXMuX29wdGlvbnMuc2VhcmNoSWQgfHwgdGhpcy5fJGVsLmRhdGEoJ3NlYXJjaC1pZCcpIHx8IG51bGw7XG4gIHRoaXMuXyRzZWFyY2hCb3ggPSBzZWFyY2hJZCA/ICQoc2VhcmNoSWQpIDogbnVsbDtcblxuICB0aGlzLl9zb3J0TWFwID0geyBhc2M6ICdkZXNjJywgZGVzYzogJ2FzYycgfTtcbiAgdGhpcy5fcXVlcnlTdGF0ZSA9ICQuZXh0ZW5kKHt9LCB0aGlzLl9vcHRpb25zLnF1ZXJ5U3RhdGUpO1xuXG4gIHRoaXMuX2luaXQoKTtcbn1cblxuJC5leHRlbmQoUGpheFRhYmxlLnByb3RvdHlwZSwge1xuXG4gIF9ub0RhdGFUZW1wbGF0ZTogZnVuY3Rpb24obnVtQ29sdW1ucykge1xuICAgIHJldHVybiBbXG4gICAgICAnPHRyPicsXG4gICAgICAgICc8dGQgY2xhc3M9XCJlbXB0eS10YWJsZS1jb250ZW50XCIgY29sc3Bhbj1cIicgKyBudW1Db2x1bW5zICsgJ1wiPicsXG4gICAgICAgICAgJ1dob29wcyEgTG9va3MgbGlrZSB0aGVyZVxcJ3Mgbm90aGluZyBpbiB0aGlzIHRhYmxlIScsXG4gICAgICAgICc8L3RkPicsXG4gICAgICAnPC90cj4nXG4gICAgXS5qb2luKCcnKTtcbiAgfSxcblxuICBfY3JlYXRlU29ydFF1ZXJ5OiBmdW5jdGlvbihwcm9wZXJ0eSwgZGlyZWN0aW9uKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge307XG4gICAgcXVlcnlbdGhpcy5fc29ydFF1ZXJ5S2V5XSA9IHByb3BlcnR5ICsgJ19fJyArIGRpcmVjdGlvbjtcbiAgICByZXR1cm4gcXVlcnk7XG4gIH0sXG5cbiAgX2Rlc3luY1NvcnQ6IGZ1bmN0aW9uKCkge1xuICAgIGRlbGV0ZSB0aGlzLl9xdWVyeVN0YXRlW3RoaXMuX3NvcnRRdWVyeUtleV07XG4gIH0sXG5cbiAgX2NyZWF0ZVBhZ2VRdWVyeTogZnVuY3Rpb24ocGFnZSkge1xuICAgIHZhciBxdWVyeSA9IHt9O1xuICAgIHF1ZXJ5W3RoaXMuX3BhZ2VRdWVyeUtleV0gPSBwYWdlO1xuICAgIHJldHVybiBxdWVyeTtcbiAgfSxcblxuICBfY3JlYXRlUGVyUGFnZVF1ZXJ5OiBmdW5jdGlvbihwZXJwYWdlKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge307XG4gICAgcXVlcnlbdGhpcy5fcGVyUGFnZVF1ZXJ5S2V5XSA9IHBlcnBhZ2U7XG4gICAgcmV0dXJuIHF1ZXJ5O1xuICB9LFxuXG4gIF9jcmVhdGVTZWFyY2hRdWVyeTogZnVuY3Rpb24oc2VhcmNoU3RyKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge307XG4gICAgcXVlcnlbdGhpcy5fc2VhcmNoUXVlcnlLZXldID0gc2VhcmNoU3RyO1xuICAgIHJldHVybiBxdWVyeTtcbiAgfSxcblxuICBfZGVzeW5jU2VhcmNoOiBmdW5jdGlvbigpIHtcbiAgICBkZWxldGUgdGhpcy5fcXVlcnlTdGF0ZVt0aGlzLl9zZWFyY2hRdWVyeUtleV07XG4gIH0sXG5cbiAgX3N5bmNTb3J0OiBmdW5jdGlvbihwcm9wZXJ0eSwgZGlyZWN0aW9uKSB7XG4gICAgJC5leHRlbmQodGhpcy5fcXVlcnlTdGF0ZSwgdGhpcy5fY3JlYXRlU29ydFF1ZXJ5KHByb3BlcnR5LCBkaXJlY3Rpb24pKTtcbiAgfSxcblxuICBfc3luY1BhZ2U6IGZ1bmN0aW9uKHBhZ2UpIHtcbiAgICAkLmV4dGVuZCh0aGlzLl9xdWVyeVN0YXRlLCB0aGlzLl9jcmVhdGVQYWdlUXVlcnkocGFnZSkpO1xuICB9LFxuXG4gIF9zeW5jUGVyUGFnZTogZnVuY3Rpb24ocGVycGFnZSkge1xuICAgICQuZXh0ZW5kKHRoaXMuX3F1ZXJ5U3RhdGUsIHRoaXMuX2NyZWF0ZVBlclBhZ2VRdWVyeShwZXJwYWdlKSk7XG4gIH0sXG5cbiAgX3N5bmNTZWFyY2g6IGZ1bmN0aW9uKHNlYXJjaFN0cikge1xuICAgICQuZXh0ZW5kKHRoaXMuX3F1ZXJ5U3RhdGUsIHRoaXMuX2NyZWF0ZVNlYXJjaFF1ZXJ5KHNlYXJjaFN0cikpO1xuICB9LFxuXG4gIF9sb2FkOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICBpZiAoIXRoaXMuX2FqYXhPbmx5KSB7XG4gICAgICByZXR1cm4gJC5wamF4KCQuZXh0ZW5kKHtcbiAgICAgICAgdXJsOiB0aGlzLl91cmwsXG4gICAgICAgIGRhdGE6IHRoaXMuX3F1ZXJ5U3RhdGUsXG4gICAgICAgIHB1c2g6IHRoaXMuX3B1c2hTdGF0ZSxcbiAgICAgICAgY29udGFpbmVyOiB0aGlzLl9wamF4Q29udGFpbmVyXG4gICAgICB9LCBwYXJhbXMpKTtcbiAgICB9XG5cbiAgICB0aGlzLl9hZGRMb2FkTWFzaygpO1xuICAgIHJldHVybiAkLmFqYXgoJC5leHRlbmQoe1xuICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICB1cmw6IHRoaXMuX3VybCxcbiAgICAgIGRhdGE6IHRoaXMuX3F1ZXJ5U3RhdGUsXG4gICAgICBjb250ZXh0OiB0aGlzXG4gICAgfSwgcGFyYW1zKSlcbiAgICAuZG9uZSh0aGlzLl9vbkFqYXhTdWNjZXNzKVxuICAgIC5mYWlsKHRoaXMuX29uQWpheEVycm9yKTtcbiAgfSxcblxuICBfYWRkTG9hZE1hc2s6IGZ1bmN0aW9uKCkge1xuICAgIHZhciAkbG9hZE1hc2sgPSAkKCc8ZGl2IGNsYXNzPVwidWktbG9hZC1tYXNrXCI+Jyk7XG4gICAgdGhpcy5fJGVsLmNzcyh7IHBvc2l0aW9uOiAncmVsYXRpdmUnIH0pO1xuICAgIHRoaXMuXyRlbC5hcHBlbmQoJGxvYWRNYXNrKTtcbiAgICAkbG9hZE1hc2suc3Bpbih0aGlzLl9vcHRpb25zLmxvYWRNYXNrQ29uZmlnIHx8ICdzbWFsbCcpO1xuICB9LFxuXG4gIF9yZW1vdmVMb2FkTWFzazogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fJGVsLmZpbmQoJy51aS1sb2FkLW1hc2snKS5yZW1vdmUoKTtcbiAgICB0aGlzLl8kZWwuY3NzKHsgcG9zaXRpb246ICcnIH0pO1xuICB9LFxuXG4gIC8vIFN5bmNzIHRoZSBxdWVyeSBzdGF0ZSB3aXRoIHdoYXQncyBiZWluZyBkaXNwbGF5ZWRcbiAgX3N5bmNRdWVyeVN0YXRlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgJHRhYmxlID0gdGhpcy5fJGVsLmZpbmQoJ3RhYmxlJyk7XG4gICAgdmFyIHBhZ2UgPSAkdGFibGUuZGF0YSgnY3VycmVudC1wYWdlJyk7XG4gICAgdmFyIHBlcnBhZ2UgPSAkdGFibGUuZGF0YSgnY3VycmVudC1wZXJwYWdlJyk7XG4gICAgdmFyIHNvcnRQcm9wZXJ0eSA9ICR0YWJsZS5kYXRhKCdjdXJyZW50LXNvcnQtcHJvcGVydHknKTtcbiAgICB2YXIgc29ydERpcmVjdGlvbiA9ICR0YWJsZS5kYXRhKCdjdXJyZW50LXNvcnQtZGlyZWN0aW9uJyk7XG4gICAgdmFyIHNlYXJjaFN0ciA9ICR0YWJsZS5kYXRhKCdjdXJyZW50LXNlYXJjaC1zdHInKTtcblxuICAgIGlmICh0aGlzLl9wYWdpbmF0ZWQpIHtcbiAgICAgIHRoaXMuX3N5bmNQYWdlKHBhZ2UpO1xuICAgICAgdGhpcy5fc3luY1BlclBhZ2UocGVycGFnZSk7XG4gICAgfVxuXG4gICAgaWYgKHNvcnRQcm9wZXJ0eSkge1xuICAgICAgdGhpcy5fc3luY1NvcnQoc29ydFByb3BlcnR5LCBzb3J0RGlyZWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGVzeW5jU29ydCgpO1xuICAgIH1cblxuICAgIGlmIChzZWFyY2hTdHIpIHtcbiAgICAgIHRoaXMuX3N5bmNTZWFyY2goc2VhcmNoU3RyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGVzeW5jU2VhcmNoKCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLl9xdWVyeVN5bmNGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgJC5leHRlbmQodGhpcy5fcXVlcnlTdGF0ZSwgdGhpcy5fcXVlcnlTeW5jRm4oJHRhYmxlKSlcbiAgICB9XG4gIH0sXG5cbiAgX29uVGFibGVMb2FkZWQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vIGNyZWF0ZSB0aGlzIHNob3J0Y3V0IHdoZW5ldmVyIHRoZSB0YWJsZSBsb2Fkc1xuICAgIHRoaXMuXyR0Ym9keSA9IHRoaXMuXyRlbC5maW5kKCd0Ym9keScpO1xuXG4gICAgdmFyIHRvdGFsUm93cyA9IHRoaXMuXyRlbC5maW5kKCd0YWJsZScpLmRhdGEoJ3RvdGFsLXJvd3MnKTtcbiAgICB0aGlzLl90b3RhbFJvd3MgPSB0b3RhbFJvd3MgfCAwO1xuXG4gICAgaWYgKHRoaXMuX3RvdGFsUm93cyA9PT0gMCkge1xuICAgICAgdGhpcy5fJHRib2R5Lmh0bWwodGhpcy5fbm9EYXRhVGVtcGxhdGUodGhpcy5nZXROdW1Db2x1bW5zKCkpKTtcbiAgICB9XG5cbiAgICB0aGlzLl8kZWwudHJpZ2dlcigndGFibGU6bG9hZCcpO1xuICB9LFxuXG4gIF9vbkFqYXhTdWNjZXNzOiBmdW5jdGlvbihkYXRhLCB0ZXh0U3RhdHVzLCBqcVhIUikge1xuICAgIHRoaXMuXyRlbC5odG1sKGRhdGEpO1xuICAgIHRoaXMuX29uVGFibGVMb2FkZWQoKTtcbiAgICB0aGlzLl9yZW1vdmVMb2FkTWFzaygpO1xuICB9LFxuXG4gIF9vbkFqYXhFcnJvcjogZnVuY3Rpb24oanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgdGhpcy5fcmVtb3ZlTG9hZE1hc2soKTtcbiAgICB0aGlzLl8kZWwudHJpZ2dlcigndGFibGU6ZXJyb3InKTtcbiAgfSxcblxuICBfb25QamF4U3RhcnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICB0aGlzLl9hZGRMb2FkTWFzaygpO1xuICB9LFxuXG4gIF9vblBqYXhCZWZvcmVSZXBsYWNlOiBmdW5jdGlvbihlKSB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB0aGlzLl9yZW1vdmVMb2FkTWFzaygpO1xuICB9LFxuXG4gIF9vblBqYXhUaW1lb3V0OiBmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpOyAvLyBwcmV2ZW50IHJldHJ5XG4gICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOnRpbWVvdXQnKTtcbiAgfSxcblxuICBfb25QamF4U3VjY2VzczogZnVuY3Rpb24gKGUsIGRhdGEsIHN0YXR1cywgeGhyLCBvcHRpb25zKSB7XG4gICAgdGhpcy5fb25UYWJsZUxvYWRlZCgpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIH0sXG5cbiAgX29uUGpheEVycm9yOiBmdW5jdGlvbiAoZSwgeGhyLCB0ZXh0U3RhdHVzLCBlcnJvciwgb3B0aW9ucykge1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpOyAvLyBwcmV2ZW50IHJldHJ5XG4gICAgdGhpcy5fcmVtb3ZlTG9hZE1hc2soKTtcbiAgICB0aGlzLl8kZWwudHJpZ2dlcigndGFibGU6ZXJyb3InKTtcbiAgfSxcblxuICBfb25DbGlja1NvcnRhYmxlOiBmdW5jdGlvbiAoZSkge1xuICAgIHZhciAkc29ydGFibGUgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCd0aFtkYXRhLXNvcnRhYmxlPVwidHJ1ZVwiXScpO1xuICAgIHZhciBwcm9wZXJ0eSA9ICRzb3J0YWJsZS5kYXRhKCdwcm9wZXJ0eScpO1xuICAgIHZhciBkaXJlY3Rpb24gPSB0aGlzLl9zb3J0TWFwWyRzb3J0YWJsZS5kYXRhKCdjdXJyZW50LXNvcnQtZGlyZWN0aW9uJyldIHx8ICRzb3J0YWJsZS5kYXRhKCdkZWZhdWx0LXNvcnQtZGlyZWN0aW9uJyk7XG5cbiAgICB0aGlzLl8kZWwudHJpZ2dlcigndGFibGU6c29ydCcsIHRoaXMuX2NyZWF0ZVNvcnRRdWVyeShwcm9wZXJ0eSwgZGlyZWN0aW9uKSk7XG4gICAgdGhpcy5fc3luY1NvcnQocHJvcGVydHksIGRpcmVjdGlvbik7XG4gICAgdGhpcy5fc3luY1BhZ2UoMSk7IC8vIHJlc2V0IHRoZSBwYWdlIHRvIDEgd2hlbiBjaGFuZ2luZyBzb3J0XG4gICAgdGhpcy5fbG9hZCgpO1xuICB9LFxuXG4gIF9vblBlclBhZ2VTZWxlY3Q6IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIHBlcnBhZ2UgPSAkKGUuY3VycmVudFRhcmdldCkuZGF0YSgndmFsdWUnKTtcblxuICAgIHRoaXMuXyRlbC50cmlnZ2VyKCd0YWJsZTpwZXJwYWdlJywgdGhpcy5fY3JlYXRlUGVyUGFnZVF1ZXJ5KHBlcnBhZ2UpKTtcbiAgICB0aGlzLl9zeW5jUGVyUGFnZShwZXJwYWdlKTtcbiAgICB0aGlzLl9zeW5jUGFnZSgxKTsgLy8gcmVzZXQgdGhlIHBhZ2UgdG8gMSB3aGVuIGNoYW5naW5nIHBlciBwYWdlXG4gICAgdGhpcy5fbG9hZCgpO1xuICB9LFxuXG4gIF9vblBhZ2VTZWxlY3Q6IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIHBhZ2VJbmRleCA9ICQoZS5jdXJyZW50VGFyZ2V0KS5kYXRhKCd2YWx1ZScpO1xuXG4gICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOnBhZ2UnLCB0aGlzLl9jcmVhdGVQYWdlUXVlcnkocGFnZUluZGV4KSk7XG4gICAgdGhpcy5fc3luY1BhZ2UocGFnZUluZGV4KTtcbiAgICB0aGlzLl9sb2FkKCk7XG4gIH0sXG5cbiAgX29uUHJldlBhZ2VTZWxlY3Q6IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIHBhZ2VJbmRleCA9IHBhcnNlSW50KHRoaXMuXyRlbC5maW5kKCd0YWJsZScpLmRhdGEoJ2N1cnJlbnQtcGFnZScpKTtcbiAgICB2YXIgcHJldlBhZ2VJbmRleCA9IE1hdGgubWF4KDEsIHBhZ2VJbmRleCAtIDEpO1xuXG4gICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOnByZXZwYWdlJywgdGhpcy5fY3JlYXRlUGFnZVF1ZXJ5KHByZXZQYWdlSW5kZXgpKTtcbiAgICB0aGlzLl9zeW5jUGFnZShwcmV2UGFnZUluZGV4KTtcbiAgICB0aGlzLl9sb2FkKCk7XG4gIH0sXG5cbiAgX29uTmV4dFBhZ2VTZWxlY3Q6IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIHBhZ2VJbmRleCA9IHBhcnNlSW50KHRoaXMuXyRlbC5maW5kKCd0YWJsZScpLmRhdGEoJ2N1cnJlbnQtcGFnZScpKTtcbiAgICB2YXIgbmV4dFBhZ2VJbmRleCA9IHBhZ2VJbmRleCArIDE7XG5cbiAgICB0aGlzLl8kZWwudHJpZ2dlcigndGFibGU6bmV4dHBhZ2UnLCB0aGlzLl9jcmVhdGVQYWdlUXVlcnkobmV4dFBhZ2VJbmRleCkpO1xuICAgIHRoaXMuX3N5bmNQYWdlKG5leHRQYWdlSW5kZXgpO1xuICAgIHRoaXMuX2xvYWQoKTtcbiAgfSxcblxuICBfb25IZWFkZXJDaGVja2JveENoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgJGNoZWNrYm94ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgIHZhciBwcm9wZXJ0eSA9ICRjaGVja2JveC5wYXJlbnQoJ3RoJykuZGF0YSgncHJvcGVydHknKTtcblxuICAgIHRoaXMuX2Rpc2FibGVSb3dDaGVja2JveENoYW5nZUhhbmRsaW5nKCk7XG5cbiAgICBpZiAoJGNoZWNrYm94LnByb3AoJ2NoZWNrZWQnKSkge1xuICAgICAgdGhpcy5fJGVsLmZpbmQoJ3RkW2RhdGEtcHJvcGVydHk9JyArIHByb3BlcnR5ICsgJ10gaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgdGhpcy5fJHRib2R5LmZpbmQoJ3RyJykuYWRkQ2xhc3MoJ3VpLXNlbGVjdGVkJyk7XG4gICAgICB0aGlzLl8kZWwudHJpZ2dlcigndGFibGU6c2VsZWN0OmFsbCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl8kZWwuZmluZCgndGRbZGF0YS1wcm9wZXJ0eT0nICsgcHJvcGVydHkgKyAnXSBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKS5wcm9wKCdjaGVja2VkJywgZmFsc2UpO1xuICAgICAgdGhpcy5fJHRib2R5LmZpbmQoJ3RyJykucmVtb3ZlQ2xhc3MoJ3VpLXNlbGVjdGVkJyk7XG4gICAgICB0aGlzLl8kZWwudHJpZ2dlcigndGFibGU6ZGVzZWxlY3Q6YWxsJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fZW5hYmxlUm93Q2hlY2tib3hDaGFuZ2VIYW5kbGluZygpO1xuICB9LFxuXG4gIF9vbkNsaWNrSWRDb2x1bW46IGZ1bmN0aW9uKGUpIHtcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJ3RyJykuZGF0YSgnc2hpZnRLZXknLCBlLnNoaWZ0S2V5KTtcbiAgfSxcblxuICBfb25Sb3dDaGVja2JveENoYW5nZTogZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgJGNoZWNrYm94ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgIHZhciAkdHIgPSAkKGUuY3VycmVudFRhcmdldCkuY2xvc2VzdCgndHInKTtcbiAgICB2YXIgcmVjb3JkID0gdGhpcy5fZ2V0UmVjb3JkKCR0ci5nZXQoMCkpO1xuICAgIHZhciBzaGlmdENsaWNrSWQgPSB0aGlzLl8kZWwuZGF0YSgnbGFzdF9zZWxlY3RlZCcpO1xuXG4gICAgLy8gaGFuZGxlIHNoaWZ0IGNsaWNrIGJ5IHNlbGVjdGluZyBldmVyeXRoaW5nIGluYmV0d2VlblxuICAgIGlmIChzaGlmdENsaWNrSWQgJiYgJHRyLmRhdGEoJ3NoaWZ0S2V5JykpIHtcbiAgICAgIHRoaXMuX2Rpc2FibGVSb3dDaGVja2JveENoYW5nZUhhbmRsaW5nKCk7XG4gICAgICB0aGlzLl9zaGlmdFNlbGVjdFJvd3MoJHRyLCBzaGlmdENsaWNrSWQpO1xuICAgICAgdGhpcy5fZW5hYmxlUm93Q2hlY2tib3hDaGFuZ2VIYW5kbGluZygpO1xuICAgIH1cblxuICAgIC8vIGFsd2F5cyBzZXQgbGFzdCBzZWxlY3RlZCwgd2hldGhlciBvciBub3QgaXQgd2FzIGNoZWNrZWQgb24gb3Igb2ZmXG4gICAgdGhpcy5fJGVsLmRhdGEoJ2xhc3Rfc2VsZWN0ZWQnLCByZWNvcmQuaWQpO1xuXG4gICAgLy8gaWdub3JlIGhlYWRlciBjaGVjayBhbGwgaW5wdXQgZm9yIHNlbGVjdGVkIHN0YXRlXG4gICAgaWYgKCRjaGVja2JveC5wcm9wKCdjaGVja2VkJykpIHtcbiAgICAgICR0ci5hZGRDbGFzcygndWktc2VsZWN0ZWQnKTtcbiAgICAgIHRoaXMuXyRlbC50cmlnZ2VyKCd0YWJsZTpzZWxlY3QnLCByZWNvcmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkdHIucmVtb3ZlQ2xhc3MoJ3VpLXNlbGVjdGVkJyk7XG4gICAgICB0aGlzLl8kZWwuZmluZCgndGhbZGF0YS1zZWxlY3QtYWxsLWVuYWJsZWQ9XCJ0cnVlXCJdIGlucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLnByb3AoJ2NoZWNrZWQnLCBmYWxzZSk7XG4gICAgICB0aGlzLl8kZWwudHJpZ2dlcigndGFibGU6ZGVzZWxlY3QnLCByZWNvcmQpO1xuICAgIH1cbiAgfSxcblxuICBfc2hpZnRTZWxlY3RSb3dzOiBmdW5jdGlvbigkdHIsIHNoaWZ0Q2xpY2tJZCkge1xuICAgIHZhciAkbGFzdFNlbGVjdGVkVHIgPSB0aGlzLl8kdGJvZHkuZmluZCgndGRbZGF0YS1wcm9wZXJ0eT1cImlkXCJdW2RhdGEtdmFsdWU9XCInICsgc2hpZnRDbGlja0lkICsgJ1wiXScpLnBhcmVudCgpO1xuICAgIHZhciAkYWxsVmlzaWJsZVJvd3MgPSB0aGlzLl8kdGJvZHkuZmluZCgndHInKTtcbiAgICB2YXIgY3VycmVudFNlbGVjdGVkSW5kZXggPSAkYWxsVmlzaWJsZVJvd3MuaW5kZXgoJHRyKTtcbiAgICB2YXIgbGFzdFNlbGVjdGVkSW5kZXggPSAkYWxsVmlzaWJsZVJvd3MuaW5kZXgoJGxhc3RTZWxlY3RlZFRyKTtcbiAgICB2YXIgc3RhcnQgPSBNYXRoLm1pbihjdXJyZW50U2VsZWN0ZWRJbmRleCwgbGFzdFNlbGVjdGVkSW5kZXgpO1xuICAgIHZhciBlbmQgPSBNYXRoLm1heChjdXJyZW50U2VsZWN0ZWRJbmRleCwgbGFzdFNlbGVjdGVkSW5kZXgpO1xuXG4gICAgLy8gaWYgc2VsZWN0aW5nIGZyb20gdG9wIGRvd24sIGRvbid0IHByb2Nlc3MgdGhlIGZpcnN0IG9uZVxuICAgIGlmIChsYXN0U2VsZWN0ZWRJbmRleCA8IGN1cnJlbnRTZWxlY3RlZEluZGV4ICYmICRsYXN0U2VsZWN0ZWRUci5oYXNDbGFzcygndWktc2VsZWN0ZWQnKSkge1xuICAgICAgKytzdGFydDtcbiAgICB9XG4gICAgKytlbmQ7XG5cbiAgICAkYWxsVmlzaWJsZVJvd3Muc2xpY2Uoc3RhcnQsIGVuZCkuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkcm93ID0gJCh0aGlzKTtcbiAgICAgIGlmICghJGxhc3RTZWxlY3RlZFRyLmhhc0NsYXNzKCd1aS1zZWxlY3RlZCcpKSB7XG4gICAgICAgICRyb3cucmVtb3ZlQ2xhc3MoJ3VpLXNlbGVjdGVkJykuY2hpbGRyZW4oKS5maXJzdCgpLmZpbmQoJ2lucHV0JykucHJvcCgnY2hlY2tlZCcsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRyb3cuYWRkQ2xhc3MoJ3VpLXNlbGVjdGVkJykuY2hpbGRyZW4oKS5maXJzdCgpLmZpbmQoJ2lucHV0JykucHJvcCgnY2hlY2tlZCcsIHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5fJGVsLnRyaWdnZXIoJ3RhYmxlOnNoaWZ0c2VsZWN0Jyk7XG4gIH0sXG5cbiAgX29uU3VibWl0U2VhcmNoOiBmdW5jdGlvbihlLCBzZWFyY2hTdHIpIHtcbiAgICB0aGlzLl8kZWwudHJpZ2dlcigndGFibGU6c2VhcmNoJywgdGhpcy5fY3JlYXRlU2VhcmNoUXVlcnkoc2VhcmNoU3RyKSk7XG4gICAgdGhpcy5fc3luY1NlYXJjaChzZWFyY2hTdHIpO1xuICAgIHRoaXMuX3N5bmNQYWdlKDEpO1xuICAgIHRoaXMuX2xvYWQoKTtcbiAgfSxcblxuICBfb25DbGVhclNlYXJjaDogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMuXyRlbC50cmlnZ2VyKCd0YWJsZTpzZWFyY2g6Y2xlYXInKTtcbiAgICB0aGlzLl9kZXN5bmNTZWFyY2goKTtcbiAgICB0aGlzLl9zeW5jUGFnZSgxKTtcbiAgICB0aGlzLl9sb2FkKCk7XG4gIH0sXG5cbiAgLyoqXG4gICogICBHZW5lcmljIHJvdyBsZXZlbCBwbHVnaW4gaW5pdGlhbGl6YXRpb24sIHByb3ZpZGluZyB0aGUgcm93IHJlY29yZCBhcyBhIHBvam8gKCBwbHVnaW5zIGV4cGVjdGVkIHRvIGJlIHByb3RvdHlwZSBiYXNlZCApXG4gICpcbiAgKiAgIE5vdGVzOlxuICAqICAgICB1c2VzIGV4dGVuZCBmb3IgdGhlIHF1ZXJ5U3RhdGUgdG8gY29weSBwcmltaXRpdmVzIHNvIHRoYXQgdGhlIHBsdWdpbiBoYXMgYWNjZXNzIHRvIHRoZSBjdXJyZW50IHRhYmxlIHN0YXRlIGJ1dCBjYW5ub3QgZGlyZWN0bHkgZWRpdCBpdFxuICAqXG4gICogICBAcGFyYW0ge0FycmF5LjxvYmplY3Q+fVxuICAqICAgICBAcGFyYW0ge3N0cmluZ30gKGRlZmluaXRpb24udGFyZ2V0KSB0aGUgcGx1Z2luIHRhcmdldCBzZWxlY3RvciB0byBiZSB1c2VkIHdpdGggZmluZCBvbiB0aGUgcm93XG4gICogICAgIEBwYXJhbSB7c3RyaW5nfSAoZGVmaW5pdGlvbi5jb25zdHJ1Y3Rvck5hbWUpIHRoZSBuYW1lIG9mIHRoZSBwbHVnaW4gY29uc3RydWN0b3JcbiAgKiAgICAgQHBhcmFtIHtvYmplY3R9IChkZWZpbml0aW9uLm9wdGlvbnMpIG9wdGlvbnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBwbHVnaW4gKGN1cnJlbnRseSBpcyBub3QgYWxsb3dlZCB0byBvdmVycmlkZSB0YWJsZSBxdWVyeSBzdGF0ZSBvciByb3cgcmVjb3JkKVxuICAqL1xuICBfYXBwbHlQbHVnaW5zOiBmdW5jdGlvbihwbHVnaW5EZWZpbml0aW9ucykge1xuICAgICQuZWFjaChwbHVnaW5EZWZpbml0aW9ucywgZnVuY3Rpb24oaW5kZXgsIGRlZmluaXRpb24pIHtcbiAgICAgIHRoaXMuXyRlbC5vbignY2xpY2snLCBkZWZpbml0aW9uLnRhcmdldCwgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJGN1cnJlbnRUYXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgIGlmICghJGN1cnJlbnRUYXJnZXQuZGF0YSgncGx1Z2luLWluaXRpYWxpemVkJykpIHtcbiAgICAgICAgICAkY3VycmVudFRhcmdldFtkZWZpbml0aW9uLmNvbnN0cnVjdG9yTmFtZV0oJC5leHRlbmQoe30sIGRlZmluaXRpb24ub3B0aW9ucywge1xuICAgICAgICAgICAgcXVlcnlTdGF0ZTogJC5leHRlbmQoe30sIHRoaXMuX3F1ZXJ5U3RhdGUpLCAvLyBjb3B5XG4gICAgICAgICAgICByZWNvcmQ6IHRoaXMuX2dldFJlY29yZCgkY3VycmVudFRhcmdldC5jbG9zZXN0KCd0cicpLmdldCgwKSksIC8vIGNyZWF0ZXMgYSBuZXcgb2JqZWN0IGJhc2VkIG9uIERPTSBhdHRyaWJ1dGVzXG4gICAgICAgICAgICBldmVudDogZVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICAkY3VycmVudFRhcmdldC5kYXRhKCdwbHVnaW4taW5pdGlhbGl6ZWQnLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICB9LFxuXG4gIF9vblBsdWdpblJlZnJlc2hFdmVudDogZnVuY3Rpb24oZSkge1xuICAgIHRoaXMucmVmcmVzaCgpO1xuICB9LFxuXG4gIC8qKlxuICAqICAgQWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIHRhYmxlIGVsZW1lbnQgKCB3aXRoIGZpbHRlcnMgd2hlbiBwcm92aWRlZCApIHRoYXQgd2lsbCB0cmlnZ2VyIHJlZnJlc2hcbiAgKiAgIFNlZSBkb2NzIGF0IHRvcCBvZiB0YWJsZSBtb2R1bGUgZm9yIGRldGFpbHMgb24gdGhlIHN0cnVjdHVyZSBvZiByZWZyZXNoIGV2ZW50cyBjb25maWd1cmF0aW9uXG4gICovXG4gIF9pbml0UGx1Z2luUmVmcmVzaEV2ZW50czogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlbmd0aDtcbiAgICB2YXIgcmVmcmVzaEV2ZW50O1xuICAgIGlmICh0aGlzLl9vcHRpb25zLnJlZnJlc2hFdmVudHMpIHtcbiAgICAgIGxlbmd0aCA9IHRoaXMuX29wdGlvbnMucmVmcmVzaEV2ZW50cy5sZW5ndGg7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlZnJlc2hFdmVudCA9IHRoaXMuX29wdGlvbnMucmVmcmVzaEV2ZW50c1tpXTtcbiAgICAgICAgaWYgKHJlZnJlc2hFdmVudC5maWx0ZXIpIHtcbiAgICAgICAgICB0aGlzLl8kZWwub24ocmVmcmVzaEV2ZW50LmV2ZW50TmFtZSwgcmVmcmVzaEV2ZW50LmZpbHRlciwgdGhpcy5fb25QbHVnaW5SZWZyZXNoRXZlbnQuYmluZCh0aGlzKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fJGVsLm9uKHJlZnJlc2hFdmVudC5ldmVudE5hbWUsIHRoaXMuX29uUGx1Z2luUmVmcmVzaEV2ZW50LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAqICBFbmFibGUgLyBEaXNhYmxlIGNoYW5nZSBoYW5kbGluZyBtZXRob2RzIGFyZSB1c2VkIGJ5IHNlbGVjdCBhbGwgdG8gcHJldmVudCBlYWNoXG4gICogIGluZGl2aWR1YWwgcm93IGZyb20gZmlyaW5nIGNoYW5nZSBldmVudHNcbiAgKi9cbiAgX2VuYWJsZVJvd0NoZWNrYm94Q2hhbmdlSGFuZGxpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX2NoZWNrYm94Q2hhbmdlSGFuZGxlciA9IHRoaXMuX29uUm93Q2hlY2tib3hDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl8kZWwub24oJ2NoYW5nZScsICd0ZFtkYXRhLXByb3BlcnR5PVwiaWRcIl0gaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJywgdGhpcy5fY2hlY2tib3hDaGFuZ2VIYW5kbGVyKTtcbiAgfSxcblxuICBfZGlzYWJsZVJvd0NoZWNrYm94Q2hhbmdlSGFuZGxpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuXyRlbC5vZmYoJ2NoYW5nZScsICd0ZFtkYXRhLXByb3BlcnR5PVwiaWRcIl0gaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJywgdGhpcy5fY2hlY2tib3hDaGFuZ2VIYW5kbGVyKTtcbiAgICB0aGlzLl9jaGVja2JveENoYW5nZUhhbmRsZXIgPSBudWxsO1xuICB9LFxuXG4gIF9pbml0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9zeW5jUXVlcnlTdGF0ZSgpO1xuICAgIHRoaXMuX29uVGFibGVMb2FkZWQoKTtcblxuICAgIC8vIHBqYXggdGltaW5nIG91dCwgd2Ugd2FudCB0byBjYW5jZWwgdGhlIGF1dG9tYXRpYyByZXRyeVxuICAgIHRoaXMuXyRlbC5vbigncGpheDp0aW1lb3V0JywgdGhpcy5fb25QamF4VGltZW91dC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl8kZWwub24oJ3BqYXg6c3VjY2VzcycsIHRoaXMuX29uUGpheFN1Y2Nlc3MuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fJGVsLm9uKCdwamF4OnN0YXJ0JywgdGhpcy5fb25QamF4U3RhcnQuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fJGVsLm9uKCdwamF4OmJlZm9yZVJlcGxhY2UnLCB0aGlzLl9vblBqYXhCZWZvcmVSZXBsYWNlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuXyRlbC5vbigncGpheDplcnJvcicsIHRoaXMuX29uUGpheEVycm9yLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5fJGVsLm9uKCdjbGljaycsICd0aFtkYXRhLXNvcnRhYmxlPVwidHJ1ZVwiXScsIHRoaXMuX29uQ2xpY2tTb3J0YWJsZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl8kZWwub24oJ2NsaWNrJywgJy51aS1wZXJwYWdlLWRyb3Bkb3duID4gbGknLCB0aGlzLl9vblBlclBhZ2VTZWxlY3QuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fJGVsLm9uKCdjbGljaycsICcudWktcGFnZS1zZWxlY3QtZHJvcGRvd24gPiBsaScsIHRoaXMuX29uUGFnZVNlbGVjdC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLl8kZWwub24oJ2NsaWNrJywgJy51aS1wcmV2LXBhZ2UnLCB0aGlzLl9vblByZXZQYWdlU2VsZWN0LmJpbmQodGhpcykpO1xuICAgIHRoaXMuXyRlbC5vbignY2xpY2snLCAnLnVpLW5leHQtcGFnZScsIHRoaXMuX29uTmV4dFBhZ2VTZWxlY3QuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fJGVsLm9uKCdjaGFuZ2UnLFxuICAgICAgJ3RoW2RhdGEtc2VsZWN0LWFsbC1lbmFibGVkPVwidHJ1ZVwiXSBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nLFxuICAgICAgdGhpcy5fb25IZWFkZXJDaGVja2JveENoYW5nZS5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLl9lbmFibGVSb3dDaGVja2JveENoYW5nZUhhbmRsaW5nKCk7XG4gICAgdGhpcy5fJGVsLm9uKCdjbGljaycsICd0ZFtkYXRhLXByb3BlcnR5PVwiaWRcIl0nLCB0aGlzLl9vbkNsaWNrSWRDb2x1bW4uYmluZCh0aGlzKSk7XG5cbiAgICBpZiAodGhpcy5fJHNlYXJjaEJveCkge1xuICAgICAgdGhpcy5fJHNlYXJjaEJveC5vbignc2VhcmNoOnN1Ym1pdCcsIHRoaXMuX29uU3VibWl0U2VhcmNoLmJpbmQodGhpcykpO1xuICAgICAgdGhpcy5fJHNlYXJjaEJveC5vbignc2VhcmNoOmNsZWFyJywgdGhpcy5fb25DbGVhclNlYXJjaC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlZnJlc2hQbHVnaW5zKCk7XG4gICAgdGhpcy5faW5pdFBsdWdpblJlZnJlc2hFdmVudHMoKTtcbiAgfSxcblxuICAvKipcbiAgKiAgIEBwYXJhbSB7T2JqZWN0fSBhIHRyIERPTSBlbGVtZW50XG4gICogICBAcmV0dXJuIHtPYmplY3R9XG4gICovXG4gIF9nZXRSZWNvcmQ6IGZ1bmN0aW9uKHJvd0VsKSB7XG4gICAgdmFyIHJlY29yZCA9IHsgYWRkaXRpb25hbEZpZWxkczoge30gfTtcblxuICAgICQocm93RWwpLmNoaWxkcmVuKCkuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgJGNlbGwgPSAkKHRoaXMpO1xuICAgICAgdmFyIGRhdGEgPSAkY2VsbC5kYXRhKCk7XG4gICAgICByZWNvcmRbZGF0YS5wcm9wZXJ0eV0gPSBkYXRhLnZhbHVlO1xuXG4gICAgICAvLyBhZGQgYWRkaXRpb25hbCBmaWVsZHMsIGlnbm9yZSBjb25zdHJ1Y3R1cmVzIGFuZCBvYmplY3RzIC8gYXJyYXlzLCBhbGxvdyBwcmltaXRpdmVzXG4gICAgICAkLmVhY2goJGNlbGwuZGF0YSgpLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoa2V5ICE9PSAncHJvcGVydHknICYmIGtleSAhPT0gJ3ZhbHVlJykge1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmVjb3JkLmFkZGl0aW9uYWxGaWVsZHNba2V5XSA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9LFxuXG4gIC8qKlxuICAqICAgRmluZHMgYSByb3cgYnkgaWQgYnkgY29tcGFyaW5nIGFnYWluc3QgdGhlIGNlbGwgd2l0aCBkYXRhLXByb3BlcnQ9XCJpZFwiLCB0eXBpY2FsbHkgdGhlIGZpcnN0IGNlbGxcbiAgKiAgIEBwYXJhbSB7bnVtYmVyfSBpZCB0aGUgaWQgdG8gbWF0Y2hcbiAgKiAgIEByZXR1cm4ge29iamVjdH0gdGhlIHJvdyBET00gZWxlbWVudFxuICAqL1xuICBfZmluZFJvd0J5SWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuXyR0Ym9keS5maW5kKCd0cicpLmZpbHRlcihmdW5jdGlvbiAoaW5kZXgsIHJvd0VsZW1lbnQpIHtcbiAgICAgIGlmICh0aGlzLl9nZXRSZWNvcmQocm93RWxlbWVudCkuaWQgPT09IGlkKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0uYmluZCh0aGlzKSkuZ2V0KDApO1xuICB9LFxuXG4gIC8qKlxuICAqICAgVXBkYXRlcyBjZWxsIHZhbHVlcyBmb3IgYSBnaXZlbiByb3csIHVzaW5nIGpRdWVyeS5kYXRhKCkgd2hpY2ggdXBkYXRlcyB0aGVtIGluIG1lbW9yeSwgbm90IG9uIHRoZSBvcmlnaW5hbCBlbGVtZW50IGF0dHJpYnV0ZXNcbiAgKiAgICAgKiBOb3RlOiBmb3IgZWRpdGFibGUgY2VsbHMsIGFuZCBldmVudHVhbGx5IGFsbCBjZWxscywgd2l0aCBhcHByb3ByaWF0ZSBhdHRyaWJ1dGVzLCB0aGlzIHdpbGwgdXBkYXRlIHRoZSBjZWxsIGRpc3BsYXkgdmFsdWUgYXMgd2VsbFxuICAqICAgQHBhcmFtIHtvYmplY3R9IHRoZSByb3cgRE9NIGVsZW1lbnRcbiAgKiAgIEBwYXJhbSB7b2JqZWN0fSB0aGUgb2JqZWN0IG9mIGtleSB2YWx1ZSBwYWlycyB0byBtYXRjaCBhbmQgdXBkYXRlXG4gICovXG4gIF91cGRhdGVSb3dGaWVsZHM6IGZ1bmN0aW9uKHJvdywgZGF0YSwgY2FsbGJhY2spIHtcbiAgICB2YXIgJHJvdyA9ICQocm93KTtcblxuICAgICQuZWFjaChkYXRhLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgdmFyICRjZWxsID0gJHJvdy5maW5kKCd0ZFtkYXRhLXByb3BlcnR5PVwiJyArIGtleSArICdcIl0nKTtcbiAgICAgICRjZWxsLmRhdGEoJ3ZhbHVlJywgdmFsdWUpO1xuICAgICAgJGNlbGwuZmluZCgkY2VsbC5kYXRhKCdkaXNwbGF5LXRhcmdldCcpKS50ZXh0KHZhbHVlKTtcblxuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYWxsYmFjaygkY2VsbCwga2V5LCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICogICBSZWZyZXNoZXMgdGhlIGNvbmZpZ3VyZWQgcGx1Z2lucyBieSBhcHBseWluZyB0aGVtIHRvIGFsbCByb3dzXG4gICogICBTZWUgZG9jcyBhdCB0b3Agb2YgdGFibGUgbW9kdWxlIG9yIGFwcGx5UGx1Z2lucyBmb3IgcGx1Z2luIGRlZmludGlvbiBkZXRhaWxzXG4gICovXG4gIHJlZnJlc2hQbHVnaW5zOiBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5fb3B0aW9ucy5wbHVnaW5zKSB7XG4gICAgICB0aGlzLl9hcHBseVBsdWdpbnModGhpcy5fb3B0aW9ucy5wbHVnaW5zKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICogIFVwZGF0ZXMgcGFyYW1ldGVycyBhbmQgdHJpZ2dlcnMgYSB0YWJsZSByZWZyZXNoXG4gICogIEBwYXJhbSB7T2JqZWN0fSBrZXkgdmFsdWUgcGFpcnMgdG8gdXBkYXRlIHRoZSBxdWVyeSBzdGF0ZSB3aXRoXG4gICogIEBwYXJhbSB7T2JqZWN0fSBrZXkgdmFsdWUgcGFpcnMgdG8gYmUgdXNlZCBieSBsb2FkXG4gICogIEByZXR1cm4ge09iamVjdH0gX3RoaXMsIHRoZSBtb2R1bGUgaW5zdGFuY2Ugb2JqZWN0XG4gICovXG4gIHVwZGF0ZTogZnVuY3Rpb24oZGF0YSwgbG9hZFBhcmFtcykge1xuICAgIHRoaXMudXBkYXRlUGFyYW1ldGVycyhkYXRhKTtcbiAgICB0aGlzLl9sb2FkKGxvYWRQYXJhbXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIC8qKlxuICAqICBAcGFyYW0ge09iamVjdH0ga2V5IHZhbHVlIHBhaXJzIHRvIGJlIHVzZWQgYnkgbG9hZFxuICAqICBAcmV0dXJuIHtPYmplY3R9IF90aGlzLCB0aGUgbW9kdWxlIGluc3RhbmNlIG9iamVjdFxuICAqL1xuICBsb2FkOiBmdW5jdGlvbihsb2FkUGFyYW1zKSB7XG4gICAgdGhpcy5fbG9hZChsb2FkUGFyYW1zKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvKipcbiAgKiAgQHJldHVybiB7T2JqZWN0fSBfdGhpcywgdGhlIG1vZHVsZSBpbnN0YW5jZSBvYmplY3RcbiAgKi9cbiAgcmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fbG9hZCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIC8qKlxuICAqIEByZXR1cm4ge3N0cmluZ30gdGhlIHVybCB1c2VkIGJ5IHRoaXMgdGFibGVcbiAgKi9cbiAgZ2V0VXJsOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fdXJsO1xuICB9LFxuXG4gIC8qKlxuICAqICBAcGFyYW0ge09iamVjdH0ga2V5IHZhbHVlIHBhaXJzIHRvIHVwZGF0ZSB0aGUgcXVlcnkgc3RhdGUgd2l0aFxuICAqICBAcmV0dXJuIHtPYmplY3R9IF90aGlzLCB0aGUgbW9kdWxlIGluc3RhbmNlIG9iamVjdFxuICAqL1xuICB1cGRhdGVQYXJhbWV0ZXJzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIGlmKHR5cGVvZiBkYXRhW2tleV0gPT09ICd1bmRlZmluZWQnIHx8IGRhdGFba2V5XSA9PT0gbnVsbCl7XG4gICAgICAgIGRlbGV0ZSB0aGlzLl9xdWVyeVN0YXRlW2tleV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9xdWVyeVN0YXRlW2tleV0gPSBkYXRhW2tleV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgLyoqXG4gICogICBAcGFyYW0ge3N0cmluZ3xBcnJheS48c3RyaW5nPnxmdW5jdGlvbn0gYSBzdHJpbmcga2V5LCBhcnJheSBvZiBrZXlzLCBvciBmdW5jdGlvbiB0byBmaWx0ZXJcbiAgKiAgIEByZXR1cm4ge29iamVjdH0gX3RoaXMsIHRoZSBtb2R1bGUgaW5zdGFuY2Ugb2JqZWN0XG4gICpcbiAgKiAgIFJldHVybmluZyB0cnVlIGZyb20gYSBmaWx0ZXIgZnVuY3Rpb24gd2lsbCBkZWxldGUgdGhlIGN1cnJlbnQga2V5IGluIGl0ZXJhdGlvblxuICAqL1xuICByZW1vdmVQYXJhbWV0ZXJzOiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zIHx8IChBcnJheS5pc0FycmF5KG9wdGlvbnMpICYmICFvcHRpb25zLmxlbmd0aCkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIFJlbW92ZSBhIHNpbmdsZSBpdGVtIGZyb20gdGhlIHF1ZXJ5U3RhdGVcbiAgICAgIGRlbGV0ZSB0aGlzLl9xdWVyeVN0YXRlW29wdGlvbnNdO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zKSkge1xuICAgICAgLy8gUmVtb3ZlIGFsbCBvZiB0aGUgaXRlbXMgaW4gdGhlIGFycmF5XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX3F1ZXJ5U3RhdGVbb3B0aW9uc1tpXV07XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gZGVsZXRpbmcgd2hpbGUgaXRlcmF0aW5nIGlzIG9rYXlcbiAgICAgICQuZWFjaCh0aGlzLl9xdWVyeVN0YXRlLCBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmIChvcHRpb25zKGtleSwgdmFsdWUpKSB7XG4gICAgICAgICAgZGVsZXRlIHRoaXMuX3F1ZXJ5U3RhdGVba2V5XTtcbiAgICAgICAgfVxuICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICAvKipcbiAgKiAgQHJldHVybiB7T2JqZWN0fSB0aGUgcXVlcnkgc3RhdGVcbiAgKi9cbiAgZ2V0UGFyYW1ldGVyczogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIHZhciBzdGF0ZSA9ICQuZXh0ZW5kKHt9LCB0aGlzLl9xdWVyeVN0YXRlKTtcblxuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgJC5lYWNoKHN0YXRlLCBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICghb3B0aW9ucyhrZXksIHZhbHVlKSkge1xuICAgICAgICAgIGRlbGV0ZSBzdGF0ZVtrZXldO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdGU7XG4gIH0sXG5cbiAgLyoqXG4gICogICBAcmV0dXJuIHtudW1iZXJ9IG51bWJlciBvZiByb3dzXG4gICovXG4gIGdldE51bVJlY29yZHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl8kdGJvZHkuZmluZCgndHInKS5sZW5ndGg7XG4gIH0sXG5cbiAgLyoqXG4gICogICBAcmV0dXJuIHtudW1iZXJ9IG51bWJlciBvZiBjb2x1bW5zXG4gICogICBOb3RlOiB0aGlzIGlzIG9ubHkgdGhlIG51bWJlciBvZiBjb2x1bW5zIGluIHRoZSBoZWFkZXIuICBJZiBzdWJzZXF1ZW50IHJvd3MgaW5jbHVkZVxuICAqICAgc3ViaGVhZGVycywgc3BsaXQgY29sdW1ucywgb3IgY29sdW1ucyB3aXRoIGNvbHNwYW5zIG90aGVyIHRoYW4gMSwgdGhpcyB3aWxsIE5PVCByZXR1cm5cbiAgKiAgIHRoZSBjb3JyZWN0IG51bWJlciBvZiBjb2x1bW5zIGZvciB0aG9zZSByb3dzLlxuICAqL1xuICBnZXROdW1Db2x1bW5zOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fJGVsLmZpbmQoJ3RoZWFkIHRyJykuY2hpbGRyZW4oKS5sZW5ndGg7XG4gIH0sXG5cbiAgLyoqXG4gICogICBAcmV0dXJuIHtib29sZWFufSBoYXMgYW55IHNlbGVjdGVkIHZhbHVlc1xuICAqL1xuICBoYXNTZWxlY3RlZFJlY29yZHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl8kdGJvZHkuZmluZCgndHIudWktc2VsZWN0ZWQnKS5sZW5ndGggPiAwO1xuICB9LFxuXG4gIC8qKlxuICAqICAgQHJldHVybiB7bnVtYmVyfSBudW1iZXIgb2Ygc2VsZWN0ZWQgcm93c1xuICAqL1xuICBnZXROdW1TZWxlY3RlZFJlY29yZHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl8kdGJvZHkuZmluZCgndHIudWktc2VsZWN0ZWQnKS5sZW5ndGg7XG4gIH0sXG5cbiAgLyoqXG4gICogICBAcmV0dXJuIHtBcnJheS48b2JqZWN0Pn0gc2VsZWN0ZWQgcmVjb3Jkc1xuICAqL1xuICBnZXRTZWxlY3RlZFJlY29yZHM6IGZ1bmN0aW9uKGZvcm1hdEZuKSB7XG4gICAgcmV0dXJuIHRoaXMuXyR0Ym9keS5maW5kKCd0ci51aS1zZWxlY3RlZCcpLm1hcChmdW5jdGlvbiAoaW5kZXgsIHJvd0VsZW1lbnQpIHtcbiAgICAgIGlmICh0eXBlb2YgZm9ybWF0Rm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdEZuKHRoaXMuX2dldFJlY29yZChyb3dFbGVtZW50KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0UmVjb3JkKHJvd0VsZW1lbnQpO1xuICAgIH0uYmluZCh0aGlzKSkuZ2V0KCk7XG4gIH0sXG5cbiAgLyoqXG4gICogQHJldHVybiB7QXJyYXkuPE51bWJlcnM+fSBzZWxlY3RlZCByZWNvcmRzXG4gICovXG4gIGdldFNlbGVjdGVkUmVjb3JkSWRzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTZWxlY3RlZFJlY29yZHMoZnVuY3Rpb24ocmVjb3JkKSB7IHJldHVybiByZWNvcmQuaWQ7IH0pO1xuICB9LFxuXG4gIC8qKlxuICAqICAgQHJldHVybiB7QXJyYXkuPG9iamVjdD59IGFsbCByZWNvcmRzXG4gICovXG4gIGdldFJlY29yZHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl8kdGJvZHkuZmluZCgndHInKS5tYXAoZnVuY3Rpb24gKGluZGV4LCByb3dFbGVtZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0UmVjb3JkKHJvd0VsZW1lbnQpO1xuICAgIH0uYmluZCh0aGlzKSkuZ2V0KCk7XG4gIH0sXG5cbiAgLyoqXG4gICogICBVcGRhdGVzIGNlbGwgdmFsdWVzIGZvciBhIGdpdmVuIHJvdywgdXNpbmcgalF1ZXJ5LmRhdGEoKSB3aGljaCB1cGRhdGVzIHRoZW0gaW4gbWVtb3J5LCBub3Qgb24gdGhlIG9yaWdpbmFsIGVsZW1lbnQgYXR0cmlidXRlc1xuICAqICAgICAqIE5vdGU6IGZvciBlZGl0YWJsZSBjZWxscywgYW5kIGV2ZW50dWFsbHkgYWxsIGNlbGxzLCB3aXRoIGFwcHJvcHJpYXRlIGF0dHJpYnV0ZXMsIHRoaXMgd2lsbCB1cGRhdGUgdGhlIGNlbGwgZGlzcGxheSB2YWx1ZSBhcyB3ZWxsXG4gICogICAgICogICAgICAgc2VlIHVwZGF0ZVJvd0ZpZWxkcyBmb3IgbW9yZSBkZXRhaWxzXG4gICpcbiAgKiAgIEBwYXJhbSB7bnVtYmVyfSB0aGUgaWQgb2YgdGhlIHJvdywgbG9jYXRlZCBpbiB0aGUgcm93J3MgZmlyc3QgY2VsbCwgZGF0YS1wcm9wZXJ0eT1cImlkXCJcbiAgKiAgIEBwYXJhbSB7T2JqZWN0fSBhbmQgb2JqZWN0IG9mIGtleSB2YWx1ZSBwYWlycyB0byB1cGRhdGUgY29ycmVzcG9uZGluZyBjZWxsIGRhdGEtcHJvcGVydHkgLSBkYXRhLXZhbHVlIHBhaXJzXG4gICogICBAcGFyYW0ge2Z1bmN0aW9ufSBhIGNhbGxiYWNrIHRvIHByb2Nlc3MgdGhlIHJvd1xuICAqL1xuICB1cGRhdGVSb3c6IGZ1bmN0aW9uKGlkLCBkYXRhLCBjYWxsYmFjaykge1xuICAgIHRoaXMuX3VwZGF0ZVJvd0ZpZWxkcyh0aGlzLl9maW5kUm93QnlJZChpZCksIGRhdGEsIGNhbGxiYWNrKTtcbiAgfSxcblxuICBnZXROdW1Ub3RhbFJvd3M6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl90b3RhbFJvd3M7XG4gIH1cbn0pO1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBQamF4VGFibGU7XG59IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicpIHtcbiAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gUGpheFRhYmxlOyB9KTtcbn1cblxuLy8gZXhwb3NlIHRhYmxlIGFuZCBwbHVnaW5zIHNvIHRoZXkgbWF5IGJlIGVhc2lseSBleHRlbmRlZCBhdCB3aWxsXG53aW5kb3cuUGpheFRhYmxlID0gUGpheFRhYmxlO1xud2luZG93LlBqYXhUYWJsZVNoYXJlZCA9IHtcbiAgQ2VsbFBsdWdpbk1peGluOiBDZWxsUGx1Z2luTWl4aW4sXG4gIEFqYXhDZWxsTWl4aW46IEFqYXhDZWxsTWl4aW4sXG4gIEVkaXRhYmxlRHJvcGRvd25QbHVnaW46IEVkaXRhYmxlRHJvcGRvd25QbHVnaW4sXG4gIFJlbW92ZVJvd1BsdWdpbjogUmVtb3ZlUm93UGx1Z2luLFxuICBTZWFyY2hCb3g6IFNlYXJjaEJveFxufTtcbndpZGdldCgncGpheFRhYmxlJywgUGpheFRhYmxlKTtcbi8vIGF1dG8gaW5pdFxuJChmdW5jdGlvbigpeyAkKCdbZGF0YS1wamF4LXRhYmxlXVtkYXRhLWF1dG8taW5pdF0nKS5wamF4VGFibGUod2luZG93LlBqYXhUYWJsZUNvbmZpZyA9IHdpbmRvdy5QamF4VGFibGVDb25maWcgfHwge30pOyB9KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuLyoqXG4qICAgQGNvbnN0cnVjdG9yXG4qICAgZGVmYXVsdHMgdG8gcHJvdG90eXBlIGJhc2VkIHdpZGdldCBjb25zdHJ1Y3Rpb24gd2l0aCBuZXdcbiogICBzdXBwb3J0cyBtb2R1bGUgcGF0dGVybiB0aHJvdWdoIGEgZmxhZ1xuKlxuKiAgIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSBuYW1lIG9yIG5hbWVzcGFjZSBvZiB0aGUgd2lkZ2V0XG4qICAgQHBhcmFtIHtmdW5jdGlvbn0gd2lkZ2V0Q29uc3RydWN0b3IgdGhlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciB0aGUgd2lkZ2V0XG4qICAgQHBhcmFtIHtib29sZWFufSBpc01vZHVsZSB3aGV0aGVyIHRoaXMgbW9kdWxlIGlzIGRlZmluZWQgdXNpbmcgdGhlIG1vZHVsZSBwYXR0ZXJuXG4qL1xuZnVuY3Rpb24gd2lkZ2V0KG5hbWUsIHdpZGdldENvbnN0cnVjdG9yKSB7XG4gIHZhciBuYW1lc3BhY2UgPSAkO1xuICB2YXIgbmFtZXMgPSBuYW1lLnNwbGl0KCcuJyk7XG4gIHZhciBmaW5hbE5hbWUgPSBuYW1lcy5wb3AoKTtcbiAgdmFyIGxlbmd0aDtcblxuICBpZiAoIW5hbWVzLmxlbmd0aCkge1xuICAgIG5hbWVzID0gWydQamF4VGFibGUnLCAnd2lkZ2V0J107IC8vXG4gIH1cblxuICBsZW5ndGggPSBuYW1lcy5sZW5ndGg7XG4gIGZvcih2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICghbmFtZXNwYWNlW25hbWVzW2ldXSkge1xuICAgICAgbmFtZXNwYWNlW25hbWVzW2ldXSA9IHt9O1xuICAgIH1cbiAgICBuYW1lc3BhY2UgPSBuYW1lc3BhY2VbbmFtZXNbaV1dO1xuICB9XG5cbiAgLyoqXG4gICogICBidWlsZGVyIGlzIHRoZSBmdW5jdGlvbiB0aGF0IGlzIGF0dGFjaGVkIHRvICQuZm5cbiAgKiAgIGFuZCBjb250cm9scyBpbnN0YW5jZSBjb25zdHJ1Y3Rpb24gb3IgbWV0aG9kIGV4ZWN1dGlvblxuICAqICAgb24gYSBqUXVlcnkgb2JqZWN0J3MgZWxlbWVudCBjb2xsZWN0aW9uXG4gICpcbiAgKiAgIEBwYXJhbSB7T2JqZWN0fHN0cmluZ3x1bmRlZmluZWR9XG4gICogICAgIG9iamVjdCBmb3IgY29uZmlndXJhdGlvbiBvZiBhIG5ldyBpbnN0YW5jZVxuICAqICAgICBzdHJpbmcgZm9yIG1ldGhvZCBleGVjdXRpb24gb24gaW5zdGFuY2VzIGluIHRoZSBjb2xsZWN0aW9uXG4gICogICAgIHVuZGVmaW5lZC9ub3RoaW5nIHRvIHJlY2VpdmUgdGhlIHdpZGdldCBpbnN0YW5jZShzKSBpbiB0aGUgY29sbGVjdGlvblxuICAqXG4gICogICBAcmV0dXJuIHtPYmplY3R8QXJyYXk8b2JqZWN0Pnw/fEFycmF5PD8+fSByZXR1cm5zXG4gICogICAgIHRoZSB3aWRnZXQgaW5zdGFuY2Ugb2JqZWN0LCBhbmQgYXJyYXkgb2YgaW5zdGFuY2Ugb2JqZWN0cyxcbiAgKiAgICAgYW55dGhpbmcgcmV0dXJuZWQgYnkgYW4gaW5zdGFuY2UgbWV0aG9kLCBvclxuICAqICAgICBhbnkgYXJyYXkgb2YgYW55IHRoaW5ncyByZXR1cm5lZCBieSBpbnN0YW5jZSBtZXRob2RzXG4gICovXG4gIGZ1bmN0aW9uIGJ1aWxkZXIob3B0aW9ucykge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIHZhciB2YWx1ZXMgPSBbXTsgLy8gcmV0dXJuIHZhbHVlc1xuXG4gICAgJCh0aGlzKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgLy8gZ2V0IHRoZSBjdXJyZW50IGluc3RhbmNlIG9yIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgIHZhciAkZWwgPSAkKHRoaXMpO1xuICAgICAgdmFyIHdpZGdldCA9ICRlbC5kYXRhKGZpbmFsTmFtZSk7XG4gICAgICB2YXIgbWV0aG9kUmV0dXJuO1xuXG4gICAgICBpZiAoIXdpZGdldCkge1xuICAgICAgICB3aWRnZXQgPSAkZWwuZGF0YShmaW5hbE5hbWUsIG5ldyB3aWRnZXRDb25zdHJ1Y3Rvcih0aGlzLCBvcHRpb25zKSkuZGF0YShmaW5hbE5hbWUpO1xuICAgICAgfVxuXG4gICAgICAvLyBleGVjdXRlIG1ldGhvZHMgYW5kIHJldHVybiB0aGUgbWV0aG9kIHJldHVybiBvciB0aGlzIGVsZW1lbnQgZm9yIGNoYWluaW5nXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3IgcmVzZXR0aW5nIHdpZGdldHMsIGNsZWFudXAgYW5kIHJlc2V0XG4gICAgICAgIGlmIChvcHRpb25zID09PSAnZGVzdHJveScpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHdpZGdldC5kZXN0cm95ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB3aWRnZXQuZGVzdHJveSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBkZWxldGUgJGVsLmRhdGEoKVtmaW5hbE5hbWVdO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB3aWRnZXRbb3B0aW9uc10gPT09ICdmdW5jdGlvbicgJiYgb3B0aW9ucy5jaGFyQXQoMCkgIT09ICdfJykge1xuICAgICAgICAgIG1ldGhvZFJldHVybiA9IHdpZGdldFtvcHRpb25zXS5hcHBseSh3aWRnZXQsIGFyZ3Muc2xpY2UoMSwgYXJncy5sZW5ndGgpKTtcbiAgICAgICAgICB2YWx1ZXMucHVzaChtZXRob2RSZXR1cm4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBtZXRob2Q6ICcgKyBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVzLnB1c2god2lkZ2V0KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIHJldHVybiBvbmx5IDEgdmFsdWUgaWYgcG9zc2libGVcbiAgICAgIHJldHVybiB2YWx1ZXMubGVuZ3RoID4gMSA/IHZhbHVlcyA6IHZhbHVlc1swXTtcbiAgfTtcblxuICBpZiAoISQuZm5bZmluYWxOYW1lXSkge1xuICAgICQuZm5bZmluYWxOYW1lXSA9IGJ1aWxkZXI7XG4gIH1cbiAgbmFtZXNwYWNlW2ZpbmFsTmFtZV0gPSBidWlsZGVyO1xuXG4gIHJldHVybiBidWlsZGVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHdpZGdldDtcbiJdfQ==
