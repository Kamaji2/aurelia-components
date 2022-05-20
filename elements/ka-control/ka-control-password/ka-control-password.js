import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

require('./ka-control-password.sass');

@customElement('ka-control-password')
@inject(Element)
export class KaControlPassword {
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
