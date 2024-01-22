import { customElement, bindable, bindingMode } from 'aurelia-framework';

require('./ka-control-textarea.sass');

@customElement('ka-control-textarea')
export class KaControlTextarea {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value = null;

  static inject = [Element];
  constructor(element) {
    this.element = element;
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
}
