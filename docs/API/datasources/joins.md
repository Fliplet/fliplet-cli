# Using "joins" on DataSources

Both DataSources JS APIs and REST APIs allow you to fetch data from more than one data source using a featured called "joins" and heavily inspired by traditional joins made in SQL databases.

Joins are defined by a name and options and any number of joins can be defined when fetching data:

```js
{
  join: {
    MyFirstJoin: { options },
    MySecondJoin: { options }
  }
}
```

Before we dive into complete examples, let's start with the three types of joins we support.

## Joins

### Left join

Use this when you want to fetch additional data for your dataSource. Examples include things like getting the list of comments and liks for a list of articles.

Left joins must be defined by specifying:

- the target dataSource ID with the `dataSourceId` parameter
- what data should be used to match entries from the initial dataSource to the joined dataSource, using the `on` parameter

Considering an example where two dataSources are created as follows:

| ID | Title                   |
|----|-------------------------|
| 1  | A great blog post       |
| 2  | Something worth reading |

| ArticleID | Comment text                    |
|-----------|---------------------------------|
| 1         | Thanks! This was worth reading. |
| 1         | Loved it, would read it again.  |

We can simply reference the entries between the two dataSources as follows:

```js
join: {
  Comments: {
    dataSourceId: 123,
    on: {
      'data.ID': 'data.ArticleID'
    }
  }
}
```

### Inner join

Use this when the entries of your dataSource should only be returned when there are matching entries from the join operations. Tweaking the above example, you might want to use this when you want to extract the articles and their comments and make sure only articles with at least one comment are returned.

Inner joins are defined like left joins but with the `required` attribute set to `true`:

```js
join: {
  Comments: {
    dataSourceId: 123,
    on: {
      'data.ID': 'data.ArticleID'
    },
    required: true
  }
}
```

### Outer join

Use this when you want to merge entries from the joined dataSource(s) to the ones being extracted from your dataSource. The result will simply be a concatenation of both arrays.

Outer joins are similar to other joins in regards to how they are defined, but don't need the `on` parameter defined since they don't need to reference entries between the two dataSources:

```js
join: {
  MyOtherArticles: {
    dataSourceId: 123
  }
}
```

---

## Types of data returned in joins

Joins can return data in several different ways:

- An `Array` of the matching entries. This is the default behaviour for joins.
- A `Boolean` to indicate whether at least one entry was matched.
- A `Count` of the matched entries.
- A `Sum` taken by counting a number in a defined column from the matching entries.

### Array

This is the default return behaviour for joins, hence no parameters are required.

Example input:

```js
join: {
  Comments: {
    dataSourceId: 123,
    on: {
      'data.ID': 'data.ArticleID'
    }
  }
}
```

Example of the returned data:

```js
[
  {
    id: 1,
    dataSourceId: 456,
    data: { Title: 'A great blog post' },
    join: {
      Comments: [
        {
          id: 3,
          dataSourceId: 123,
          data: { ArticleID: 1, 'Comment text': 'Thanks! This was worth reading.' }
        },
        {
          id: 4,
          dataSourceId: 123,
          data: { ArticleID: 1, 'Comment text': 'Loved it, would read it again.' }
        }
      ]
    }
  }
]
```

### Boolean

When the `has` parameter is set to `true`, a boolean will be returned to indicate whether at least one entry was matched from the joined entries.

Example input:

```js
join: {
  Comments: {
    dataSourceId: 123,
    on: {
      'data.ID': 'data.ArticleID'
    },
    has: true
  }
}
```

Example of the returned data:

```js
[
  {
    id: 1,
    dataSourceId: 456,
    data: { Title: 'A great blog post' },
    join: {
      HasComments: true
    }
  },
  {
    id: 2,
    dataSourceId: 456,
    data: { Title: 'Something worth reading' },
    join: {
      HasComments: false
    }
  }
]
```

---

## Using joins with the DataSources JS API

