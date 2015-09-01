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
