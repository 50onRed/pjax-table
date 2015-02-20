(function($, Fifty) {

  function Search() {
    var $el = $(this);
    var $searchFilter = $el.find('input[type="search"]');
    
    $el.find('.ui-search').click(function() {
      $el.trigger('submit.search', { query: $searchFilter.val() });
    });

    $el.find('.ui-close').click(clearSearch);

    $searchFilter.keydown(function (e) {
      if (e.which === 13) {          //enter / return
        e.preventDefault();
        $el.trigger('submit.search', { query: $(this).val() });
      } else if (e.which == 27) {    //escape
        e.preventDefault();
        clearSearch();
      }
    });

    function clearSearch() {
      $searchFilter.val('');
      $el.trigger('clear.search');
    }
  }
  Fifty.widget('fiftySearch', Search);
})(jQuery, window.Fifty = window.Fifty || {});

// auto-init search
$(function(){
  $('[data-fifty-search][data-auto-init]').each(function () {
    $(this).fiftySearch();
  });
});