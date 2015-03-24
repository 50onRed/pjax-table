describe('pjax table', function() {
  $('body').append('<div id="table-container"></div>');
  var $tableContainer = $('#table-container');
  var $table;

  beforeEach(function() {
    $tableContainer.html(Fifty.modules.tableGenerator.generate());
    $table = $tableContainer.find('#pjax-table');
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
      'hasSelectedRecords',
      'getNumSelectedRecords',
      'getSelectedRecords',
      'getSelectedRecordIds',
      'getRecords',
      'updateRow',
      'getNumTotalRows'
    ];

    allowedMethods.forEach(function(method) {
      spyOn(table, method);
      $table.pjaxTable(method);
      expect(table[method]).toHaveBeenCalled();
    });
  });

  it('should have defaults', function() {
    var table = $table.pjaxTable({});

    // todo test options reference

    expect(table._url).toEqual('/');
    expect(table._ajaxOnly).toEqual(false);
    expect(table._pushState).toEqual(true);
    expect(table._paginated).toEqual(true);
    expect(table._pjaxContainer).toEqual('#pjax-table');
    // todo: test template?
    expect(table._sortQueryKey).toEqual('order');
    expect(table._pageQueryKey).toEqual('page');
    expect(table._perPageQueryKey).toEqual('perpage');
    expect(table._searchQueryKey).toEqual('q');
    expect(table._$searchBox).toBeDefined();
  });

  it('should be configurable', function() {
    // configurations just to test variables set
    var table = $table.pjaxTable({
      url: 'test url string',
      ajaxOnly: true,
      pushState: false,
      paginated: true,
      pjaxContainer: '#my-test-id',
      noDataTemplate: function() { return 'test template'; },
      sortQueryKey: 'test sort key',
      pageQueryKey: 'test page key',
      perPageQueryKey: 'test per page key',
      searchQueryKey: 'test search key',
      searchId: '#test-search-id'
    });
    
    // todo test options reference

    expect(table._url).toEqual('test url string');
    expect(table._ajaxOnly).toEqual(true);
    expect(table._pushState).toEqual(false);
    expect(table._paginated).toEqual(true);
    expect(table._pjaxContainer).toEqual('#my-test-id');
    expect(table._noDataTemplate()).toEqual('test template');
    expect(table._sortQueryKey).toEqual('test sort key');
    expect(table._pageQueryKey).toEqual('test page key');
    expect(table._perPageQueryKey).toEqual('test per page key');
    expect(table._searchQueryKey).toEqual('test search key');
    expect(table._$searchBox).toBeDefined();
  });
  
  it('should have a default sort map', function() {
    var table = $table.pjaxTable({});
    expect(table._sortMap).toBeDefined();
    expect(table._sortMap.asc).toEqual('desc');
    expect(table._sortMap.desc).toEqual('asc');
  });

  it('should have a default query state', function() {
    var table = $table.pjaxTable({});
    expect(table._queryState).toBeDefined();
    expect(Object.keys(table._queryState).length).toEqual(4);
  });

  it('should have a default total rows', function() {
    var table = $table.pjaxTable({});
    expect(table._totalRows).toEqual(50);
  });

  it('should have a default element reference', function() {
    var table = $table.pjaxTable({});
    expect(table._$el).toBeDefined();
    expect(table._$el.is($table)).toBe(true);
  });

  it('should have a default tbody reference', function() {
    var table = $table.pjaxTable({});
    expect(table._$tbody).toBeDefined();
    expect(table._$tbody.is($table.find('tbody'))).toBe(true);
  });
});