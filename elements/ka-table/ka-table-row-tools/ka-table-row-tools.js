import { inject, bindable, customElement } from 'aurelia-framework';

@customElement('ka-table-row-tools')
@inject(Element)
export class KaTableRowTools {
  @bindable() float = true;
  constructor(element) {
    this.element = element;
    this.element.classList.add('ka-table-row-tools');
  }
}