import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

require('./ka-control-textarea.sass');

@customElement('ka-control-textarea')
@inject(Element)
export class KaControlTextarea {
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
