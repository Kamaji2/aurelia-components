import {
  inject,
  customElement,
  bindable,
  bindingMode,
} from "aurelia-framework";

require("./ka-control-table.sass");

@customElement("ka-control-table")
@inject(Element)
export class KaControlsTable {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value = null;

  _value = [];
  newValue = {};

  constructor(element) {
    this.element = element;
  }

  attached() {}

  schemaChanged(schema) {
    if (!Array.isArray(schema) || !schema.length) {
      console.error(
        "ka-control-table: schema must be an array of objects!",
        schema
      );
      return;
    }
  }

  valueChanged(value) {
    if (!value || value === JSON.stringify(this._value)) {
      return;
    }
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch (error) {
        console.error("ka-control-table: invalid value provided!", value);
        return;
      }
    }
    if (!Array.isArray(value)) {
      console.error("ka-control-table: value must be an array!", value);
      return;
    }
    this._value = value;
  }

  update() {
    this.value = JSON.stringify(this._value);
  }

  add(value) {
    this.newValue = {};
    this._value.push(value);
    this.update();
  }

  remove(value) {
    this._value = this._value.filter((v) => v !== value);
    this.update();
  }
}
