'use strict';

/**
*   A mixin that provides before and after hooks for ajax calls
*/
function ConfirmableMixin(element, options) {
  this._beforeSave = options.beforeSave || null;

  function wrapFn(fn, beforeFn, context) {
    return function(data) {
      var rawData = data;
      beforeFn(rawData, this._$el, this._record, function() {
        fn.apply(context, rawData);
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
