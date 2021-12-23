describe('WHEN a button is rendered', function() {
  describe('GIVEN no label and action have been selected', function() {
    before(async function() {
      await browser.renderWidget();
    });

    it('THEN it should have default button label', async function() {
      const label = await page.$eval('.btn-primary', input => input.getAttribute('value'));

      expect(label).to.equal('Primary button');
    });
  });

  describe('GIVEN a label has been set', function() {
    const sampleLabel = casual.name;

    before(async function() {
      await browser.renderWidgetWithData({ label: sampleLabel });
    });

    it('THEN the label value should be rendered as button text', async function() {
      const label = await page.$eval('.btn-primary', input => input.getAttribute('value'));

      expect(label).to.equal(sampleLabel);
    });
  });
});