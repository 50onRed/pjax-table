(function() {
  Handlebars.registerHelper('sortIcon', function(sort_direction) {
    if (sort_direction === 'asc') {
      return 'up';
    }
    return 'down';
  });
})();