import { inject, customElement, bindable, bindingMode } from 'aurelia-framework';

require('./ka-control-list.sass');

@customElement('ka-control-list')
@inject(Element)
export class KaControlsList {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value = null;

  items = [];
  controls = {};

  constructor(element) {
    this.element = element;
  }

  get itemValues() {
    return this.items.map((item) => item.data);
  }

  attached() {
    if (!this.value) {
      new Array(parseInt(this.schema?.min || 1, 10)).fill(0).forEach(() => {
        this.add();
      });
    } else {
      this.value = this.formatItemValues(this.itemValues);
    }
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
    if (!this.itemValues.map((v) => Object.values(v).join('')).join('').length) {
      this.value = null;
    } else {
      this.value = this.formatItemValues(this.itemValues);
    }
  }

  valueChanged(value) {
    if (!this.schema) {
      // Component is not ready for value handling
      console.warn('ka-control-combo: cannot handle value without schema!');
      return;
    }
    // Validate value
    if (!value || value === this.formatItemValues(this.itemValues)) {
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
      if (!this.items.length) this.add();
      return;
    }
    this.items = _value.map((v) => { 
      return { 
        schema: JSON.parse(JSON.stringify(this.schema.datasource.model.schema)),
        data: v
      };
    });
  }

  formatItemValues(itemValues) {
    return this.schema.params?.stringify === false ? itemValues : JSON.stringify(itemValues);
  }

  add() {
    const item = {
      schema: JSON.parse(JSON.stringify(this.schema.datasource.model.schema)),
      data: {}
    };
    for (let schema of item.schema) {
      item.data[schema.field] = null;
    }
    this.items.push(item);
  }

  remove(item) {
    this.items = this.items.filter((i) => i !== item);
    this.change();
  }
}
