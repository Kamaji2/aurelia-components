import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

require('./ka-control-number.sass');

@customElement('ka-control-number')
@inject(Element)
export class KaControlNumber {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;

  constructor(element) {
    this.element = element;
  }

  keydown() {
    return !this.schema.readonly;
  }
}
