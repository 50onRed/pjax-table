(function() {
  Handlebars.registerHelper('sortIcon', function(sort_direction) {
    if (sort_direction === 'asc') {
      return 'up';
    }
    return 'down';
  });

  $('body').html('<div id="table-container"></div>');
  $('#table-container').html(Fifty.modules.tableGenerator.generate());
  $('#fifty-table').fiftyTable({});
})();
