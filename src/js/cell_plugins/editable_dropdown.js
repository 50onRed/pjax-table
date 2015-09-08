(function (UI) {
  'use strict';
  var Plugin = UI.Mixins.Plugin;

  function EditableDropdown(element, options) {
    options.url = $(element).find('.ui-select-dropdown').data('url');
    Plugin.call(this, element, options);
    this._record = options.record;
    this._requiredFields = this._$el.data('required-fields') ? this._$el.data('required-fields').split(',') : [];

    this._init();
  }

  EditableDropdown.prototype._init = function () {
    this._$el.on('click', '[data-dropdown-option]', this._createOnDropdownItemClick.bind(this));
    this._$el.on('plugin:save:success', this._onPluginSaveSuccess.bind(this));
    this._$el.on('plugin:save:error', this._onPluginSaveError.bind(this));
  };

  EditableDropdown.prototype._createOnDropdownItemClick = function (e) {
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
      this._saveChanges($item, record);
    }
  };

  EditableDropdown.prototype._saveChanges = function($selectedItem, record) {
    this._updateLabel($selectedItem);
    this._save(record);
  };

  EditableDropdown.prototype._updateLabel = function($selectedItem) {
    var $label = this._$el.find('.dropdown-label');
    var newSelection = $selectedItem.find('a').html();
    $label.html(newSelection);
  };

  EditableDropdown.prototype._onPluginSaveSuccess = function(e, data) {
    this._$el.trigger('message', { status: 'success', message: data.message });
  };

  EditableDropdown.prototype._onPluginSaveError = function(e, data) {
    this._$el.trigger('message', { status: 'error', message: data.message });
  };

  UI.widget('editableDropdown', EditableDropdown);
})(UI, jQuery);
