'use strict';
var widget = require('../util/widget');
var CellPluginMixin = require('./cell_plugin_mixin');


/**
*  Dependencies:
*    X-Editable ( for field toggling )
*    Parsley ( for validation )
*    Numeral ( for number formatting )
*
*  Expects Data Attributes Supported By X-Editable
*  http://vitalets.github.io/x-editable/docs.html#editable
*
*    data- ( x-editable attributes )
*    type ( e.g. text )
*    url ( url to post updates )
*    pk (primary key)
*    name ( name of field to be updated )
*
*  data- ( our custom data attributes )
*    format ( e.g. usd )
*    editable-validators ( used for parsley validation )
*/
function EditableCellPlugin(element, options) {
  CellPluginMixin.call(this, element, options);

  this._$editable = this._$el.find('[data-editable-link]');
  this.url = this._$editable.data('url');

  this.record = options.record;

  this.name = this._$editable.data('name');
  this.dataFormat = this._$el.data('format');
  this.validators = this._$editable.data('editable-validators');
  this.defaultValue = this._$editable.data('default-value');
  this.initialValue = this._$editable.data('value');

  this.formatMap = {
    text: function(value) {
      return value;
    },
    usd: function(value) {
      return numeral(value).format('$0,0.00');
    },
    usd_thousandth: function(value) {
      return numeral(value).format('$0,0.000');
    },
    percent: function(value) {
      return numeral(value).divide(100).format('0.00%');
    }
  };

  this._defaultErrorMessage = 'Something went wrong.';

  this.init();
}

EditableCellPlugin.prototype.init = function() {
  this._$editable.on('shown', $.proxy(this._onShown, this));

  this._$editable.editable({
    ajaxOptions: {
      contentType: 'application/json',
      dataType: 'json'
    },
    toggle: 'click',
    // onblur: 'ignore', // because parsley also hooks to blur (focusout)
    display: this._display.bind(this),
    params: this._params.bind(this),
    success: this._onSuccess.bind(this),
    error: this._onError.bind(this),
    // mode: 'inline', // popover by default, blows out the table cell
    defaultValue: this.defaultValue,
    emptytext: this._display.bind(this)
  });

  this._$editable.editable('show');
};

EditableCellPlugin.prototype._display = function(value, sourceData) {
  value = value || this.defaultValue;
  if (this.dataFormat) {
    return this.formatMap[this.dataFormat](value);
  }
  return null;
};

EditableCellPlugin.prototype._onShown = function(e, editable) {
  // initialize parsley with provided validators
  var $input = editable.input.$input;

  // strip starting $ for amounts
  var value = $input.val();
  if (value.indexOf('$') === 0) {
    $input.val(value.substr(1));
  }

  // remove input if "unlimited" is detected
  if (value === 'unlimited') {
    $input.val('');
  }

  $.each(this.validators, function (key, value) {
    $input.attr('data-' + key, value);
  });
  $input.parsley();

  // prevent default editable action if parsley validate fails
  // editable hooks to the form element submit and stops propagation, so we must hook to the button click
  // *** NOTE: this is triggering for both enter press, and button click
  editable.container.$form.find('.editable-submit').click(function (e) {
    return $input.parsley().validate() === true;
  }.bind(this));

  this._$el.trigger('editable:open', { name: this.name });
};

EditableCellPlugin.prototype._params = function(params) {
  var record = { pk: params.pk };

  if (this.dataFormat === 'usd' || this.dataFormat === 'usd_thousandth') {
    record[this.name] = params.value ? parseFloat(params.value) : null;
  } else {
    record[this.name] = params.value ? params.value : null;
  }

  var requiredFields = this.record.additionalFields.requiredFields;
  requiredFields = requiredFields ? requiredFields.split(',') : null;

  if (requiredFields) {
    for (var i = 0; i < requiredFields.length; i++) {
      var field = requiredFields[i];
      var value = this.record.additionalFields[field];
      if (value) {
        record[field] = value;
      }
    }
  }

  return JSON.stringify(record);
};

EditableCellPlugin.prototype._onSuccess = function(response, newValue) {
  var $editableForm = this._$editable.data('editableContainer').$form;
  var $errorsContainer;
  var message = response.message;

  $editableForm.find('.form-group').removeClass('has-error');
  this._$el.find(this._$el.data('display-target')).text(this._display(newValue));

  if (!newValue && this._$editable.data('default-value')) {
    this._$editable.attr('data-value', 'null');
    this._$editable.editable('setValue', this._$editable.data('default-value'));
    this._$editable.text(this._$editable.data('default-value'));
  } else {
    this._$editable.attr('data-value', newValue); // tied to styles
    this._$editable.editable('setValue', newValue);
  }

  this._$el.trigger('editable:success', { value: newValue, data: response, name: this.name });
};

EditableCellPlugin.prototype._onError = function(response, newValue) {
  var responseJSON;
  var errors;
  var errorNames;

  if (response.status === 400) {
    responseJSON = response.responseJSON || {};
    errors = responseJSON.errors || {};
    errorNames = Object.keys(errors);

    this._clearErrorMessages();
    if (!errorNames.length) {
       this._showErrorMessage(this._defaultErrorMessage);
    } else {
      errorNames.forEach(function(errorName) {
        errors[errorName].forEach(this._showErrorMessage.bind(this));
      }.bind(this));
    }
  }

  this._$el.trigger('editable:error', { errors: errors });
};

EditableCellPlugin.prototype._clearErrorMessages = function() {
  this._$editable.data('editableContainer').$form
    .find('.form-group').removeClass('has-error')
    .end()
    .find('.ui-errors').empty();
};

EditableCellPlugin.prototype._showErrorMessage = function(message) {
  var $editableForm = this._$editable.data('editableContainer').$form;
  $editableForm.find('.form-group').addClass('has-error');
  $editableForm.find('.ui-errors').append($('<div class="ui-error help-block"></div>').text(message));
};

if (typeof module === 'object') {
  module.exports = EditableCellPlugin;
} else if (typeof define === 'function') {
  define(function() { return EditableCellPlugin; });
} else {
  window.EditableCellPlugin = EditableCellPlugin;
}

widget('editableCellPlugin', EditableCellPlugin);
