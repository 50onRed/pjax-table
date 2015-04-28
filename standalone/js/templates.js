this["Fifty"] = this["Fifty"] || {};
this["Fifty"]["templates"] = this["Fifty"]["templates"] || {};
this["Fifty"]["templates"]["body_cell"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<td class=\"fifty-table-cell\" data-property=\""
    + alias3(((helper = (helper = helpers.property || (depth0 != null ? depth0.property : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"property","hash":{},"data":data}) : helper)))
    + "\" data-value=\""
    + alias3(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + "\">"
    + alias3(((helper = (helper = helpers.display_value || (depth0 != null ? depth0.display_value : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"display_value","hash":{},"data":data}) : helper)))
    + "</td>";
},"useData":true});
this["Fifty"]["templates"]["body_checkbox_cell"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<td class=\"fifty-table-cell\" data-property=\"id\" data-value=\""
    + this.escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"value","hash":{},"data":data}) : helper)))
    + "\">\n  <input type=\"checkbox\">\n</td>";
},"useData":true});
this["Fifty"]["templates"]["body_row"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<tr class=\"fifty-table-row\">"
    + ((stack1 = ((helper = (helper = helpers.cells || (depth0 != null ? depth0.cells : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"cells","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</tr>";
},"useData":true});
this["Fifty"]["templates"]["footer_cell"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<td class=\"fifty-table-footer fifty-table-footer-static-content\" colspan=\"7\"></td>";
},"useData":true});
this["Fifty"]["templates"]["footer_row"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<tr class=\"fifty-table-footer-row\">"
    + ((stack1 = ((helper = (helper = helpers.cells || (depth0 != null ? depth0.cells : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"cells","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</tr>";
},"useData":true});
this["Fifty"]["templates"]["header_cell"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<th class=\"fifty-table-header sortable\" \n  data-sortable=\"true\" \n  data-property=\""
    + alias3(((helper = (helper = helpers.property || (depth0 != null ? depth0.property : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"property","hash":{},"data":data}) : helper)))
    + "\" \n  data-current-sort-direction=\""
    + alias3(((helper = (helper = helpers.current_sort || (depth0 != null ? depth0.current_sort : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"current_sort","hash":{},"data":data}) : helper)))
    + "\" \n  data-default-sort-direction=\"asc\">\n  "
    + alias3(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + "\n  <span class=\"fifty-table-sort-indicator\">\n    <i class=\"fa fa-caret-"
    + alias3((helpers.sortIcon || (depth0 && depth0.sortIcon) || alias1).call(depth0,(depth0 != null ? depth0.current_sort : depth0),{"name":"sortIcon","hash":{},"data":data}))
    + "\"></i>\n  </span>\n</th>\n";
},"useData":true});
this["Fifty"]["templates"]["header_checkbox_cell"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<th class=\"fifty-table-header sortable\" \n  data-property=\"id\" \n  data-select-all-enabled=\"true\">\n  <input type=\"checkbox\">\n  <span class=\"fifty-table-sort-indicator\">\n    <i class=\"fa fa-caret-"
    + this.escapeExpression((helpers.sortIcon || (depth0 && depth0.sortIcon) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.current_sort : depth0),{"name":"sortIcon","hash":{},"data":data}))
    + "\"></i>\n  </span>\n</th>\n";
},"useData":true});
this["Fifty"]["templates"]["header_row"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<tr class=\"fifty-table-header-row\">"
    + ((stack1 = ((helper = (helper = helpers.cells || (depth0 != null ? depth0.cells : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"cells","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</tr>";
},"useData":true});
this["Fifty"]["templates"]["pagination"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "    <div class=\"btn-group\">\n      <button type=\"button\" class=\"btn btn-default btn-sm ui-prev-page\" "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.on_first_page : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">\n        <i class=\"fa fa-chevron-left\"></i>\n      </button>\n    </div>\n\n    <div class=\"btn-group\">\n      <div class=\"ui-page-index-dropdown dropdown\" data-current-page=\""
    + alias3(((helper = (helper = helpers.$current_page || (depth0 != null ? depth0.$current_page : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"$current_page","hash":{},"data":data}) : helper)))
    + "\">\n        <button class=\"btn btn-default btn-sm dropdown-toggle\" data-toggle=\"dropdown\">\n          <span class=\"dropdown-label\">Page "
    + alias3(((helper = (helper = helpers.current_page || (depth0 != null ? depth0.current_page : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"current_page","hash":{},"data":data}) : helper)))
    + "</span>\n          <i class=\"fa fa-angle-down\"></i>\n        </button>\n        <ul class=\"dropdown-menu open-up ui-page-select-dropdown\">\n          "
    + ((stack1 = ((helper = (helper = helpers.page_items || (depth0 != null ? depth0.page_items : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"page_items","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n        </ul>\n      </div>\n    </div>\n\n    <div class=\"btn-group\">\n      <button type=\"button\" class=\"btn btn-default btn-sm ui-next-page\" "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.on_last_page : depth0),{"name":"if","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">\n        <i class=\"fa fa-chevron-right\"></i>\n      </button>\n    </div>\n";
},"2":function(depth0,helpers,partials,data) {
    return "disabled";
},"4":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "      <div class=\"btn-group btn-sm btn-link\">Page "
    + alias3(((helper = (helper = helpers.current_page || (depth0 != null ? depth0.current_page : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"current_page","hash":{},"data":data}) : helper)))
    + " of "
    + alias3(((helper = (helper = helpers.last_page || (depth0 != null ? depth0.last_page : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"last_page","hash":{},"data":data}) : helper)))
    + "</div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"fifty-table-pagination ui-pagination\">\n  <div class=\"pull-left btn-toolbar\">\n    <div class=\"dropdown btn-group\" data-per-page=\""
    + alias3(((helper = (helper = helpers.$perpage || (depth0 != null ? depth0.$perpage : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"$perpage","hash":{},"data":data}) : helper)))
    + "\">\n      <button data-toggle=\"dropdown\" class=\"btn btn-default btn-sm dropdown-toggle\">\n        <span class=\"dropdown-label\">Per Page "
    + alias3(((helper = (helper = helpers.current_perpage || (depth0 != null ? depth0.current_perpage : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"current_perpage","hash":{},"data":data}) : helper)))
    + "</span>\n        <span class=\"fa fa-angle-down\"></span>\n      </button>\n      <ul class=\"dropdown-menu open-up ui-perpage-dropdown\">\n        <li data-value=\"10\"><a>10</a></li>\n        <li data-value=\"20\"><a>20</a></li>\n        <li data-value=\"50\"><a>50</a></li>\n        <li data-value=\"100\"><a>100</a></li>\n      </ul>\n    </div>\n    <div class=\"btn-group btn-sm btn-link\">From "
    + alias3(((helper = (helper = helpers.from || (depth0 != null ? depth0.from : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"from","hash":{},"data":data}) : helper)))
    + " to "
    + alias3(((helper = (helper = helpers.to || (depth0 != null ? depth0.to : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"to","hash":{},"data":data}) : helper)))
    + " of "
    + alias3(((helper = (helper = helpers.total || (depth0 != null ? depth0.total : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"total","hash":{},"data":data}) : helper)))
    + "</div>\n  </div>\n\n  <div class=\"pull-right btn-toolbar\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.on_last_page : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(4, data, 0),"data":data})) != null ? stack1 : "")
    + "  </div>\n</div>\n";
},"useData":true});
this["Fifty"]["templates"]["pagination_page_item"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return " active ";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<li data-value=\""
    + alias3(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"index","hash":{},"data":data}) : helper)))
    + "\">\n  <a class=\"item "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.active : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\">"
    + alias3(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"index","hash":{},"data":data}) : helper)))
    + "</a>\n</li>";
},"useData":true});
this["Fifty"]["templates"]["table"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div id=\"pjax-table\"\n  data-pjax-table \n  data-pjax-container=\"#pjax-table\"\n  data-url=\"/\" >\n  <table class=\"table pjax-table\"\n    data-total-rows=\""
    + alias3(((helper = (helper = helpers.total_rows || (depth0 != null ? depth0.total_rows : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"total_rows","hash":{},"data":data}) : helper)))
    + "\"\n    data-current-sort-property=\""
    + alias3(((helper = (helper = helpers.sort_property || (depth0 != null ? depth0.sort_property : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"sort_property","hash":{},"data":data}) : helper)))
    + "\"\n    data-current-sort-direction=\""
    + alias3(((helper = (helper = helpers.sort_order || (depth0 != null ? depth0.sort_order : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"sort_order","hash":{},"data":data}) : helper)))
    + "\"\n    data-current-search-str=\""
    + alias3(((helper = (helper = helpers.current_search_str || (depth0 != null ? depth0.current_search_str : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"current_search_str","hash":{},"data":data}) : helper)))
    + "\"\n    data-current-page=\""
    + alias3(((helper = (helper = helpers.current_page || (depth0 != null ? depth0.current_page : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"current_page","hash":{},"data":data}) : helper)))
    + "\"\n    data-current-perpage=\""
    + alias3(((helper = (helper = helpers.current_perpage || (depth0 != null ? depth0.current_perpage : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"current_perpage","hash":{},"data":data}) : helper)))
    + "\">\n    <thead>\n      "
    + ((stack1 = ((helper = (helper = helpers.header_rows || (depth0 != null ? depth0.header_rows : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"header_rows","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n    </thead>\n    <tbody>\n      "
    + ((stack1 = ((helper = (helper = helpers.body_rows || (depth0 != null ? depth0.body_rows : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"body_rows","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n    </tbody>\n    <tfoot>\n      "
    + ((stack1 = ((helper = (helper = helpers.footer_rows || (depth0 != null ? depth0.footer_rows : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"footer_rows","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n    </tfoot>\n  </table>\n  <div>\n    "
    + ((stack1 = ((helper = (helper = helpers.pagination || (depth0 != null ? depth0.pagination : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"pagination","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n  </div>\n</div>\n";
},"useData":true});