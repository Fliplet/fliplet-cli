$('form').submit(function (event) {
  event.preventDefault();

  Fliplet.saveWidgetData({
    name: $('input').val()
  }).then(function () {
    Fliplet.complete();
  });
});