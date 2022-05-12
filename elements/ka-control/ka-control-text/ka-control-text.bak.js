import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';
import {Router} from 'aurelia-router';

@customElement('ka-control-text')
@inject(Element, Router)
export class KaControlText {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;
  // Other input control bindable properties
  @bindable() readonly = null;

  _displayValue = null;

  constructor(element, router) {
    this.element = element;
    this.router = router;
  }

  attached() {}

  schemaChanged(schema) {
    // Validate schema
    if (!schema) {
      konsole.warn('ka-control-text: missing schema!', schema);
      return;
    }
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema);
      } catch (error) {
        konsole.error('ka-control-text: invalid schema provided!', schema);
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

    konsole.debug('ka-control-text: schema changed!', schema);
    this._schema = schema;
  }

  get displayValue() {
    return this._displayValue || this.value;
  }
  set displayValue(value) {
    this._displayValue = value;
    this.value = this.element.innerText;
  }

  keydown() {
    return !this.readonly;
  }

  paste($event) {
    $event.preventDefault();
    let paste = ($event.clipboardData || window.clipboardData).getData('text');
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    selection.deleteFromDocument();
    selection.getRangeAt(0).insertNode(document.createTextNode(paste));
    selection.collapseToEnd();
    if (!this.value) this.value = paste;
  }
}
