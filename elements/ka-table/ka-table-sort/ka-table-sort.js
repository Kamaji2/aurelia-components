import { inject, bindable, customElement } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';

@customElement('ka-table-sort')
@inject(Element, I18N)
export class KaTableSort {
  @bindable() property = null;
  order = null;

  constructor(element, i18n) {
    this.element = element;
    this.i18n = i18n;
  }

  bind(bindingContext) {
    this.interface = bindingContext && bindingContext.constructor?.name === 'TableInterface' ? bindingContext : null;
    if (!this.interface) {
      console.error('ka-table-sort: missing table search interface!');
      return;
    }
    if (!this.interface.uuid) {
      console.error('ka-table-sort: cannot bind to table search interface!');
      return;
    }
    this.update();
    this.interface.events.addEventListener('load', () => {
      this.update();
    });
  }

  sort() {
    if (!this.order) this.order = 'asc';
    else if (this.order === 'asc') this.order = 'desc';
    else if (this.order === 'desc') this.order = null;
    this.interface.load(null, this.order ? [{ name: this.property, order: this.order }] : []).then(() => {
      this.update();
    });
  }

  update() {
    let item = this.interface.sort?.find((sort) => sort.name === this.property);
    this.order = item?.order || null;
  }
}