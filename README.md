# Fliplet CLI
Command line utility for creating and running components, themes and menus to be used on the Fliplet platform.

# Documentation

**Extensive documentation** is available at [developers.fliplet.com](http://developers.fliplet.com).

---

# Install

With [node.js](http://nodejs.org/) and [npm](http://github.com/isaacs/npm):

```
npm install fliplet-cli -g
```

You can now use the command `fliplet` from the command line. Just type `fliplet` to see the available options and their example usage.

---

Please refer to our [documentation](http://developers.fliplet.com) for all details about creating components, themes and menus on Fliplet via the `fliplet-cli`.

# Publish to npm

Run `npm publish` from your machine, given you are logged in on `npm` as a user with publishing permissions. You will be asked for a two-factor verification code for your account.

---

# Documentation

You can view Fliplet documentation at [http://developers.fliplet.com](http://developers.fliplet.com) or also get a copy of such website running locally on your machine. To do so, navigate to the `docs` directory, install the ruby dependencies described below and run the `Jekyll` server:

```
cd docs
```

Install depencencies:

```
gem install bundler
bundle install
```

You may need to install `sudo apt-get install ruby-dev` in order for the bundle install to succeed on some systems. This is due to the `nokogiri` gem requiring `ruby-dev` to be compiled.

Run Jekyll locally:

```
bundle exec jekyll serve
```

Then the website should be up and running at http://127.0.0.1:4000/

## Update Algolia search index

1. Set API_KEY in `docs/docsearch/.env`
2. Install [jq](https://github.com/stedolan/jq/wiki/Installation) on your machine
3. Clear the index on Algolia https://www.algolia.com/apps/8GRBFEV21Y
3. Run this from the `docs/docsearch` folder:

```
docker run -it --env-file=.env -e "CONFIG=$(cat config.json | jq -r tostring)" algolia/docsearch-scraper
```

## Update the Fliplet Approved libraries documentation page

Run the following command then commit the changed `./docs/Fliplet-approved-libraries.md` file:

```
npm run update-assets-docs
```
