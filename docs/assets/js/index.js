var search = instantsearch({
  appId: '8GRBFEV21Y',
  apiKey: '4c075de739ed6724ede1f923f3d42abf',
  indexName: 'docs',
  urlSync: false,
  searchFunction: function (helper) {
    if (helper.state.query === '') {
      return;
    }

    helper.search();
  }
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search',
    reset: false,
    placeholder: 'Type to search'
  })
);

search.templatesConfig.helpers.headingTitle = function(text, render) {
  var tmp = render(text).split(',');
  return render(tmp[tmp.length-1]);
};

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: [
        '<a href="{{{url}}}#{{{anchor}}}"><span><strong>{{{_highlightResult.title.value}}}</strong> ({{{anchor}}})</span><hr /><h4>{{#helpers.headingTitle}}{{headings}}{{/helpers.headingTitle}}</h4>',
        '<p>{{{_highlightResult.content.value}}}</p></a>'
      ].join(''),
      empty: 'We didn\'t find any result under our documentation for your query.'
    }
  })
);

search.start();

// ---------------------------------------------

var $window = $(window);
var $html = $('html');
var $toc = $('#toc');
var $tocList = $toc.find('.list');

function onScroll() {
  var scrollTop = $window.scrollTop();
  $html.toggleClass('has-scrolled', scrollTop > 250);
}

$window.scroll(onScroll);
onScroll();

$('.search-handle').click(function (event) {
  event.preventDefault();

  $("html, body").stop().animate({scrollTop:0}, 500, 'swing', function() {
    $('.ais-search-box--input').focus().addClass('in-focus');
    $('.ais-search-box').addClass('animated shake');
  });
});

$('body').on('blur', '.ais-search-box--input', function () {
  $(this).removeClass('in-focus');
});

if (window.isBetaFeature) {
  $('body').addClass('is-beta');
}

function checkIfSidebarFits() {
  $html.toggleClass('with-sidebar', $window.width() > 900);
}

$window.resize(checkIfSidebarFits);
checkIfSidebarFits();

if (location.pathname !== '/') {
  $('.main-content h2, .main-content h3, .main-content h4').each(function () {
    $title = $(this);
    var node = $title[0].tagName;
    var prefix = node === 'H4' ? '- ' : '';
    var text = $title.text();

    var $el = $('<a href="#" data-to-id="' + $title[0].id + '" class="title-' + node + '">' + prefix + text + '</a>');
    $tocList.append($el);

    $el.click(function (e) {
      e.preventDefault();

      var targetId = $(this).attr('data-to-id');

      history.pushState(null, text, location.pathname + '#' + targetId);

      var scrollOffset = $('#' + targetId)[0].offsetTop - $("#page-content")[0].offsetTop

      $("#page-content").animate({
        scrollTop: scrollOffset - 50
        }, 500);
    });
  });
}