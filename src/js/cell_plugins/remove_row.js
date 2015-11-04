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
