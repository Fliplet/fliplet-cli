var search = docsearch({
  appId: '8GRBFEV21Y',
  apiKey: '4c075de739ed6724ede1f923f3d42abf',
  indexName: 'Fliplet Developers',
  inputSelector: '.search-input input',
  debug: false,
  algoliaOptions: {
    hitsPerPage: 12
  }
});


// ---------------------------------------------

var $window = $(window);
var $html = $('html');
var $toc = $('#toc');
var $tocList = $toc.find('.list');
var lastScrollPos;

function onScroll() {
  var scrollTop = $(this).scrollTop();

  if (scrollTop < lastScrollPos) {
    $html.removeClass('has-scrolled');
  } else {
    $html.toggleClass('has-scrolled', scrollTop > 250);
  }

  lastScrollPos = scrollTop;
}

$(window).on('scroll', onScroll);
onScroll();

$('body').on('click', 'a.toggle', function (event) {
  event.preventDefault();
  var $li = $(this).parent();
  var isOpen = $li.hasClass('active');

  if (isOpen) {
    $li.removeClass('active');
    $(this).find('.fa-caret-down').addClass('fa-caret-right').removeClass('fa-caret-down');
  } else {
    $li.addClass('active');
    $(this).find('.fa-caret-right').addClass('fa-caret-down').removeClass('fa-caret-right');
  }
});

$('body').on('blur', '.ais-search-box--input', function () {
  $(this).removeClass('in-focus');
});

if (window.isBetaFeature) {
  $('body').addClass('is-beta');
}

if (location.pathname !== '/') {
  function checkIfSidebarFits() {
    $html.toggleClass('with-sidebar', $window.width() > 900);
  }

  $window.resize(checkIfSidebarFits);
  checkIfSidebarFits();

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

      var scrollOffset = $('#' + targetId)[0].offsetTop - $("#page-content")[0].offsetTop;

      $("body, html").animate({
        scrollTop: scrollOffset - 30
        }, 500);

      var $target = $('#' + targetId);

      $target.css('background-color', '#fdff6b').addClass('animated shake');

      setTimeout(function () {
        $target.css('background-color', 'transparent');
      }, 5000);
    });
  });
} else {
  $html.removeClass('with-sidebar');
  $html.addClass('with-hero');

  $('.project-name').remove();

  new Typed('.hero h6', {
    strings: [
      'Build amazing apps.',
      'Create incredible components.',
      'Securely integrate with your data.',
      'Customise apps within seconds.',
      'Launch apps effortlessly.',
      'Code using popular frameworks.'
    ],
    typeSpeed: 60,
    backSpeed: 30,
    loop: true
  });
}

var $a = $('a[href="' + location.pathname + '"]:eq(0)');

if ($a.length) {
  $a.addClass('current');
  $a.closest('li').parent().closest('li').find('.toggle').click();
}