# Using joins on DataSources

<p class="warning"><strong>BETA FEATURE:</strong> Please note that this feature is currently only available in beta and its specifications may be subject to change before releasing it.</p>

Both DataSources **JS APIs** and **REST APIs** allow you to **fetch data from more than one dataSource** using a featured called **"join"**, heavily inspired by traditional joins made in **SQL databases**.

Joins are defined by a unique name and their configuration options; any number of joins can be defined when fetching data from one data source:

```js
Fliplet.DataSources.connect(123).then(function () {
  // 1. Extract articles from dataSource 123
  connection.find({
    join: {
      // ... with their comments
      Comments: { options },

      // ... and users who posted them
      Users: { options }
    }
  })
})
```

Before we dive into complete examples, let's start with the three types of joins we support.

## Types of joins

### Left join (default)

Use this when you want to fetch additional data for your dataSource. Examples include things like getting the list of comments and liks for a list of articles.

Left joins must be defined by specifying:

- the **target dataSource ID** with the `dataSourceId` parameter
- what data should be used to **reference entries** from the initial dataSource to the joined dataSource, using the `on` parameter, where the `key` is the column name from the source table and the `value` is the column name of the target (joined) table.

Consider **an example** where two dataSources are created as follows:

#### Articles

| ID | Title                   |
|----|-------------------------|
| 1  | A great blog post       |
| 2  | Something worth reading |

#### Comments

| ArticleID | Comment text                    | Likes |
|-----------|---------------------------------|-------|
| 1         | Thanks! This was worth reading. | 5     |
| 1         | Loved it, would read it again.  | 2     |

We can simply reference the entries between the two dataSources as follows:

```js
connection.find({
  join: {
    Comments: {
      dataSourceId: 123,
      on: {
        'data.ID': 'data.ArticleID'
      }
    }
  }
})
```

### Inner join

Use this when the entries of your dataSource should only be returned when there are matching entries from the join operations. Tweaking the above example, you might want to use this when you want to extract the articles and their comments and make sure only articles with at least one comment are returned.

Inner joins are defined like left joins but with the `required` attribute set to `true`:

```js
connection.find({
  join: {
    Comments: {
      dataSourceId: 123,
      on: {
        'data.ID': 'data.ArticleID'
      },
      required: true
    }
  }
})
```

### Outer join

Use this when you want to **merge entries from the joined dataSource(s)** to the ones being extracted from your dataSource. The result will simply be **a concatenation** of both arrays.

Outer joins are similar to other joins in regards to how they are defined, but don't need the `on` parameter defined since they don't need to reference entries between the two dataSources:

```js
connection.find({
  join: {
    MyOtherArticles: {
      dataSourceId: 789
    }
  }
})
```

---

## Types of data returned in joins

Joins can return data in several different ways:

- An `Array` of the matching entries. This is the default behaviour for joins.
- A `Boolean` to indicate whether at least one entry was matched.
- A `Count` of the matched entries.
- A `Sum` taken by counting a number in a defined column from the matching entries.

### Array (join)

This is the default return behaviour for joins, hence no parameters are required.

Example input:

```js
connection.find({
  join: {
    Comments: {
      dataSourceId: 123,
      on: {
        'data.ID': 'data.ArticleID'
      }
    }
  }
})
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
          data: { ArticleID: 1, 'Comment text': 'Thanks! This was worth reading.', Likes: 5 }
        },
        {
          id: 4,
          dataSourceId: 123,
          data: { ArticleID: 1, 'Comment text': 'Loved it, would read it again.', Likes: 2 }
        }
      ]
    }
  }
]
```

### Boolean (join)

When the `has` parameter is set to `true`, a boolean will be returned to indicate whether at least one entry was matched from the joined entries.

Example input:

```js
connection.find({
  join: {
    HasComments: {
      dataSourceId: 123,
      on: {
        'data.ID': 'data.ArticleID'
      },
      has: true
    }
  }
})
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

### Count (join)

When the `count` parameter is set to `true`, a count of the matching entries will be returned.

Example input:

```js
connection.find({
  join: {
    NumberOfComments: {
      dataSourceId: 123,
      on: {
        'data.ID': 'data.ArticleID'
      },
      count: true
    }
  }
})
```

Example of the returned data:

```js
[
  {
    id: 1,
    dataSourceId: 456,
    data: { Title: 'A great blog post' },
    join: {
      NumberOfComments: 2
    }
  },
  {
    id: 2,
    dataSourceId: 456,
    data: { Title: 'Something worth reading' },
    join: {
      NumberOfComments: 0
    }
  }
]
```

### Sum (join)

When the `sum` parameter is set to the name of a column, a sum taken by counting the number of all matching entries for such column will be returned.

Example input:

```js
connection.find({
  join: {
    LikesForComments: {
      dataSourceId: 123,
      on: {
        'data.ID': 'data.ArticleID'
      },
      sum: 'Likes'
    }
  }
})
```

Example of the returned data:

```js
[
  {
    id: 1,
    dataSourceId: 456,
    data: { Title: 'A great blog post' },
    join: {
      LikesForComments: 7
    }
  },
  {
    id: 2,
    dataSourceId: 456,
    data: { Title: 'Something worth reading' },
    join: {
      LikesForComments: 0
    }
  }
]
```

---

## Filtering data

Use the `where` parameter to define a filtering query for the data to be selected on a particular join. This support the same exact syntax as `connection.find({ where })`:

```js
connection.find({
  join: {
    LikesForPopularComments: {
      dataSourceId: 123,
      on: {
        'data.ID': 'data.ArticleID'
      },
      where: {
        // only fetch a comment when it has more than 10 likes
        Likes: { $gt: 10 }
      }
    }
  }
})
```

## Only fetch a list of attributes

Use the `attributes` parameter to define which fields should only be returned from the data in the joined entries:

```js
connection.find({
  join: {
    LikesForComments: {
      dataSourceId: 123,
      on: {
        'data.ID': 'data.ArticleID'
      },
      // only fetch the comment text
      attributes: ['Comment text']
    }
  }
})
```

## Limit the number of returned entries

Use the `limit` parameter to define how many entries should be returned at most for your join:

```js
connection.find({
  join: {
    LikesForComments: {
      dataSourceId: 123,
      on: {
        'data.ID': 'data.ArticleID'
      },
      // only fetch up to 5 comments at most
      limit: 5
    }
  }
})
```

## Order the entries returned

Use the `order` parameter to define the order at which entries are returned for your join.

<p class="warning"><strong>Note:</strong> this parameter can be used for attributes such as <strong>"id"</strong> and <strong>"createdAt"</strong>. If you need to order by actual data in your entry, use the <strong>"data."</strong> prefix (such as <code>data.Title</code>).</p>

```js
connection.find({
  join: {
    MostRecentComments: {
      dataSourceId: 123,
      on: {
        'data.ID': 'data.ArticleID'
      },
      // only fetch the 5 most recent comments, combining order and limit
      order: ['createdAt', 'DESC'],
      limit: 5
    }
  }
})
```

---

[Back to DataSources general documentation](../fliplet-datasources.md)
{: .buttons}