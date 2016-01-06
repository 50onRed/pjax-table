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

  this._save = function($selectedItem, record) {
    this._updateLabel($selectedItem);
    this._save(record);
  };

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

  this._$el.trigger('dropdown:changed', payload);

  if (!payload.cancel) {
    this._save($item, record);
  }
};

EditableDropdownPlugin.prototype._updateLabel = function($selectedItem) {
  var $label = this._$el.find('.dropdown-label');
  var newSelection = $selectedItem.find('a').html();
  $label.html(newSelection);
};

EditableDropdownPlugin.prototype._onPluginSaveSuccess = function(e, data) {
  this._$el.trigger('message', { status: 'success', message: data.message });
};

EditableDropdownPlugin.prototype._onPluginSaveError = function(e, data) {
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
