import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

require('./ka-control-list.sass');

@customElement('ka-control-list')
@inject(Element)
export class KaControlsList {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;
  // Other input control bindable properties
  @bindable() readonly = null;

  _schema = null;
  _value = [];
  newValue = {};

  constructor(element) {
    this.element = element;
  }

  attached() {
    if (!this.value) this.add();
  }

  schemaChanged(schema) {
    if (!schema) {
      console.warn('ka-control-list: missing schema!', schema);
      return;
    }
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema);
      } catch (error) {
        console.error('ka-control-list: invalid schema provided!', value);
        return;
      }
    }
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

    // Thisify boolean schema attributes
    for (let attribute of ['readonly']) {
      if (this[attribute] === null) {
        if (this.element.getAttribute(attribute)) {
          this[attribute] = String(this.element.getAttribute(attribute)).toLowerCase() === 'true';
        } else if (typeof schema[attribute] !== undefined) {
          this[attribute] = String(schema[attribute]).toLowerCase() === 'true';
        }
      } else this[attribute] = String(this[attribute]).toLowerCase() === 'true';
    }

    console.debug('ka-control-list: schema changed!', schema);
    this._schema = schema;
  }

  keydown() {
    return !this.readonly;
  }

  change() {
    if (!this._value.map(x => Object.values(x).join('')).join('').length) {
      this.value = null;
    } else {
      this.value = JSON.stringify(this._value);
    }
  }

  valueChanged(value) {
    if (!this._schema) {
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

    console.debug('ka-control-list: value changed!', _value);
    this._value = _value;
  }

  add() {
    let value = {};
    for (let schema of this._schema.datasource.model.schema) {
      value[schema.field] = null;
    }
    this._value.push(value);
  }

  remove(value) {
    this._value = this._value.filter(v => v !== value);
    this.change();
  }
}
