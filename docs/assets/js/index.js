var search = docsearch({
  apiKey: 'a4035d83a34a095cfd2065ef78d753b0',
  indexName: 'fliplet_developers',
  inputSelector: '#search input',
  debug: false
});


// ---------------------------------------------

var $window = $(window);
var $html = $('html');
var $toc = $('#toc');
var $tocList = $toc.find('.list');
var $pageContent = $('#page-content');

function onScroll() {
  var scrollTop = $pageContent.scrollTop();
  $html.toggleClass('has-scrolled', scrollTop > 250);
}

$pageContent.scroll(onScroll);
onScroll();

$('.search-handle').click(function (event) {
  event.preventDefault();

  $pageContent.stop().animate({scrollTop:0}, 500, 'swing', function() {
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

if (location.pathname !== '/' && location.pathname !== '/API-Documentation.html') {
  $('.main-content h2, .main-content h3').each(function () {
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
