import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

@customElement('ka-control-number')
@inject(Element)
export class KaControlNumber {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;
  // Other input control bindable properties
  @bindable() readonly = null;
  @bindable() placeholder = '';

  constructor(element) {
    this.element = element;
  }

  attached() {}

  schemaChanged(schema) {
    // Validate schema
    if (!schema) {
      konsole.warn('ka-control-number: missing schema!', schema);
      return;
    }
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema);
      } catch (error) {
        konsole.error('ka-control-number: invalid schema provided!', schema);
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

    konsole.debug('ka-control-number: schema changed!', schema);
    this._schema = schema;
  }

  keydown() {
    return !this.readonly;
  }
}
