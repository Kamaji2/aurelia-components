import { inject, customElement } from 'aurelia-framework';

@customElement('ka-table-progressbar')
@inject(Element)
export class KaTableProgressbar {
  constructor(element) {
    this.element = element;
  }
  bind(bindingContext) {
    this.interface = bindingContext.interface || null;
    if (!this.interface) {
      console.error('ka-table-progressbar: missing table interface!');
      return;
    } else if (!this.interface.uuid) {
      console.error('ka-table-progressbar: cannot bind to table interface!');
      return;
    }
    this.uuid = `ka-table-progressbar-${this.interface.uuid}`;
    this.element.id = this.uuid;
    this.element.classList.add('visible');

    this.interface.events.addEventListener('load', () => {
      this.element.classList.add('visible');
    });
    this.interface.events.addEventListener('loadSuccess', () => {
      this.element.classList.remove('visible');
    });
    this.interface.events.addEventListener('loadFailure', () => {
      this.element.classList.remove('visible');
    });
  }
}
