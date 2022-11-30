import { inject, customElement, bindable } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';
import { ToastService } from 'aurelia-components';

@customElement('ka-table-search')
@inject(Element, I18N, ToastService)
export class KaTableSearch {
  @bindable() buttonReset = () => {
    this.defaultReset();
    console.warn('ka-table-search: buttonReset function unset, using default!');
  };
  @bindable() buttonSearch = () => {
    this.defaultSearch();
    console.warn('ka-table-search: buttonSearch function unset, using default!');
  };
  constructor(element, i18n, toast) {
    this.element = element;
    this.i18n = i18n;
    this.toast = toast;
  }
  bind(bindingContext) {
    this.interface = bindingContext && bindingContext.constructor?.name === 'TableSearchInterface' ? bindingContext : null;
    if (!this.interface) {
      console.error('ka-table-search: missing table search interface!');
      return;
    }
    if (!this.interface.uuid) {
      console.error('ka-table-search: cannot bind to table search interface!');
      return;
    }
    this.uuid = `ka-table-search-${this.interface.uuid}`;
    this.element.id = this.uuid;
  }

  defaultReset() {
    this.interface.reset();
  }
  defaultSearch() {
    this.interface.search();
  }
}
