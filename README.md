# Aurelia Components
A set of UI components for Kamaji based ERP applications build with Aurelia JS

## Elements
### ka-button
Basic usage:
```html
<ka-button click.trigger="save($event)">Save</ka-button>
```
```js
save($event) {
  $event.toggle(); // Set button as "busy"
  setTimeout(() => { $event.toggle(); }, 1000);
}
```
Button with icon + button with icon and text
```html
<ka-button icon="fa-solid fa-check"></ka-button>
<ka-button icon="fa-solid fa-check">Save</ka-button>
```
## Attributes
## Services
## Interfaces
- [TableInterface](./doc/TableInterface.md)
- [TableExportInterface](./doc/TableExportInterface.md)
- [TableSearchInterface](./doc/TableSearchInterface.md)
## Value converters
<ka-control name="resourceName:fieldName"></ka-control>
<ka-control name="fieldName"></ka-control>

<ka-control schema.bind="schemaObject.fieldName" value.bind="dataObject.fieldName"></ka-control>
