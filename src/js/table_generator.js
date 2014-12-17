(function(Fifty, data) {
  var templates = Fifty.templates;
  var body_cell = templates.body_cell;
  var body_row = templates.body_row;
  var header_cell = templates.header_cell;
  var header_row = templates.header_row;
  var pagination = templates.pagination;
  var pagination_page_item = templates.pagination_page_item;
  var table = templates.table;

  var num_rows = 50;
  
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
      cells: $.map(table_data.header, function(cell_data, index) { 
        return header_cell(cell_data); 
      }).join('')
    });

    var body_row_html = $.map(table_data.body, function(row_data, index) {
      return body_row({
        cells: $.map(row_data, function(cell_data, index) {
          return body_cell(cell_data);
        }).join('')
      });
    }).join('');
    
    var table_html = table({
      header_rows: header_row_html,
      body_rows: body_row_html,
      footer_rows: '',
      pagination: '',
      total_rows: table_data.body.length
    });
    return table_html;
  }

  Fifty.modules = Fifty.modules || {};
  Fifty.modules.tableGenerator = {
    generate: generate
  };
})(Fifty = Fifty || {}, data);
