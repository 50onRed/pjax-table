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

  if (!$.fn[finalName]) {
    $.fn[finalName] = builder;
  }
  namespace[finalName] = builder;

  return builder;
}

module.exports = widget;
