(function() {
  $('body').html('<div id="table-container"></div>');
  $('#table-container').html(UI.modules.tableGenerator.generate());
  console.log('ok...')
  $('#pjax-table').pjaxTable({});
})();
