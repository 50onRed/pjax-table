(function($) {
  'use strict';
  var slice = Array.prototype.slice;
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

  $.fn.pjaxTableSearch = function(options) {
    var args = slice.call(arguments);
    var values = []; // return values

    $(this).each(function() {
      // get the current instance or create a new one
      var $el = $(this);
      var widget = $el.data('pjaxTableSearch');

      if (!widget) {
        widget = $el.data('pjaxTableSearch', new PjaxTableSearch(this, options)).data('pjaxTableSearch');
      }

      // execute methods and return the method return or this element for chaining
      if (typeof options == 'string' && widget) {
        // special case for resetting widgets, cleanup and reset
        if (options === 'destroy') {
          if (typeof widget.destroy === 'function') {
            widget.destroy();
          }
          
          delete $el.data()[finalName];
          $el = null;
        }
      } else {
        values.push(widget);
      }
    });
    
    // return only 1 value if possible
    if (values.length > 1) {
      return values;
    } else if (values.length === 1) {
      return values[0];
    }
  };
  
  $('[data-pjax-table-search][data-auto-init]').pjaxTableSearch({});
})(jQuery);
