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
