this["Fifty"] = this["Fifty"] || {};
this["Fifty"]["templates"] = this["Fifty"]["templates"] || {};
this["Fifty"]["templates"]["body_cell"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<td data-property=\""
    + escapeExpression(((helper = (helper = helpers.property || (depth0 != null ? depth0.property : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"property","hash":{},"data":data}) : helper)))
    + "\" data-value=\""
    + escapeExpression(((helper = (helper = helpers.value || (depth0 != null ? depth0.value : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"value","hash":{},"data":data}) : helper)))
    + "\">"
    + escapeExpression(((helper = (helper = helpers.display_value || (depth0 != null ? depth0.display_value : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"display_value","hash":{},"data":data}) : helper)))
    + "</td>";
},"useData":true});
this["Fifty"]["templates"]["body_row"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, buffer = "<tr>";
  stack1 = ((helper = (helper = helpers.cells || (depth0 != null ? depth0.cells : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"cells","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</tr>";
},"useData":true});
this["Fifty"]["templates"]["header_cell"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "<th data-sortable=\"true\" data-property=\""
    + escapeExpression(((helper = (helper = helpers.property || (depth0 != null ? depth0.property : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"property","hash":{},"data":data}) : helper)))
    + "\" data-current-sort-direction=\""
    + escapeExpression(((helper = (helper = helpers.current_sort || (depth0 != null ? depth0.current_sort : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"current_sort","hash":{},"data":data}) : helper)))
    + "\" data-default-sort-direction=\"asc\">\n  "
    + escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"name","hash":{},"data":data}) : helper)))
    + "\n  <span class=\"fifty-table-sort-indicator\">\n    <i class=\"fa fa-caret-"
    + escapeExpression(((helpers.sortIcon || (depth0 && depth0.sortIcon) || helperMissing).call(depth0, (depth0 != null ? depth0.current_sort : depth0), {"name":"sortIcon","hash":{},"data":data})))
    + "\"></i>\n  </span>\n</th>\n";
},"useData":true});
this["Fifty"]["templates"]["header_row"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, buffer = "<tr>";
  stack1 = ((helper = (helper = helpers.cells || (depth0 != null ? depth0.cells : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"cells","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "</tr>";
},"useData":true});
this["Fifty"]["templates"]["pagination"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "    <div class=\"btn-group\">\n      <button type=\"button\" class=\"btn btn-default btn-sm ui-prev-page\" ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.on_first_page : depth0), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  buffer += ">\n        <i class=\"fa fa-chevron-left\"></i>\n      </button>\n    </div>\n\n    <div class=\"btn-group\">\n      <div class=\"ui-page-index-dropdown dropdown\" data-current-page=\""
    + escapeExpression(((helper = (helper = helpers.$current_page || (depth0 != null ? depth0.$current_page : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"$current_page","hash":{},"data":data}) : helper)))
    + "\">\n        <button class=\"btn btn-default btn-sm dropdown-toggle\" data-toggle=\"dropdown\">\n          <span class=\"dropdown-label\">Page "
    + escapeExpression(((helper = (helper = helpers.current_page || (depth0 != null ? depth0.current_page : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"current_page","hash":{},"data":data}) : helper)))
    + "</span>\n          <i class=\"fa fa-angle-down\"></i>\n        </button>\n        <ul class=\"dropdown-menu open-up ui-page-select-dropdown\">\n          "
    + escapeExpression(((helper = (helper = helpers.page_items || (depth0 != null ? depth0.page_items : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"page_items","hash":{},"data":data}) : helper)))
    + "\n        </ul>\n      </div>\n    </div>\n\n    <div class=\"btn-group\">\n      <button type=\"button\" class=\"btn btn-default btn-sm ui-next-page\" ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.on_last_page : depth0), {"name":"if","hash":{},"fn":this.program(2, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + ">\n        <i class=\"fa fa-chevron-right\"></i>\n      </button>\n    </div>\n";
},"2":function(depth0,helpers,partials,data) {
  return "disabled";
  },"4":function(depth0,helpers,partials,data) {
  var helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;
  return "      <div class=\"btn-group btn-sm btn-link\">Page "
    + escapeExpression(((helper = (helper = helpers.current_page || (depth0 != null ? depth0.current_page : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"current_page","hash":{},"data":data}) : helper)))
    + " of "
    + escapeExpression(((helper = (helper = helpers.last_page || (depth0 != null ? depth0.last_page : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"last_page","hash":{},"data":data}) : helper)))
    + "</div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div class=\"fifty-table-pagination ui-pagination\" data-current-page=\""
    + escapeExpression(((helper = (helper = helpers.current_page || (depth0 != null ? depth0.current_page : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"current_page","hash":{},"data":data}) : helper)))
    + "\" data-current-perpage=\""
    + escapeExpression(((helper = (helper = helpers.per_page || (depth0 != null ? depth0.per_page : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"per_page","hash":{},"data":data}) : helper)))
    + "\">\n  <div class=\"pull-left btn-toolbar\">\n    <div class=\"dropdown btn-group\" data-per-page=\""
    + escapeExpression(((helper = (helper = helpers.$perpage || (depth0 != null ? depth0.$perpage : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"$perpage","hash":{},"data":data}) : helper)))
    + "\">\n      <button data-toggle=\"dropdown\" class=\"btn btn-default btn-sm dropdown-toggle\">\n        <span class=\"dropdown-label\">Per Page "
    + escapeExpression(((helper = (helper = helpers.per_page || (depth0 != null ? depth0.per_page : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"per_page","hash":{},"data":data}) : helper)))
    + "</span>\n        <span class=\"fa fa-angle-down\"></span>\n      </button>\n      <ul class=\"dropdown-menu open-up ui-perpage-dropdown\">\n        <li data-value=\"10\"><a>10</a></li>\n        <li data-value=\"20\"><a>20</a></li>\n        <li data-value=\"50\"><a>50</a></li>\n        <li data-value=\"100\"><a>100</a></li>\n      </ul>\n    </div>\n    <div class=\"btn-group btn-sm btn-link\">From "
    + escapeExpression(((helper = (helper = helpers.from || (depth0 != null ? depth0.from : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"from","hash":{},"data":data}) : helper)))
    + " to "
    + escapeExpression(((helper = (helper = helpers.to || (depth0 != null ? depth0.to : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"to","hash":{},"data":data}) : helper)))
    + " of "
    + escapeExpression(((helper = (helper = helpers.total || (depth0 != null ? depth0.total : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"total","hash":{},"data":data}) : helper)))
    + "</div>\n  </div>\n\n  <div class=\"pull-right btn-toolbar\">\n";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.on_last_page : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.program(4, data),"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "  </div>\n</div>\n";
},"useData":true});
this["Fifty"]["templates"]["pagination_page_item"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
  return " active ";
  },"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<li data-value=\""
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "\">\n  <a class=\"item ";
  stack1 = helpers['if'].call(depth0, (depth0 != null ? depth0.active : depth0), {"name":"if","hash":{},"fn":this.program(1, data),"inverse":this.noop,"data":data});
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\">"
    + escapeExpression(((helper = (helper = helpers.index || (depth0 != null ? depth0.index : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"index","hash":{},"data":data}) : helper)))
    + "</a>\n</li>";
},"useData":true});
this["Fifty"]["templates"]["table"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
  var stack1, helper, functionType="function", helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, buffer = "<div id=\"fifty-table\" \n  data-fifty-table-id=\"wrapper-id\" \n  data-pjax-container=\"#fifty-table\" \n  data-push-state-enabled=\"true\" \n  data-paginated=\"true\">\n  <div id=\"wrapper-id\" class=\"table-wrapper\" data-total-rows=\""
    + escapeExpression(((helper = (helper = helpers.total_rows || (depth0 != null ? depth0.total_rows : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"total_rows","hash":{},"data":data}) : helper)))
    + "\">\n    <table class=\"table table-bordered\">\n      <thead>\n        ";
  stack1 = ((helper = (helper = helpers.header_rows || (depth0 != null ? depth0.header_rows : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"header_rows","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n      </thead>\n      <tbody>\n        ";
  stack1 = ((helper = (helper = helpers.body_rows || (depth0 != null ? depth0.body_rows : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"body_rows","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  buffer += "\n      </tbody>\n      <tfoot>\n        ";
  stack1 = ((helper = (helper = helpers.footer_rows || (depth0 != null ? depth0.footer_rows : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"footer_rows","hash":{},"data":data}) : helper));
  if (stack1 != null) { buffer += stack1; }
  return buffer + "\n      </tfoot>\n    </table>\n  </div>\n  <div>\n    "
    + escapeExpression(((helper = (helper = helpers.pagination || (depth0 != null ? depth0.pagination : depth0)) != null ? helper : helperMissing),(typeof helper === functionType ? helper.call(depth0, {"name":"pagination","hash":{},"data":data}) : helper)))
    + "\n  </div>\n</div>\n";
},"useData":true});