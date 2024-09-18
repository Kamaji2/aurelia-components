import { inject, customElement, bindable } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';
import { ToastService } from 'aurelia-components';


@customElement('ka-table-toolbar')
@inject(Element, I18N, ToastService)
export class KaTableToolbar {
  @bindable() buttonSearch = () => {
    console.warn('ka-table-toolbar: buttonSearch function unset!');
  };
  @bindable() buttonDownload = () => {
    console.warn('ka-table-toolbar: buttonDownload function unset, using default!');
    this.defaultDownload();
  };
  @bindable() buttonAdd = () => {
    console.warn('ka-table-toolbar: buttonAdd function unset!');
  };

  constructor(element, i18n, toast) {
    this.element = element;
    this.i18n = i18n;
    this.toast = toast;
  }

  bind(bindingContext) {
    this.interface = bindingContext && bindingContext.constructor?.name === 'TableInterface' ? bindingContext : null;
    if (!this.interface) {
      console.error('ka-table-toolbar: missing table interface!');
      return;
    }
    if (!this.interface.uuid) {
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

  pendingDefaultDownload = false;
  defaultDownload() {
    if (this.pendingDefaultDownload) return;
    this.pendingDefaultDownload = true;
    this.toast.show(`${this.i18n.tr('Exporting rows in progress')}...`, 'loading', true);
    this.interface.exportInterface?.export().then(() => {
      this.toast.show(`${this.i18n.tr('Rows successfully exported')}!`, 'success');
    }).catch((error) => {
      this.toast.show(`${this.i18n.tr('An error occured while exporting rows')}!`, 'error');
      console.error(error);
    }).finally(() => {
      this.pendingDefaultDownload = false;
    });
  }
}
