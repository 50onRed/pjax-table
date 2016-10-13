(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var CellPluginMixin = require('./cell_plugin_mixin');

function AjaxCellMixin(el, options) {
  CellPluginMixin.call(this, el, options);

  this._formatter = options.formatter || null;
  this._url = options.url || this._$el.data('url');

  this._save = function save(data) {
    if (typeof this._formatter === 'function') {
      data = this._formatter(this._$el, this._record, data);
    }
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

/**
*   A mixin that provides before and after hooks for ajax calls
*/
function ConfirmableMixin(element, options) {
  this._beforeSave = options.beforeSave || null;

  function wrapFn(fn, beforeFn, context) {
    return function(data) {
      beforeFn(data, this._$el, this._record, function() {
        fn.call(context, data);
      });
    };
  }

  if (typeof this._save === 'function' && typeof this._beforeSave === 'function') {
    this._save = wrapFn(this._save, this._beforeSave, this);
  }
}

if (typeof module === 'object') {
  module.exports = ConfirmableMixin;
} else if (typeof define === 'function') {
  define(function() { return ConfirmableMixin; });
} else {
  window.ConfirmableMixin = ConfirmableMixin;
}

},{}],4:[function(require,module,exports){
'use strict';
var AjaxCellMixin = require('./ajax_cell_mixin');
var ConfirmableMixin = require('./confirmable_mixin');
var widget = require('../util/widget');

/**
*   Editable Dropdown Plugin
*/
function EditableDropdownPlugin(element, options) {
  options.url = $(element).find('.ui-select-dropdown').data('url');
  AjaxCellMixin.call(this, element, options);
  ConfirmableMixin.call(this, element, options);

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

  this._labelToBeUpdated = $item.find('a').html();
  this._$el.trigger('dropdown:changed', payload);

  if (!payload.cancel) {
    this._save(record);
  }
};

EditableDropdownPlugin.prototype._onPluginSaveSuccess = function(e, data) {
  this._$el.find('.dropdown-label').html(this._labelToBeUpdated);
  this._$el.trigger('message', { status: 'success', message: data.message });
};

EditableDropdownPlugin.prototype._onPluginSaveError = function(e, data) {
  this._labelToBeUpdated = null;
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

},{"../util/widget":8,"./ajax_cell_mixin":1,"./confirmable_mixin":3}],5:[function(require,module,exports){
'use strict';
var widget = require('../util/widget');
var AjaxCellMixin = require('./ajax_cell_mixin');
var ConfirmableMixin = require('./confirmable_mixin');

/**
*   A simple delete record by click plugin. Uses the row id (pk/primary key)
*   TODO: should probably use DELETE verb
*/
function RemoveRowPlugin(element, options) {
  AjaxCellMixin.call(this, element, options)
  ConfirmableMixin.call(this, element, options);

  this._pk = this._$el.data('pk'); // could use this or options.record.id

  this._$el.on('click', this._onClick.bind(this));
  this._onClick();
}

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

},{"../util/widget":8,"./ajax_cell_mixin":1,"./confirmable_mixin":3}],6:[function(require,module,exports){
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

},{"../util/widget":8}],7:[function(require,module,exports){
'use strict';
var widget = require('./util/widget');

// Bundled Plugin Mixins
var CellPluginMixin = require('./cell_plugins/cell_plugin_mixin');
var AjaxCellMixin = require('./cell_plugins/ajax_cell_mixin');
var ConfirmableMixin = require('./cell_plugins/confirmable_mixin');

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
    if (!this._ajaxOnly && $.support.pjax) {
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

    if (error === 'abort') {
      return this._$el.trigger('table:cancelled');
    }

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
  ConfirmableMixin: ConfirmableMixin,
  EditableDropdownPlugin: EditableDropdownPlugin,
  RemoveRowPlugin: RemoveRowPlugin,
  SearchBox: SearchBox
};
widget('pjaxTable', PjaxTable);
// auto init
$(function(){ $('[data-pjax-table][data-auto-init]').pjaxTable(window.PjaxTableConfig = window.PjaxTableConfig || {}); });

},{"./cell_plugins/ajax_cell_mixin":1,"./cell_plugins/cell_plugin_mixin":2,"./cell_plugins/confirmable_mixin":3,"./cell_plugins/editable_dropdown":4,"./cell_plugins/remove_row":5,"./external_plugins/search_box":6,"./util/widget":8}],8:[function(require,module,exports){
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

},{}]},{},[7]);
