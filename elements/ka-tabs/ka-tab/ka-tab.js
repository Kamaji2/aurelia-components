import { inject, customElement } from 'aurelia-framework';

@customElement('ka-tab')
@inject(Element)
export class KaTab {
  constructor(element) {
    this.element = element;
  }
}
