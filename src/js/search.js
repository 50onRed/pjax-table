(function($) {
  'use strict';
  var slice = Array.prototype.slice;

  /**
  *
  */
  function PjaxTableSearch(el, options) {
    this._$el = $(el);
    this._$searchFilter = this._$el.find('input[type="search"]');
    
    this._init();
  }

  PjaxTableSearch.prototype._init = function() {
    this._$el.find('.ui-search').click(this._onClickSearch.bind(this));
    this._$el.find('.ui-close').click(this._onClickClose.bind(this));
    this._$searchFilter.keyup(this._onInputKeyup.bind(this));
  };

  PjaxTableSearch.prototype._onClickSearch = function(e) {
    this._$el.trigger('search:submit', $searchFilter.val());
  };

  PjaxTableSearch.prototype._onInputKeyup = function(e) {
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
      var methodReturn;

      if (!widget) {
        widget = $el.data('pjaxTableSearch', new PjaxTableSearch(this, options)).data('pjaxTableSearch');
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
  
  $(function() { $('[data-pjax-table-search][data-auto-init="true"]').pjaxTableSearch({}); });
})(jQuery);
