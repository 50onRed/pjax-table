describe('pjax table', function() {
  $('body').append('<div id="table-container"></div>');
  var $tableContainer = $('#table-container');
  var $table;

  beforeEach(function() {
    $tableContainer.html(Fifty.modules.tableGenerator.generate());
    $table = $tableContainer.find('#pjax-table');
    // console.log($table);
  });

  it('should be a method on $.fn', function() {
    expect($.fn.pjaxTable).toBeDefined();
    expect(typeof $.fn.pjaxTable === 'function').toBe(true);
  });

  it('should be able to be instantiated', function() {
    var table = $table.pjaxTable({});
    expect(table).toBeDefined();
    expect(typeof table === 'object').toBe(true);
  });

  it('should expose a list of allowed methods', function() {
    var table = $table.pjaxTable({});
    var allowedMethods = [
      'update',
      'refresh',
      'refreshPlugins',
      'getUrl',
      'updateParameters',
      'removeParameters',
      'getParameters',
      'getNumRecords',
      'getNumColumns',
      'hasSelected',
      'getNumSelected',
      'getSelected',
      'getSelectedIds',
      'getAllRecords',
      'updateRow',
      'getTotalRows'
    ];

    allowedMethods.forEach(function(method) {
      spyOn(table, method);
      $table.pjaxTable(method);
      expect(table[method]).toHaveBeenCalled();
    });
  });

  // it('should be configurable', function() {

  // });

  // describe('Events check', function() {
  //   var events = ['load.table', 'sort.table', 'page.table', 'perpage.table', 'nextpage.table', 'prevpage.table', 'select.table',
  //   'deselect.table', 'select_all.table', 'deselect_all.table', 'search.table', 'clear_search.table'
  //   ];
  //   var eventSpies = {};
  //   var contentType = {
  //     "Content-Type": "text/html"
  //   };
  //   var htmlString = String(Fifty.modules.tableGenerator.generate());

  //   //Setup a spy on each event
  //   events.forEach(function(event) {
  //     var spyName = event.split('.')[0] + 'Spy';
  //     eventSpies[spyName] = jasmine.createSpy(spyName);;

  //     //set the spies' identities to any data that is sent with the event trigger
  //     $('document').on(event, function(e, data) {
  //       eventSpies[spyName](data)
  //     });
  //   });

    // describe('Sorting tests', function() {
    //   var server;

    //   beforeEach(function() {
    //     server = sinon.fakeServer.create();
    //   });
    //   afterEach(function() {
    //     server.restore();
    //   });

    //   it('should fire sort.table when a column header is clicked', function() {
    //     $fiftyTable.find('th[data-sortable="true"]').first().trigger('click');

    //     //respond to the request to server for sorted data    
    //     server.respondWith(200, contentType, htmlString);

    //     //TODO: also test that sortSpy has the correct identity
    //     expect(eventSpies.sortSpy).toHaveBeenCalled();
    //   });
    // });

    // describe('Pagination tests', function() {
    //   var server;

    //   beforeEach(function() {
    //     server = sinon.fakeServer.create();
    //   });
    //   afterEach(function() {
    //     server.restore();
    //   });

    //   it('should fire page.table when a page number is clicked', function() {
    //     $fiftyTable.find('.ui-page-select-dropdown > li').trigger('click');
    //     server.respondWith(200, contentType, htmlString);
    //     expect(eventSpies.pageSpy).toHaveBeenCalled();
    //   });

    //   it('should fire perpage.table when perpage button is clicked', function() {
    //     $fiftyTable.find('.ui-perpage-dropdown > li').trigger('click');
    //     server.respondWith(200, contentType, htmlString);
    //     expect(eventSpies.perpageSpy).toHaveBeenCalled();
    //   });

    //   it('should fire nextpage.table when nextpage button is clicked', function() {
    //     $fiftyTable.find('.ui-next-page').trigger('click');
    //     server.respondWith(200, contentType, htmlString);
    //     expect(eventSpies.nextpageSpy).toHaveBeenCalled();
    //   });

    //   it('should fire prevpage.table when prevpage button is clicked', function() {
    //     $fiftyTable.find('.ui-prev-page').trigger('click');
    //     server.respondWith(200, contentType, htmlString);
    //     expect(eventSpies.prevpageSpy).toHaveBeenCalled();
    //   });
    // });

    // describe('Selection tests', function() {
    //   //select.table
    //   //deselect.table
    //   //select_all.table
    //   //deselect_all.table
    //   //getSelected
    //   //getSelectedIds
    //   //getNumSelected
    // });

    // describe('Sorting tests', function() {
    //   var server;

    //   //sort.tabe
    //   //clear_sort.table
    // });

    // describe('Loading tests', function() {
    //   var server;

    //   //load.table
    // });

    // describe('get num rows/columns functionality', function() {
    //   var totalRows = fiftyTable.getTotalRows();
    //   var numRecords = fiftyTable.getNumRecords();
    //   var numColumns = fiftyTable.getNumColumns();

    //   it('should return 50', function() {
    //     expect(totalRows).toEqual(50);
    //   });
    //   it('should return 100', function() {
    //                 expect(numRecords).toEqual(100); //This will work once pagination is in place
    //               });
    //   it('should return 5', function() {
    //     expect(numColumns).toEqual(5);
    //   });
    // });

    // describe('getURL functionality', function() {
    //   var url = fiftyTable.getUrl();
    //   it('should be ...', function() {
    //     expect(url).toEqual('/context.html'); //TODO: May want to change this
    //   });
    // });

    // describe('getAllRecords functionality', function() {
    //   var records = fiftyTable.getAllRecords();
    //   it('should return 50 records', function() {
    //     expect(records.length).toEqual(50);
    //   });
    //   it('should return objects with specific properties', function() {
    //     var properties = Object.keys(records[0]);
    //     expect(properties.indexOf('Heroes')).not.toBe(-1);
    //     expect(properties.indexOf('Nationality')).not.toBe(-1);
    //     expect(properties.indexOf('Email')).not.toBe(-1);

    //     properties = Object.keys(records[33]);
    //     expect(properties.indexOf('Heroes')).not.toEqual(-1);
    //     expect(properties.indexOf('Nationality')).not.toEqual(-1);
    //     expect(properties.indexOf('Email')).not.toEqual(-1);
    //   });
    // });
});