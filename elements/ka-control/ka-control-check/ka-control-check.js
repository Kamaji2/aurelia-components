import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

require('./ka-control-check.sass');

@customElement('ka-control-check')
@inject(Element)
export class KaControlCheck {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;

  constructor(element) {
    this.element = element;
  }
  focus() {
    this.element.dispatchEvent(new Event('focus', { bubbles: true }));
  }
  blur() {
    this.element.dispatchEvent(new Event('blur', { bubbles: true }));
  }
  click($event) {
    if (this.schema.readonly) {
      $event.preventDefault();
      $event.stopPropagation();
    } else {
      this.value = !this.value;
      setTimeout(() => { this.element.dispatchEvent(new Event('change', { bubbles: true })); }, 100);
    }
  }
}
