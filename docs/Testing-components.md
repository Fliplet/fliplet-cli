# Testing components

If you have started you widget from our boilerplate you already have a sample test suite under the `tests` folder.
To test a component, use the CLI to run your tests:

```bash
$ fliplet test
```

If you want to see the browser output when running tests, run the command with the `--debug` option:

```bash
$ fliplet test --debug
```

## Tech-stack used for tests

- Test runner: [Mocha](https://mochajs.org/)
- Assertion library: [Chai](http://chaijs.com/)
- Headless browser: [Puppeteer](https://github.com/puppeteer/puppeteer/blob/v13.0.1/docs/api.md)


## Where should my tests go

You should include your tests under `tests` folder of your component.

## Core variables

- `browser` - The puppeteer browser instance
- `page` - The current page displayed in the browser (Puppeteer object)

## Core methods

- `browser.renderWidgetWithData(object)`: Renders the output of your widget after setting the widget instance data with an object
- `browser.renderWidget()`: Renders the output of your widget without making any change to the widget instance data
- `browser.renderInterfaceWithData(object)`: Renders the interface of your widget after setting the widget instance data with an object
- `browser.renderInterface()`: Renders the interface of your widget without making any change to the widget instance data

## Sample test

```js
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

```

---

## GitHub Actions workflow integration

The following sample file can be saved as `.github/workflows/test.yml` to automatically run tests when your component changes are pushed to GitHub.

Make sure to set the values for the following secrets in GitHub before running tests:

- `TESTS_ORGANIZATION_ID` (the Fliplet Organization ID of your user, e.g. 1)
- `TESTS_AUTH_TOKEN` (the Fliplet Auth token of your test user)

```yml
name: Fliplet E2E

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Install Node.js
      uses: actions/setup-node@v2
      with:
        node-version: 12.x
        cache: 'npm'
    - run: npm install fliplet-cli -g
    - run: fliplet env development
    - name: Set organization
      env:
        ORGANIZATION_ID: ${{ secrets.TESTS_ORGANIZATION_ID }}
      run: fliplet organization $ORGANIZATION_ID --force
    - name: Test
      env:
        AUTH_TOKEN: ${{ secrets.TESTS_AUTH_TOKEN }}
      run: AUTH_TOKEN=$AUTH_TOKEN fliplet test
```