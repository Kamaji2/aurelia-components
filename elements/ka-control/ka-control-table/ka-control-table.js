import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

require('./ka-control-table.sass');

@customElement('ka-control-table')
@inject(Element)
export class KaControlsTable {
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;
  @bindable() label = null;
  _schema = null;
  _value = [];
  newValue = {};

  constructor(element) {
    this.element = element;
  }

  attached() {
  }

  schemaChanged(schema) {
    if (!schema) {
      console.warn('ka-control-table: missing schema!', schema);
      return;
    }
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema);
      } catch (error) {
        console.error('ka-control-table: invalid schema provided!', value);
        return;
      }
    }
    if (!Array.isArray(schema) || !schema.length) {
      console.error('ka-control-table: schema must be an array of objects!', schema);
      return;
    }
    console.debug('ka-control-table: schema changed!', schema);
    this._schema = schema;
  }

  valueChanged(value) {
    if (!value || value === JSON.stringify(this._value)) {
      return;
    }
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch (error) {
        console.error('ka-control-table: invalid value provided!', value);
        return;
      }
    }
    if (!Array.isArray(value)) {
      console.error('ka-control-table: value must be an array!', value);
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
    this._value = this._value.filter(v => v !== value);
    this.update();
  }
}
