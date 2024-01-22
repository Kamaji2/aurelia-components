import { bindable, customElement } from 'aurelia-framework';

@customElement('ka-table-row-tools')
export class KaTableRowTools {
  @bindable() float = true;

  static inject = [Element];
  constructor(element) {
    this.element = element;
    this.element.classList.add('ka-table-row-tools');
  }
}
