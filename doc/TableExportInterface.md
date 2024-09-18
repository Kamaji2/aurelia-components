# Kamaji Aurelia Components: TableExportInterface
The `TableExportInterface` class enables the download functionality for a `ka-table` component.

## Usage
```html
<!-- view.html -->
<ka-table height="full" with.bind="tableInterface">
  <ka-table-toolbar buttons="download">
    ...
  </ka-table-toolbar>
  ...
</ka-table>
```

```javascript
// view.js
this.tableExportInterface = new TableExportInterface({
  columns: [
    { name: "Title", value: "${title}" },
    { name: "Category", value: "${category|join:', ':'name'}" },
    { name: "Created At", value: "Created at ${date_created|datetimeFormat:'HH:ss'}" },
  ],
  limit: null,
  offset: null,
  table: this.tableInterface,
  valueConverters: this.aurelia.resources.valueConverters,
});
```

## Configuration options

|Option|Type|Description|
|:--|:--|:--|
|`table`|`TableInterface`|**[Required]** Reference to the `tableInterface`.|
|`columns`|`Object[]`|**[Required]** Columns declaration.|
|`url`|`string`|URL retrieving the data to be exported.|
|`limit`|`integer\|null`|Overrides the URL `limit` query parameter.<br>Use `limit: null` to remove the query parameter.|
|`offset`|`integer\|null`|Overrides the URL `offset` query parameter.<br>Use `offset: null` to remove the query parameter.|


### Configuration option: `columns`
The `columns` option contains an array of objects representing the exported columns.
|Property|Type|Description|
|:--|:--|:--|
|`name`|`string`|Column title (appearing in the first row).|
|`value`|`string`|Parsed expression.|
