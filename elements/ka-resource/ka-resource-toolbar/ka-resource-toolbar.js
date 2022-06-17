import { customElement } from 'aurelia-framework';

@customElement('ka-resource-toolbar')
export class KaResourceToolbar {
  bind(bindingContext) {
    this.interface = bindingContext && bindingContext.interface && bindingContext.interface.constructor?.name === 'ResourceInterface' ? bindingContext.interface : null;
    if (!this.interface) {
      console.error('ka-resource-toolbar: missing resource interface!');
      return;
    } else if (!this.interface.uuid) {
      console.error('ka-resource-toolbar: cannot bind to resource interface!');
      return;
    }
  }
}
