(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
*   @param {domElement} el the plugin target element reference
*   @param {object} options
*   @param {object} options.queryState: a copy of the table's current query state
*   @param {object} options.record: this table row's record object
*   @param {object} options.event: the click event that triggered plugin construction
*/
function CellPluginMixin(el, options) {
    this._$el = $(el);
    this._initialQueryState = options.queryState;
    this._record = options.record;
    return this;
}

if (typeof module === 'object') {
  module.exports = CellPluginMixin;
} else if (typeof define === 'function') {
  define(function() { return CellPluginMixin; });
} else {
  window.CellPluginMixin = CellPluginMixin;
}

},{}],2:[function(require,module,exports){
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
  editable.container.$form.find('.ui-editable-submit').click(function (e) {
    return $input.parsley().validate();
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
}

window.EditableCellPlugin = EditableCellPlugin;

widget('editableCellPlugin', EditableCellPlugin);

},{"../util/widget":3,"./cell_plugin_mixin":1}],3:[function(require,module,exports){
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
          delete $el.data()[finalName];
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

},{}]},{},[2]);
