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

Creata a release tag from master. Eg: v3.7.5    

---

# Docs

Navigate to the `docs` directory

```
cd docs
```

Install depencencies:

```
gem install bundler
bundle install
```

Run Jekyll locally:

```
bundle exec jekyll serve
```

Then the website should be up and running at http://127.0.0.1:4000/

## Update Algolia search index

The index gets updated automatically from CircleCI when you commit new code. However, if you wish to update it manually you can run this command from the `docs` folder:

```
ALGOLIA_API_KEY=<API_KEY> bundle exec jekyll algolia
```