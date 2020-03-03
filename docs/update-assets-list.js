const rp = require("request-promise");
const fs = require("fs");
const TurndownService = require("turndown");

const turndownService = new TurndownService();

const assetsToExclude = [
  "fliplet-runtime",
  "fliplet-core",
  "fliplet-pages",
  "fliplet-native",
  "fliplet-interact",
  "bootstrap",
  "reset-css",
  "normalize-css",
  "list-swipe",
  "pdfjs"
];

const preloadedAssets = [
  "moment",
  "lodash",
  "handlebars",
  "bootstrap-css",
  "font-awesome",
  "modernizr",
  "jquery",
  "animate-css"
];

function getAssets() {
  return rp({
    url: "https://api.fliplet.com/v1/widgets/assets"
  });
}

function loadAssets() {
  return getAssets().then(function(results) {
    results = JSON.parse(results);

    const assets = results.assets || {};

    const preloadedHtml = ["<ul>"];
    const assetsHtml = ["<ul>"];

    Object.keys(assets)
      .sort()
      .forEach(function(name) {
        if (assetsToExclude.indexOf(name) > -1) {
          return;
        }

        var asset = assets[name];
        var liHtml = [
          "<li>",
          "<strong>" + name + "</strong>",
          " <code>" + asset.latestVersion + "</code>",
          asset.description ? " " + asset.description : "",
          asset.reference
            ? ' (<a href="' +
              asset.reference +
              '" target="_blank">Documentation</a>)'
            : "",
          "</li>"
        ].join("");

        if (preloadedAssets.indexOf(name) > -1) {
          preloadedHtml.push(liHtml);
          return;
        }

        assetsHtml.push(liHtml);
      });

    preloadedHtml.push("</ul>");
    assetsHtml.push("</ul>");

    const html = [
      "<h1>Fliplet approved libraries</h1>",
      "<p>The following libraries can be found in all apps:</p>",
      preloadedHtml.join(""),
      "<h2>Other approved libraries you can add to your apps</h2>",
      "<p>Optionally add any of the libraries to your app for additional functionality:</p>",
      assetsHtml.join("")
    ].join("");

    var markdown = turndownService.turndown(html);

    fs.writeFileSync("./docs/Fliplet-approved-libraries.md", markdown, "utf8");

    console.log("Documentation for approved libraries have been updated");
  });
}

loadAssets();
