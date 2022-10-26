// Search input integration with Algolia
window.algoliaSearch = docsearch({
  appId: '3DVJTNQB8B',
  apiKey: 'f0f618c3db82c700a023702ebeb0a132',
  indexName: 'Fliplet Developers',
  inputSelector: '.search-input input',
  debug: true,
  algoliaOptions: {
    analytics: !localStorage.getItem('disableAnalytics'),
    hitsPerPage: 50
  }
});

$('input.ds-input').on('keyup', function(e) {
  var value = $(this).val();

  $(this).closest('.search-input').toggleClass('is-searching', !!value);
});

$('[data-clear-search]').click(function(e) {
  e.preventDefault();
  algoliaSearch.input.autocomplete.setVal('');
  algoliaSearch.input.autocomplete.close('');
  $('.search-input').removeClass('is-searching');
  // $('input.ds-input').focus();
});

// ---------------------------------------------

var $window = $(window);
var $html = $('html');
var $toc = $('#toc');
var $tocList = $toc.find('.list');
var lastScrollPos;

/**
 * Automatically shows and hide the scrollbar when the user scrolls up and down
 */
function onScroll() {
  var scrollTop = $(this).scrollTop();

  if (scrollTop < lastScrollPos) {
    $html.removeClass('has-scrolled');
  } else {
    $html.toggleClass('has-scrolled', scrollTop > 250);
  }

  lastScrollPos = scrollTop;
}

// Hide scrollbar on scroll down
$(window).on('scroll', onScroll);
onScroll();

// Accordion logic
$('body').on('click', 'a.toggle', function(event) {
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

// Tweaks for algolia search
$('body').on('blur', '.ais-search-box--input', function() {
  $(this).removeClass('in-focus');
});

if (window.isBetaFeature) {
  $('body').addClass('is-beta');
}

// Logic for internal pages
if (location.pathname !== '/') {
  function checkIfSidebarFits() {
    $html.toggleClass('with-sidebar', $window.width() > 900);
  }

  $window.resize(checkIfSidebarFits);
  checkIfSidebarFits();

  var added;

  // Generate Table of Contents
  $('.main-content h2, .main-content h3').each(function() {
    added = true;

    $title = $(this);

    var node = $title[0].tagName;
    var prefix = node === 'H4' ? '- ' : '';
    var text = $title.text();

    var $el = $('<a href="#" data-to-id="' + $title[0].id + '" class="title-' + node + '">' + prefix + text + '</a>');

    $tocList.append($el);

    $el.click(function(e) {
      e.preventDefault();

      var targetId = $(this).attr('data-to-id');

      history.pushState(null, text, location.pathname + '#' + targetId);

      var scrollOffset = $('#' + targetId)[0].offsetTop - $('#page-content')[0].offsetTop;

      $('body, html').animate({
        scrollTop: scrollOffset - 30
      }, 500);

      var $target = $('#' + targetId);

      $target.css('background-color', '#fdff6b').addClass('animated shake');

      setTimeout(function() {
        $target.css('background-color', 'transparent');
      }, 5000);
    });
  });

  if (!added) {
    $('#toc').html('');
  }
} else {
  // Homepage logic
  $html.removeClass('with-sidebar');
  $html.addClass('with-hero');

  $('.home-highlight').css('display', 'block');
  $('.project-name').remove();

  new Typed('.hero h6', {
    strings: [
      'Make apps work for you',
      'Develop. Preview. Publish.',
      'Build amazing apps.',
      'Create incredible components.',
      'Securely integrate with your data.',
      'Customize apps within seconds.',
      'Launch apps effortlessly.',
      'Code using popular frameworks.'
    ],
    typeSpeed: 60,
    backSpeed: 30,
    loop: true
  });

  if ($(window).width() > 1200) {
    $('.search-input input').focus();
  }
}

// Mark links as active
var $a = $('#page a[href="' + location.pathname + '"]:eq(0)');

if ($a.length) {
  $a.addClass('current');
  $a.closest('li').parent().closest('li').find('.toggle').click();
}

// Pages with left-hand-side navigation
// @TODO: refactor to better format usig variables set from pages
if (location.pathname.indexOf('/API/helpers/') === 0) {
  $('[data-section="helpers"]').css('display', 'block');
} else if (location.pathname.indexOf('/API/core/') === 0) {
  $('[data-section="core"]').css('display', 'block');
}

// Menu on mobile
$('.menu-handle').click(function(e) {
  e.preventDefault();
  $('html').toggleClass('with-mobile-menu');
});
