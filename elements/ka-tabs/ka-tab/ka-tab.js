import { customElement } from 'aurelia-framework';

@customElement('ka-tab')
export class KaTab {
  static inject = [Element];
  constructor(element) {
    this.element = element;
  }
}
