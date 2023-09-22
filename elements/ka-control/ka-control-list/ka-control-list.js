import { inject, customElement, bindable, bindingMode } from 'aurelia-framework';

require('./ka-control-list.sass');

@customElement('ka-control-list')
@inject(Element)
export class KaControlsList {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value = null;

  _value = [];
  newValue = {};

  constructor(element) {
    this.element = element;
  }

  attached() {
    if (!this.value) new Array(parseInt(this.schema?.min || 1, 10)).fill(0).forEach(() => {
      this.add();
    });
  }

  schemaChanged(schema) {
    if (!schema.datasource) {
      console.error('ka-control-list: missing datasource in schema!', schema);
      return;
    }
    if (typeof schema.datasource === 'string') {
      try {
        schema.datasource = JSON.parse(schema.datasource);
      } catch (error) {
        console.error('ka-control-list: invalid datasource provided in schema!', schema);
        return;
      }
    }
    if (!schema.datasource.model) {
      console.error('ka-control-list: model missing from datasource!', schema.datasource);
      return;
    }
    if (!schema.datasource.model.schema) {
      console.error('ka-control-list: schema missing from datasource model!', schema.datasource.model);
      return;
    }
    if (!Array.isArray(schema.datasource.model.schema) || !schema.datasource.model.schema.length) {
      console.error('ka-control-list: datasource model schema must be an array of objects!', schema.datasource.model);
      return;
    }
  }

  keydown() {
    return !this.schema.readonly;
  }
  keyup(event) {
    if (event.key === 'Enter') this.element.dispatchEvent(new Event('enter', { bubbles: true }));
  }
  focus() {
    this.element.dispatchEvent(new Event('focus', { bubbles: true }));
  }
  blur() {
    this.element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  change() {
    if (!this._value.map((x) => Object.values(x).join('')).join('').length) {
      this.value = null;
    } else {
      this.value = JSON.stringify(this._value);
    }
  }

  valueChanged(value) {
    if (!this.schema) {
      // Component is not ready for value handling
      console.warn('ka-control-combo: cannot handle value without schema!');
      return;
    }
    // Validate value
    if (!value || value === JSON.stringify(this._value)) {
      return;
    }
    let _value = value;
    if (typeof _value === 'string') {
      try {
        _value = JSON.parse(_value);
      } catch (error) {
        console.error('ka-control-list: invalid value provided!', value);
        return;
      }
    }
    if (!Array.isArray(_value)) {
      console.error('ka-control-list: value must be an array!', value);
      return;
    }
    if (!_value.length) {
      if (!this._value.length) this.add();
      return;
    }
    this._value = _value;
  }

  add() {
    let value = {};
    for (let schema of this.schema.datasource.model.schema) {
      value[schema.field] = null;
    }
    this._value.push(value);
  }

  remove(value) {
    this._value = this._value.filter((v) => v !== value);
    this.change();
  }
}
