(function() {
  $('body').html('<div id="table-container"></div>');
  $('#table-container').html(Fifty.modules.tableGenerator.generate());
  $('#pjax-table').pjaxTable({});
})();
