(function($) {
  'use strict';

  function PjaxTableSearch(el, options) {
    this._$el = $(this);
    this._$searchFilter = $el.find('input[type="search"]');
    
    this._init();
  }

  PjaxTableSearch.prototype._init = function() {
    this._$el.find('.ui-search').click(this._onClickSearch.bind(this));
    this._$el.find('.ui-close').click(this._onClickClose.bind(this));
    this._$searchFilter.keydown(this._onInputKeydown.bind(this));
  };

  PjaxTableSearch.prototype._onClickSearch = function(e) {
    this._$el.trigger('search:submit', $searchFilter.val());
  };

  PjaxTableSearch.prototype._onInputKeydown = function(e) {
    e.preventDefault();
    this._$el.find('.ui-close').removeClass('hidden');
    if (e.which === 13) {          //enter / return
      this._$el.trigger('search:submit', $(e.currentTarget).val());
    } else if (e.which == 27) {    //escape
      this._clearSearch();
    }
  };

  PjaxTableSearch.prototype._onClickClose = function(e) {
    this._clearSearch();
  };

  PjaxTableSearch.prototype._clearSearch = function(e) {
    this._$searchFilter.val('');
    this._$el.trigger('search:clear');
    this._$el.find('.ui-close').addClass('hidden');
  };

  // jquery plugin definition
  // Fifty.widget('fiftySearch', Search); 
  // $('[data-fifty-search][data-auto-init]').pjaxTableSearch({});
})(jQuery);
