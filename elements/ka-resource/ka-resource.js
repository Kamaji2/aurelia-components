import { inject, customElement, bindable } from 'aurelia-framework';

@customElement('ka-resource')
@inject(Element)
export class KaResource {
  @bindable() height = 'full';
  constructor(element) {
    this.element = element;
  }
  bind(bindingContext) {
    this.interface = bindingContext && bindingContext.constructor?.name === 'ResourceInterface' ? bindingContext : null;
    if (!this.interface) {
      console.error('ka-resource: missing resource interface!');
      return;
    } else if (!this.interface.uuid) {
      console.error('ka-resource: cannot bind to resource interface!');
      return;
    }
    this.uuid = `ka-resource-${this.interface.uuid}`;
    this.element.id = this.uuid;
  }
  attached() {
  }

  detached() {
  }
}
