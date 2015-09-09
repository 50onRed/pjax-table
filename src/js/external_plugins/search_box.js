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
