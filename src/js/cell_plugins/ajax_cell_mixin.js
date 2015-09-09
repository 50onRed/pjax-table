'use strict';
var CellPluginMixin = require('./cell_plugin_mixin');

function AjaxCellMixin(el, options) {
  CellPluginMixin.call(this, el, options);

  this._url = options.url || this._$el.data('url');

  this._save = function save(data) {
    this._$el.trigger('plugin:before:save');

    return $.ajax({
      type: 'POST',
      url: this._url,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(data),
      context: this
    }).done(function (data, textStatus, jqXHR) {
      if (data.status === 'success') {
        this._$el.trigger('plugin:save:success', data);
      } else {
        this._$el.trigger('plugin:save:error', data);
      }
    }).fail(function (jqXHR, textStatus, errorThrown) {
      this._$el.trigger('plugin:save:error', {
        textStatus: textStatus,
        errorThrown: errorThrown,
        jqXHR: jqXHR
      });
    });
  };
}

if (typeof module === 'object') {
  module.exports = AjaxCellMixin;
} else if (typeof define === 'function') {
  define(function() { return AjaxCellMixin; });
} else {
  window.AjaxCellMixin = AjaxCellMixin;
}

