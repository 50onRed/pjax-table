'use strict';
var widget = require('util/widget');
widget('pjaxTable', window.PjaxTable);
// auto-init tables
$(function(){ $('[data-pjax-table][data-auto-init]').pjaxTable(window.PjaxTableConfig = window.PjaxTableConfig || {}); });
