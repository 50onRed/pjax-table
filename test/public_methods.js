describe('pjax table public methods', function() {
  $('body').append('<div id="table-container"></div>');
  var $tableContainer = $('#table-container');
  var $table;

  beforeEach(function() {
    $tableContainer.html(Fifty.modules.tableGenerator.generate());
    $table = $tableContainer.find('#pjax-table');
  });

  it('should refresh plugins', function() {
    var table = $table.pjaxTable({
      plugins: { 
        target: '.unknown',
        constructorName: 'unknown'
      }
    });
    expect(typeof table.refreshPlugins === 'function').toBe(true);
    
    spyOn(table, 'refreshPlugins').and.callThrough();
    spyOn(table, '_applyPlugins');

    $table.pjaxTable('refreshPlugins');
    expect(table.refreshPlugins).toHaveBeenCalled();
    expect(table._applyPlugins).toHaveBeenCalled();
  });

  it('should update parameters and load on update', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.update === 'function').toBe(true);

    spyOn(table, 'update').and.callThrough();
    spyOn(table, 'updateParameters').and.callThrough();
    spyOn(table, '_load');

    var sameRef = $table.pjaxTable('update', { testKey: 'testValue' });

    expect(sameRef === table).toBe(true);
    expect(table.updateParameters).toHaveBeenCalled();
    expect(table._load).toHaveBeenCalled();
    expect(table._queryState['testKey']).toEqual('testValue');
  });

  it('should load', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.load === 'function').toBe(true);

    spyOn(table, 'load').and.callThrough();
    spyOn(table, '_load');

    var testLoadParams = { testKey: 'testValue' };
    var sameRef = $table.pjaxTable('load', testLoadParams);
    
    expect(sameRef === table).toBe(true);
    expect(table.load).toHaveBeenCalledWith(testLoadParams);
    expect(table._load).toHaveBeenCalledWith(testLoadParams);
  });

  it('should refresh', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.refresh === 'function').toBe(true);

    spyOn(table, 'refresh').and.callThrough();
    spyOn(table, '_load');

    var sameRef = $table.pjaxTable('refresh');

    expect(sameRef === table).toBe(true);
    expect(table.refresh).toHaveBeenCalled();
    expect(table._load).toHaveBeenCalled();
  });

  it('should return the current url', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.getUrl === 'function').toBe(true);
    
    spyOn(table, 'getUrl').and.callThrough();

    expect($table.pjaxTable('getUrl')).toEqual('/');
    expect(table.getUrl).toHaveBeenCalled();
  });

  it('should support updating parameters', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.updateParameters === 'function').toBe(true);

    spyOn(table, 'updateParameters').and.callThrough();

    // test the add
    $table.pjaxTable('updateParameters', { first: 'testFirst', second: 'testSecond' });
    expect(table.updateParameters).toHaveBeenCalled();
    expect(table._queryState['first']).toEqual('testFirst');
    expect(table._queryState['second']).toEqual('testSecond');
      
    // test the delete
    $table.pjaxTable('updateParameters', { first: null, second: null });
    expect(table.updateParameters).toHaveBeenCalled();
    expect(table._queryState['first']).toBeUndefined();
    expect(table._queryState['second']).toBeUndefined();
  });

  it('should support removing parameters', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.removeParameters === 'function').toBe(true);

    spyOn(table, 'removeParameters').and.callThrough();

    // test empty return early
    $table.pjaxTable('updateParameters', { first: 'testFirst', second: 'testSecond'});
    
    // test return value and spy one time
    expect($table.pjaxTable('removeParameters') === table).toBe(true);
    expect(table.removeParameters).toHaveBeenCalled();
    expect(table._queryState['first']).toEqual('testFirst');
    expect(table._queryState['second']).toEqual('testSecond');

    // test string single key remove
    $table.pjaxTable('removeParameters', 'first');
    expect(table._queryState['first']).toBeUndefined();
    expect(table._queryState['second']).toEqual('testSecond');

    // test array remove
    $table.pjaxTable('updateParameters', { first: 'testFirst', second: 'testSecond'});
    $table.pjaxTable('removeParameters', ['first', 'second']);
    expect(table._queryState['first']).toBeUndefined();
    expect(table._queryState['second']).toBeUndefined();

    // test conditional with function remove
    $table.pjaxTable('updateParameters', { first: 'testFirst', second: 'testSecond'});
    $table.pjaxTable('removeParameters', function(key, val) {
      if (key === 'second') {
        return true;
      }
      return false;
    });
    expect(table._queryState['first']).toEqual('testFirst');
    expect(table._queryState['second']).toBeUndefined();
  });

  it('should support getting parameters', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.getParameters === 'function').toBe(true);

    spyOn(table, 'getParameters').and.callThrough();

    // all params copy
    var params = $table.pjaxTable('getParameters');
    expect(params).toBeDefined();
    expect(table.getParameters).toHaveBeenCalled();
    expect(params['page']).toEqual(1);
    expect(params['perpage']).toEqual(50);
    expect(params['order']).toEqual('testProp__desc');
    expect(params['q']).toEqual('testSearchStr');

    // filtered with function
    var filteredParams = $table.pjaxTable('getParameters', function(key, value) {
      if (key === 'page' || key === 'order') {
        return true;
      }
      return false;
    });
    expect(filteredParams['page']).toEqual(1);
    expect(filteredParams['perpage']).toBeUndefined();
    expect(filteredParams['order']).toEqual('testProp__desc');
    expect(filteredParams['q']).toBeUndefined();
  });

  it('should get the number of records', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.getNumRecords === 'function').toBe(true);
    
    spyOn(table, 'getNumRecords').and.callThrough();
    
    var numRecords = $table.pjaxTable('getNumRecords');
    expect(table.getNumRecords).toHaveBeenCalled();
    expect(numRecords).toBeDefined();
    expect(typeof numRecords === 'number').toBe(true);
    expect(numRecords).toEqual(50);
  });

  it('should get the number of columns', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.getNumColumns === 'function').toBe(true);

    spyOn(table, 'getNumColumns').and.callThrough();

    var numColumns = $table.pjaxTable('getNumColumns');
    expect(table.getNumColumns).toHaveBeenCalled();
    expect(numColumns).toBeDefined();
    expect(typeof numColumns === 'number').toBe(true);
    expect(numColumns).toEqual(6);
  });

  it('should get whether or not the table has selected rows', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.hasSelectedRecords === 'function').toBe(true);
    
    spyOn(table, 'hasSelectedRecords').and.callThrough();

    var hasSelected = $table.pjaxTable('hasSelectedRecords');
    expect(table.hasSelectedRecords).toHaveBeenCalled();
    expect(hasSelected).toBeDefined();
    expect(typeof hasSelected === 'boolean').toBe(true);
    expect(hasSelected).toBe(false);

    // now select and retest
    $table.find('td[data-property="id"] input[type="checkbox"]').prop('checked', true).change();
    var hasSelected = $table.pjaxTable('hasSelectedRecords');
    expect(hasSelected).toBe(true);
  });

  it('should get the number of selected rows', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.getNumSelectedRecords === 'function').toBe(true);
    
    spyOn(table, 'getNumSelectedRecords').and.callThrough();

    var numSelected = $table.pjaxTable('getNumSelectedRecords');
    expect(table.getNumSelectedRecords).toHaveBeenCalled();
    expect(numSelected).toBeDefined();
    expect(typeof numSelected === 'number').toBe(true);
    expect(numSelected).toEqual(0);

    // now select and retest
    $table.find('td[data-property="id"] input[type="checkbox"]').prop('checked', true).change();
    var numSelected = $table.pjaxTable('getNumSelectedRecords');
    expect(numSelected).toEqual(50);
  });

  it('should get the selected rows', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.getSelectedRecords === 'function').toBe(true);
    
    spyOn(table, 'getSelectedRecords').and.callThrough();

    var selectedRows = $table.pjaxTable('getSelectedRecords');
    expect(table.getSelectedRecords).toHaveBeenCalled();
    expect(selectedRows).toBeDefined();
    expect(Array.isArray(selectedRows)).toBe(true);
    expect(selectedRows.length).toEqual(0);

    // now select and retest
    $table.find('td[data-property="id"] input[type="checkbox"]').prop('checked', true).change();
    var selectedRows = $table.pjaxTable('getSelectedRecords');
    expect(selectedRows.length).toEqual(50);
    expect(selectedRows[0]['Heroes']).toEqual('Griffith Shaffer');
    expect(selectedRows[49]['Heroes']).toEqual('Mannix Walsh');

    // test with formatter
    var selectedNames = $table.pjaxTable('getSelectedRecords', function(record) {
      return record['Heroes'];
    });
    expect(selectedNames).toBeDefined();
    expect(Array.isArray(selectedNames)).toBe(true);
    expect(selectedNames.length).toEqual(50);
    expect(selectedNames[0]).toEqual('Griffith Shaffer');
    expect(selectedNames[49]).toEqual('Mannix Walsh');
  });

  it('should get the select row ids', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.getSelectedRecordIds === 'function').toBe(true);
    
    spyOn(table, 'getSelectedRecordIds').and.callThrough();

    var selectedIds = $table.pjaxTable('getSelectedRecordIds');
    expect(table.getSelectedRecordIds).toHaveBeenCalled();
    expect(selectedIds).toBeDefined();
    expect(Array.isArray(selectedIds)).toBe(true);
    expect(selectedIds.length).toEqual(0);

    // now select and retest
    $table.find('td[data-property="id"] input[type="checkbox"]').prop('checked', true).change();
    var selectedIds = $table.pjaxTable('getSelectedRecordIds');
    expect(selectedIds.length).toEqual(50);
    expect(selectedIds[0]).toEqual(0);
    expect(selectedIds[49]).toEqual(49);
  });

  it('should get all records', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.getRecords === 'function').toBe(true);
    
    spyOn(table, 'getRecords').and.callThrough();

    var records = $table.pjaxTable('getRecords');
    expect(table.getRecords).toHaveBeenCalled();
    expect(records).toBeDefined();
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toEqual(50);
    expect(records[0]['id']).toEqual(0);
    expect(records[0]['Heroes']).toEqual('Griffith Shaffer');
    expect(records[49]['id']).toEqual(49);
    expect(records[49]['Heroes']).toEqual('Mannix Walsh');
  });

  it('should update row fields by id', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.updateRow === 'function').toBe(true);

    spyOn(table, 'updateRow').and.callThrough();
    spyOn(table, '_findRowById').and.callThrough();
    spyOn(table, '_updateRowFields').and.callThrough();

    // only test internal calls, as all other processing has already been tested
    $table.pjaxTable('updateRow', 0, { Heroes: 'test' });
    expect(table.updateRow).toHaveBeenCalled();
    expect(table._findRowById).toHaveBeenCalled();
    expect(table._updateRowFields).toHaveBeenCalled();
    expect(table._getRecord(table._findRowById(0))['Heroes']).toEqual('test');
  });

  it('should get the total number of rows', function() {
    var table = $table.pjaxTable({});
    expect(typeof table.getNumTotalRows === 'function').toBe(true);

    spyOn(table, 'getNumTotalRows').and.callThrough();

    var numTotalRows = $table.pjaxTable('getNumTotalRows');
    expect(table.getNumTotalRows).toHaveBeenCalled();
    expect(numTotalRows).toBeDefined();
    expect(typeof numTotalRows === 'number').toBe(true);
    expect(numTotalRows).toEqual(50);
  });
});
