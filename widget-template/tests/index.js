describe('WHEN start component', function() {
  this.timeout(10000);
  describe('Interface', function() {
    it('should have empty username', function(done) {
      interfaceBrowser
        .evaluate(function (selector) {
          return document.querySelector(selector).value;
        }, '#username')
        .then(function(username) {
          expect(username).to.equal('');
          done();
        })
    });
  });

  describe('Build', function() {
    it('should have message to configure widget', function(done) {
      const selector = `${buildSelector} h3`;
      buildBrowser
        .evaluate(function (selector) {
          return document.querySelector(selector).textContent;
        }, selector)
        .then(function(message) {
          expect(message).to.equal('This is the output of your widget');
          done();
        });
    });
  });
});

describe('WHEN changing the username', function () {
  this.timeout(10000);
  const username = casual.username;

  before(function (done) {
    interfaceBrowser
      .type('#username')
      .type('#username', username)
      .save() // Use this method to save your widget instance
      .then(done)
  });

  describe('Interface', function() {
    it('should have new username on the input', function(done) {
      interfaceBrowser
        .evaluate(function (selector) {
          return document.querySelector(selector).value;
        }, '#username')
        .then(function(inputUsername) {
          expect(inputUsername).to.equal(username);
          done();
        })
    });
  });

  describe('Build', function() {
    it('should have message with name', function(done) {
      const selector = `${buildSelector} h2`;
      buildBrowser
        .evaluate(function (selector) {
          return document.querySelector(selector).textContent;
        }, selector)
        .then(function(message) {
          expect(message).to.equal(`Hi ${username}!`);
          done();
        });
    });
  });
});
