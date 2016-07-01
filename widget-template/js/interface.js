$('form').submit(function (event) {
  event.preventDefault();

  Fliplet.Widget.save({
    name: $('input').val()
  }).then(function () {
    Fliplet.Widget.complete();
  });
});