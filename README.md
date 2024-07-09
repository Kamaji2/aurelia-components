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
### ka-control
```html
<ka-control name="resourceName:fieldName"></ka-control>
<ka-control name="fieldName"></ka-control>

<ka-control schema.bind="schemaObject.fieldName" value.bind="dataObject.fieldName"></ka-control>
```
## Attributes
## Services
## Interfaces
## Value converters
## CSS Variables
```css
--ac-ui-unit
--ac-ui-border-radius
--ac-ui-border-color
--ac-ui-border-color-rgb
--ac-ui-text-color
--ac-ui-text-color-rgb
--ac-ui-background-color
--ac-ui-background-color-rgb


--text-color
--text-color-rgb

--primary-color
--primary-color-rgb
--secondary-color
--secondary-color-rgb

--warning-color
--warning-color-rgb

--danger-color
--danger-color-rgb

--pending-color
--pending-color-rgb

--success-color
--success-color-rgb
```