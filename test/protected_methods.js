describe('pjax table protected methods', function() {
  $('body').append('<div id="table-container"></div>');
  var $tableContainer = $('#table-container');
  var $table;

  beforeEach(function() {
    $tableContainer.html(Fifty.modules.tableGenerator.generate());
    $table = $tableContainer.find('#pjax-table');
  });

  it('should have a default no data template', function() {
    var table = $table.pjaxTable({});
    // test that it exists and returns a string
    expect(typeof table._noDataTemplate === 'function').toBe(true);
    expect(typeof table._noDataTemplate() === 'string').toBe(true);

    // test that the template contains the elements we expect
    expect($(table._noDataTemplate()).prop('tagName')).toEqual('TR');
    expect($(table._noDataTemplate()).find('td').length).toEqual(1);

    // test that colspan gets set correctly
    expect($(table._noDataTemplate(1)).find('td').attr('colspan')).toEqual("1");
    expect($(table._noDataTemplate(15)).find('td').attr('colspan')).toEqual("15");
  });

  it('should create a sort query', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._createSortQuery === 'function').toBe(true);
    expect(typeof table._createSortQuery('test', 'test') === 'object').toBe(true);
    expect(table._createSortQuery('testProperty', 'testOrder')[table._sortQueryKey]).toEqual('testProperty__testOrder');
    expect(table._createSortQuery('123', '456')[table._sortQueryKey]).toEqual('123__456');
  });

  it('should desync sort from the query state', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._desyncSort === 'function').toBe(true);
    expect(table._desyncSort()).toBeUndefined();

    $.extend(table._queryState, table._createSortQuery('testProp', 'testOrder'));
    expect(table._queryState[table._sortQueryKey]).toEqual('testProp__testOrder');
    
    table._desyncSort();
    expect(table._queryState[table._sortQueryKey]).toBeUndefined();
  });

  it('should create a page query', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._createPageQuery === 'function').toBe(true);
    expect(table._createPageQuery()).toBeDefined();

    expect(table._createPageQuery(1)[table._pageQueryKey]).toEqual(1);
    expect(table._createPageQuery(10)[table._pageQueryKey]).toEqual(10);    
  });

  it('should create a perpage query', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._createPerPageQuery === 'function').toBe(true);
    expect(table._createPerPageQuery()).toBeDefined();

    expect(table._createPerPageQuery(10)[table._perPageQueryKey]).toEqual(10);
    expect(table._createPerPageQuery(500)[table._perPageQueryKey]).toEqual(500);    
  });

  it('should create a search query', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._createSearchQuery === 'function').toBe(true);
    expect(table._createSearchQuery()).toBeDefined();

    expect(table._createSearchQuery('test')[table._searchQueryKey]).toEqual('test');
    expect(table._createSearchQuery(100)[table._searchQueryKey]).toEqual(100);    
  });

  it('should desync search query', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._desyncSearch === 'function').toBe(true);
    expect(table._desyncSearch()).toBeUndefined();

    $.extend(table._queryState, table._createSearchQuery('test'));
    expect(table._queryState[table._searchQueryKey]).toEqual('test');
    
    table._desyncSearch();
    expect(table._queryState[table._searchQueryKey]).toBeUndefined();
  });

  it('should sync sort', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._syncSort === 'function').toBe(true);
    expect(table._syncSort()).toBeUndefined();
    
    spyOn(table, '_createSortQuery').and.callThrough();
    table._syncSort('testProp', 'testOrder');
    expect(table._createSortQuery).toHaveBeenCalledWith('testProp', 'testOrder');
    expect(table._queryState[table._sortQueryKey]).toEqual('testProp__testOrder');
  });

  it('should sync page', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._syncPage === 'function').toBe(true);
    expect(table._syncPage()).toBeUndefined();
    
    spyOn(table, '_createPageQuery').and.callThrough();
    table._syncPage(5);
    expect(table._createPageQuery).toHaveBeenCalledWith(5);
    expect(table._queryState[table._pageQueryKey]).toEqual(5);
  });

  it('should sync per page', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._syncPerPage === 'function').toBe(true);
    expect(table._syncPerPage()).toBeUndefined();

    spyOn(table, '_createPerPageQuery').and.callThrough();
    table._syncPerPage(20);
    expect(table._createPerPageQuery).toHaveBeenCalledWith(20);
    expect(table._queryState[table._perPageQueryKey]).toEqual(20);
  });

  it('should sync search', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._syncSearch === 'function').toBe(true);
    expect(table._syncSearch()).toBeUndefined();

    spyOn(table, '_createSearchQuery').and.callThrough();
    table._syncSearch('test');
    expect(table._createSearchQuery).toHaveBeenCalledWith('test');
    expect(table._queryState[table._searchQueryKey]).toEqual('test');
  });

  // for now only tests calls, no server mock
  it('should load via pjax by default', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._load === 'function').toBe(true);

    spyOn($, 'pjax');
    spyOn($, 'ajax');
    table._load();
    expect($.pjax).toHaveBeenCalled();
    expect($.ajax).not.toHaveBeenCalled();
  });

  // todo: spying on ajax without a server response will not work
  // it('should load via ajax with a flag', function() {
  //   var table = $table.pjaxTable({ ajaxOnly: true });
  //   expect(typeof table._load === 'function').toBe(true);
  // });
  
  // add with mock server
  // it('should handle ajax success', function() {});
  // it('should handle ajax error', function() {});
  // it('should handle pjaxStart', function() {});
  // it('should handle pjaxBeforReplace', function() {});
  // it('should handle pjaxTimeout', function() {});
  // it('should handle pjaxSuccess', function() {});
  // it('should handle pjaxError', function() {});

  it('should add a load mask', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._addLoadMask === 'function').toBe(true);
    
    expect(table._$el.css('position')).toEqual('static');
    expect(table._$el.find('.ui-load-mask').length).toEqual(0);

    spyOn($.fn, 'spin');
    table._addLoadMask();
    expect($.fn.spin).toHaveBeenCalled();
    expect(table._$el.css('position')).toEqual('relative');
    expect(table._$el.find('.ui-load-mask').length).toEqual(1);
  });

  it('should remove a load mask', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._removeLoadMask === 'function').toBe(true);
    
    table._addLoadMask();
    expect(table._$el.css('position')).toEqual('relative');
    expect(table._$el.find('.ui-load-mask').length).toEqual(1);
    table._removeLoadMask();
    expect(table._$el.css('position')).toEqual('static');
    expect(table._$el.find('.ui-load-mask').length).toEqual(0);
  });

  it('should sync query state based on data attributes', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._syncQueryState === 'function').toBe(true);

    // check the defaults created by table generator
    expect(Object.keys(table._queryState).length).toEqual(4);
    expect(table._queryState[table._sortQueryKey]).toEqual('testProp__desc');
    expect(table._queryState[table._searchQueryKey]).toEqual('testSearchStr');
    expect(table._queryState[table._pageQueryKey]).toEqual(1);
    expect(table._queryState[table._perPageQueryKey]).toEqual(50);

    // set some attributes and test changes via sync query state
    var $tableEl = table._$el.find('table');
    var $pagination = table._$el.find('.ui-pagination');
    $tableEl.data('current-sort-property', 'testingASortProperty');
    $tableEl.data('current-sort-order', 'asc');
    $tableEl.data('current-search-str', 'testingASearchStr');
    $pagination.data('current-page', 157);
    $pagination.data('current-perpage', 200);
    table._syncQueryState();

    // check changes
    expect(Object.keys(table._queryState).length).toEqual(4);
    expect(table._queryState[table._sortQueryKey]).toEqual('testingASortProperty__asc');
    expect(table._queryState[table._searchQueryKey]).toEqual('testingASearchStr');
    expect(table._queryState[table._pageQueryKey]).toEqual(157);
    expect(table._queryState[table._perPageQueryKey]).toEqual(200);
  
    // set attributes that can be desynced
    $tableEl.data('current-sort-property', null);
    $tableEl.data('current-search-str', null);
    table._syncQueryState();

    // test desync
    expect(table._queryState[table._sortQueryKey]).toBeUndefined();
    expect(table._queryState[table._searchQueryKey]).toBeUndefined();
  });
  
  // set tbody, totalRows, and trigger table:load
  it('should handle table loading', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._onTableLoaded === 'function').toBe(true);

    var spy = jasmine.createSpy();
    $table.on('table:load', spy);
    table._onTableLoaded();

    expect(table._$tbody).toBeDefined();
    expect(table._$tbody.length).toEqual(1);
    expect(table._totalRows).toEqual(50);
    expect(spy).toHaveBeenCalled();
  });

  it('should handle sortable clicks', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._onClickSortable === 'function').toBe(true);
    
    var spy = jasmine.createSpy();
    $table.on('table:sort', spy);
    spyOn(table, '_createSortQuery').and.callThrough();
    spyOn(table, '_syncSort').and.callThrough();
    spyOn(table, '_load').and.callThrough();

    table._$el.find('[data-sortable="true"]').first().click();
    expect(spy).toHaveBeenCalled();
    expect(table._createSortQuery).toHaveBeenCalled();
    expect(table._syncSort).toHaveBeenCalled();
    expect(table._load).toHaveBeenCalled();

    expect(table._queryState[table._sortQueryKey]).toEqual('Heroes__asc');
  });

  it('should handle perpage select', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._onPerPageSelect === 'function').toBe(true);
    
    var spy = jasmine.createSpy();
    $table.on('table:perpage', spy);
    spyOn(table, '_createPerPageQuery').and.callThrough();
    spyOn(table, '_syncPerPage').and.callThrough();
    spyOn(table, '_syncPage').and.callThrough();
    spyOn(table, '_load').and.callThrough();

    table._$el.find('.ui-perpage-dropdown > li').first().click();
    expect(spy).toHaveBeenCalled();
    expect(table._createPerPageQuery).toHaveBeenCalled();
    expect(table._syncPerPage).toHaveBeenCalled();
    expect(table._syncPage).toHaveBeenCalled();
    expect(table._load).toHaveBeenCalled();

    expect(table._queryState[table._perPageQueryKey]).toEqual(10);
    expect(table._queryState[table._pageQueryKey]).toEqual(1);
  });

  it('should handle page select', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._onPageSelect === 'function').toBe(true);

    var spy = jasmine.createSpy();
    $table.on('table:page', spy);
    spyOn(table, '_createPageQuery').and.callThrough();
    spyOn(table, '_syncPage').and.callThrough();
    spyOn(table, '_load').and.callThrough();

    table._$el.find('.ui-page-select-dropdown > li').first().click();
    expect(spy).toHaveBeenCalled();
    expect(table._createPageQuery).toHaveBeenCalled();
    expect(table._syncPage).toHaveBeenCalled();
    expect(table._load).toHaveBeenCalled();

    expect(table._queryState[table._pageQueryKey]).toEqual(1);
  });

  it('should handle prev page select', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._onPrevPageSelect === 'function').toBe(true);

    var spy = jasmine.createSpy();
    $table.on('table:prevpage', spy);
    spyOn(table, '_createPageQuery').and.callThrough();
    spyOn(table, '_syncPage').and.callThrough();
    spyOn(table, '_load').and.callThrough();

    table._$el.find('.ui-prev-page').click();
    expect(spy).toHaveBeenCalled();
    expect(table._createPageQuery).toHaveBeenCalled();
    expect(table._syncPage).toHaveBeenCalled();
    expect(table._load).toHaveBeenCalled();

    expect(table._queryState[table._pageQueryKey]).toEqual(0);
  });

  it('should handle next page select', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._onNextPageSelect === 'function').toBe(true);

    var spy = jasmine.createSpy();
    $table.on('table:nextpage', spy);
    spyOn(table, '_createPageQuery').and.callThrough();
    spyOn(table, '_syncPage').and.callThrough();
    spyOn(table, '_load').and.callThrough();

    // because the test case operates on 1 page, and next is disabled
    // force the call
    table._onNextPageSelect();

    expect(spy).toHaveBeenCalled();
    expect(table._createPageQuery).toHaveBeenCalled();
    expect(table._syncPage).toHaveBeenCalled();
    expect(table._load).toHaveBeenCalled();
    
    expect(table._queryState[table._pageQueryKey]).toEqual(2);
  });

  // NOTE: _enableRowCheckboxChangeHandling & _disableRowCheckboxChangeHandling
  // not tested separately
  // select all
  it('should handle header checkbox change for select all', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._onHeaderCheckboxChange === 'function').toBe(true);

    var selectAllSpy = jasmine.createSpy();
    $table.on('table:select:all', selectAllSpy);
    spyOn(table, '_disableRowCheckboxChangeHandling').and.callThrough();
    spyOn(table, '_enableRowCheckboxChangeHandling').and.callThrough();

    table._$el.find('th[data-select-all-enabled="true"] input[type="checkbox"]').prop('checked', true).change();
    expect(selectAllSpy).toHaveBeenCalled();
    expect(table._disableRowCheckboxChangeHandling).toHaveBeenCalled();
    expect(table._enableRowCheckboxChangeHandling).toHaveBeenCalled();

    // all checked
    expect(table._$el.find('th input[type="checkbox"]:checked').length).toEqual(1);
    expect(table._$el.find('td input[type="checkbox"]:checked').length).toEqual(50);
  });

  it('should handle header checkbox change for deselect all', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._onHeaderCheckboxChange === 'function').toBe(true);

    var deselectAllSpy = jasmine.createSpy();
    $table.on('table:deselect:all', deselectAllSpy);
    spyOn(table, '_disableRowCheckboxChangeHandling').and.callThrough();
    spyOn(table, '_enableRowCheckboxChangeHandling').and.callThrough();

    table._$el.find('th[data-select-all-enabled="true"] input[type="checkbox"]').prop('checked', false).change();
    expect(deselectAllSpy).toHaveBeenCalled();
    expect(table._disableRowCheckboxChangeHandling).toHaveBeenCalled();
    expect(table._enableRowCheckboxChangeHandling).toHaveBeenCalled();

    // all unchecked
    expect(table._$el.find('th input[type="checkbox"]:checked').length).toEqual(0);
    expect(table._$el.find('td input[type="checkbox"]:checked').length).toEqual(0);
  });
  
  // mocking event not working  
  // it('should handle id column clicks for shift clicking', function() {
  //   var table = $table.pjaxTable({});
  //   expect(typeof table._onClickIdColumn === 'function').toBe(true);

  //   expect(table._$el.find('tr').first().data('shiftKey')).toBeUndefined();
    
  //   var e = jQuery.Event('click');
  //   e.shiftKey = true;
  //   table._$el.find('tr').first().children().first().trigger(e);
    
  //   expect(table._$el.find('tr').first().data('shiftKey')).toBe(true);
  // });

  it('should handle body checkbox change for select', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._onRowCheckboxChange === 'function').toBe(true);

    var selectSpy = jasmine.createSpy();
    $table.on('table:select', selectSpy);

    table._$el.find('td[data-property="id"] input[type="checkbox"]').first().prop('checked', false).change();
    table._$el.find('td[data-property="id"] input[type="checkbox"]').first().prop('checked', true).change();

    expect(selectSpy).toHaveBeenCalled();
    expect(table._$el.find('td[data-property="id"] input[type="checkbox"]').first().closest('tr').hasClass('ui-selected')).toBe(true);
    expect(table._$el.data('last_selected')).toEqual(0);
  });

  it('should handle body checkbox change for deselect', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._onRowCheckboxChange === 'function').toBe(true);

    var deselectSpy = jasmine.createSpy();
    $table.on('table:deselect', deselectSpy);

    table._$el.find('td[data-property="id"] input[type="checkbox"]').first().prop('checked', true).change();
    table._$el.find('td[data-property="id"] input[type="checkbox"]').first().prop('checked', false).change();

    expect(deselectSpy).toHaveBeenCalled();
    expect(table._$el.find('tr').first().hasClass('ui-selected')).toBe(false);
    expect(table._$el.find('td[data-property="id"] input[type="checkbox"]').first().closest('tr').hasClass('ui-selected')).toBe(false);
    expect(table._$el.data('last_selected')).toEqual(0);
  });

  // since shiftKey was hard to test (see above) we'll explicitly execute the handler
  it('should handle shift selection of rows from first to last', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._shiftSelectRows === 'function').toBe(true);

    var spy = jasmine.createSpy();
    $table.on('table:shiftselect', spy);

    // test from 0 to last
    table._$tbody.find('tr').first().addClass('ui-selected').children().first().find('input').prop('checked', true);
    var $tr = table._$tbody.find('tr').last();
    table._shiftSelectRows($tr, 0);

    table._$tbody.find('tr').each(function(){
      expect($(this).hasClass('ui-selected')).toBe(true);
      expect($(this).children().first().find('input').prop('checked')).toBe(true);
    });

    expect(spy).toHaveBeenCalled();
  });

  it('should handle shift selection of rows from last to first', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._shiftSelectRows === 'function').toBe(true);

    var spy = jasmine.createSpy();
    $table.on('table:shiftselect', spy);

    // test from 0 to last
    table._$tbody.find('tr').last().addClass('ui-selected').children().first().find('input').prop('checked', true);
    var $tr = table._$tbody.find('tr').first();
    table._shiftSelectRows($tr, 49);

    table._$tbody.find('tr').each(function(){
      expect($(this).hasClass('ui-selected')).toBe(true);
      expect($(this).children().first().find('input').prop('checked')).toBe(true);
    });

    expect(spy).toHaveBeenCalled();
  });

  it('should handle shift deselection of rows from first to last', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._shiftSelectRows === 'function').toBe(true);

    var spy = jasmine.createSpy();
    $table.on('table:shiftselect', spy);

    // test from 0 to last
    // check all first
    table._$tbody.find('tr').each(function() {
      $(this).addClass('ui-selected').children().first().find('input').prop('checked', true);
    });
    // uncheck the first
    table._$tbody.find('tr').first().removeClass('ui-selected').children().first().find('input').prop('checked', false);
    var $tr = table._$tbody.find('tr').last();
    table._shiftSelectRows($tr, 0);

    table._$tbody.find('tr').each(function(){
      expect($(this).hasClass('ui-selected')).toBe(false);
      expect($(this).children().first().find('input').prop('checked')).toBe(false);
    });

    expect(spy).toHaveBeenCalled();
  });

  it('should handle shift deselection of rows from last to first', function() {
    var table = $table.pjaxTable({});
    expect(typeof table._shiftSelectRows === 'function').toBe(true);

    var spy = jasmine.createSpy();
    $table.on('table:shiftselect', spy);

    // test from 0 to last
    // check all first
    table._$tbody.find('tr').each(function() {
      $(this).addClass('ui-selected').children().first().find('input').prop('checked', true);
    });
    // uncheck the first
    table._$tbody.find('tr').last().removeClass('ui-selected').children().first().find('input').prop('checked', false);
    var $tr = table._$tbody.find('tr').first();
    table._shiftSelectRows($tr, 49);
    
    table._$tbody.find('tr').each(function(){
      expect($(this).hasClass('ui-selected')).toBe(false);
      expect($(this).children().first().find('input').prop('checked')).toBe(false);
    });

    expect(spy).toHaveBeenCalled();
  });
  
  it('should handle search submission', function() {

  });

  it('should handle search clearing', function() {

  });
});
