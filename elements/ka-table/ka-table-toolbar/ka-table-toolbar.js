import {inject, customElement, bindable} from 'aurelia-framework';

@customElement('ka-table-toolbar')
@inject(Element)
export class KaTableToolbar {
  @bindable() search = {};
  @bindable() download = () => {};

  constructor(element) {
    this.element = element;
  }
  bind(bindingContext) {
    this.interface = bindingContext && bindingContext.constructor?.name === 'TableInterface' ? bindingContext : null;
    if (!this.interface) {
      console.error('ka-table-toolbar: missing table interface!');
      return;
    } else if (!this.interface.uuid) {
      console.error('ka-table-toolbar: cannot bind to table interface!');
      return;
    }
    this.uuid = `ka-table-toolbar-${this.interface.uuid}`;
    this.element.id = this.uuid;

    // Handle buttons configuration
    if (this.element.hasAttribute('buttons')) {
      this.buttons = this.element.getAttribute('buttons').split(',');
    }
  }
}
