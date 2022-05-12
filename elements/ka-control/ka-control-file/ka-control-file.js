import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

@customElement('ka-control-file')
@inject(Element)
export class KaControlFile {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;
  // Other input control bindable properties
  @bindable() readonly = null;
  @bindable() placeholder = '';
  // Input control specific params property
  @bindable() params = null;

  constructor(element) {
    this.element = element;
  }

  attached() {}

  schemaChanged(schema) {
    // Validate schema
    if (!schema) {
      konsole.warn('ka-control-file: missing schema!', schema);
      return;
    }
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema);
      } catch (error) {
        konsole.error('ka-control-file: invalid schema provided!', schema);
        return;
      }
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

    konsole.debug('ka-control-file: schema changed!', schema);
    this._schema = schema;
  }

  valueChanged(value) {
    konsole.debug('ka-control-file: value changed!', value);
    if (typeof value === 'undefined' || value === '' || (value && !value.length)) value = null;
    this.displayValue = value && value.length && value[0] && value[0].name ? value[0].name : value;
  }

  clear() {
    this.value = null;
  }

  download() {
    if (!this.value || !this.params.download) return;
    window.open(this.params.download);
  }
}
