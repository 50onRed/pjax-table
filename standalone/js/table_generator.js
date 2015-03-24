(function(Fifty, data) {
  var templates = Fifty.templates;
  var body_cell = templates.body_cell;
  var body_checkbox_cell = templates.body_checkbox_cell;
  var body_row = templates.body_row;
  var header_cell = templates.header_cell;
  var header_checkbox_cell = templates.header_checkbox_cell;
  var header_row = templates.header_row;
  var pagination = templates.pagination;
  var pagination_page_item = templates.pagination_page_item;
  var table = templates.table;

  var num_rows = 50;
  
  Handlebars.registerHelper('sortIcon', function(sort_direction) {
    if (sort_direction === 'asc') {
      return 'up';
    }
    return 'down';
  });

  function generateData() {
      var table_data = {
        header: [],
        body: []
      };
      var cols = Object.keys(data[0]);
      
      for (var i = 0; i < cols.length; i++) {
        table_data.header.push({
          name: cols[i],
          property: cols[i],
          current_sort: 'desc'
        });
      }
    
      for (var x = 0; x < num_rows; x++) {
        table_data.body[x] = [];
        for (var y = 0; y < cols.length; y++) {
          table_data.body[x].push({
            property: cols[y],
            display_value: data[x][cols[y]],
            value: data[x][cols[y]]
          });
        }
      }
      return table_data;
  }

  function generate() {
    var table_data = generateData();
    
    var header_row_html = header_row({ 
      cells: [header_checkbox_cell()].concat($.map(table_data.header, function(cell_data, index) { 
        return header_cell(cell_data); 
      })).join('')
    });

    var body_row_html = $.map(table_data.body, function(row_data, index) {
      return body_row({
        cells: [body_checkbox_cell({ value: index })].concat($.map(row_data, function(cell_data, index) {
          return body_cell(cell_data);
        })).join('')
      });
    }).join('');
    
    var pagination_html = pagination({
      current_page: 1,
      current_perpage: table_data.body.length,
      from: 1,
      to: table_data.body.length,
      total: table_data.body.length,
      on_last_page: true,
      page_items: pagination_page_item({ index: 1, active: true })
    });

    var table_html = table({
      header_rows: header_row_html,
      body_rows: body_row_html,
      footer_rows: '',
      pagination: pagination_html,
      total_rows: table_data.body.length,
      sort_property: 'testProp',
      sort_order: 'desc',
      current_search_str: 'testSearchStr'
    });
    return table_html;
  }

  Fifty.modules = Fifty.modules || {};
  Fifty.modules.tableGenerator = {
    generate: generate
  };
})(Fifty = Fifty || {}, data);
