import { inject, customElement, bindable } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';
import { DialogService, ToastService } from 'aurelia-components';

@customElement('ka-table-filters')
@inject(Element, I18N, DialogService, ToastService)
export class KaTableFilters {
  constructor(element, i18n, dialog, toast) {
    this.element = element;
    this.i18n = i18n;
    this.dialog = dialog;
    this.toast = toast;
  }
  bind(bindingContext) {
    this.interface = bindingContext && bindingContext.constructor?.name === 'TableSearchInterface' ? bindingContext : null;
    if (!this.interface) {
      console.error('ka-table-filters: missing table search interface!');
      return;
    }
    if (!this.interface.uuid) {
      console.error('ka-table-filters: cannot bind to table search interface!');
      return;
    }
    this.uuid = `ka-table-filters-${this.interface.uuid}`;
    this.element.id = this.uuid;

    this.interface.table.events.addEventListener('loadSuccess', () => {
      this.closeFilters();
      this.processActiveFilters();
    });
  }

  openFilters() {
    this.isModalOpen = true;
    this.element.style.zIndex = 3;
  }
  closeFilters() {
    this.isModalOpen = false;
    this.element.style.removeProperty("z-index");
  }
  clearFilters() {
    this.interface.reset();
  }
  processActiveFilters() {
    this.activeFilters = [];
    Object.values(this.interface.controls).forEach((control) => {
      if (!control.value) return;
      this.activeFilters.push({
        name: control.name,
        label: control.schema.label || control.name,
        value: control.value
      });
    });
  }
  removeFilter(name) {
    if (!this.interface.controls[name]) return;
    this.interface.controls[name].value = null;
    this.interface.search();
  }
}
