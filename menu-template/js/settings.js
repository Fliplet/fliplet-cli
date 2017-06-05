Fliplet().then(function () {
  $(window).on('resize', Fliplet.Widget.autosize);

  $('form').submit(function (event) {
    event.preventDefault();

    Fliplet.Widget.save({
      foo: 'bar'
    }).then(function () {
      Fliplet.Widget.complete();
    });
  });

  // Fired from Fliplet Studio when the external save button is clicked
  Fliplet.Widget.onSaveRequest(function () {
    $('form').submit();
  });
});
