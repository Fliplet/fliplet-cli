var search = instantsearch({
  appId: '8GRBFEV21Y',
  apiKey: '4c075de739ed6724ede1f923f3d42abf',
  indexName: 'docs',
  urlSync: false,
  searchFunction: function (helper) {
    if (helper.state.query === '') {
      return;
    }

    helper.search();
  }
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search',
    reset: false,
    placeholder: 'Type to search'
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: [
        '<a href="{{{url}}}#{{{anchor}}}"><h4>{{{_highlightResult.title.value}}}</h4>',
        '<p>{{{_highlightResult.content.value}}}</p><hr /><span>{{{headings}}} <strong>({{{anchor}}})</strong></span></a>'
      ].join(''),
      empty: 'We didn\'t find any result under our documentation for your query.'
    }
  })
);

search.start();