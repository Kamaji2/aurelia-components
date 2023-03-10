import { inject, customElement, bindable } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';
import { ToastService } from 'aurelia-components';

@customElement('ka-resource-toolbar')
@inject(Element, I18N, ToastService)
export class KaResourceToolbar {
  @bindable() close = () => {
    console.warn('ka-resource-toolbar: close function unset!');
  };
  @bindable() buttonCancel = () => {
    this.defaultCancel();
    console.warn('ka-resource-toolbar: buttonCancel function unset, using default!');
  };
  @bindable() buttonSave = () => {
    this.defaultSave();
    console.warn('ka-resource-toolbar: buttonSave function unset, using default!');
  };
  @bindable() interface = null;

  constructor(element, i18n, toast) {
    this.element = element;
    this.i18n = i18n;
    this.toast = toast;
  }
  bind(bindingContext) {
    this.interface = this.interface || (bindingContext && bindingContext.constructor?.name === 'ResourceInterface' ? bindingContext : null);
    if (!this.interface) {
      console.error('ka-resource-toolbar: missing resource interface!');
      return;
    }
    if (!this.interface.uuid) {
      console.error('ka-resource-toolbar: cannot bind to resource interface!');
      return;
    }
    this.uuid = `ka-resource-toolbar-${this.interface.uuid}`;
    this.element.id = this.uuid;

    // Handle buttons configuration
    if (this.element.hasAttribute('buttons')) {
      this.buttons = this.element.getAttribute('buttons').split(',');
    }
  }

  defaultCancel() {
    this.close();
  }
  defaultSave() {
    this.interface
      .save()
      .then((xhr) => {
        let message = xhr.requestMessage.method === 'POST' ? this.i18n.tr('Record successfully created') : this.i18n.tr('Record successfully edited');
        this.toast.show(`${message}!`, 'success');
        this.close({ xhr });
      },
      (error) => {
        if (error.info?.context === 'sanitization') {
          this.toast.show(`${this.i18n.tr('Warning')}: ${this.i18n.tr(error.info?.message || error.detail?.message)}!`, 'warning');
        } else if (error.info?.context === 'validation') {
          this.toast.show([`${this.i18n.tr('Warning')}: ${this.i18n.tr('Data validation error')}!`, this.i18n.tr(error.info?.message || error.detail?.message)], 'warning');
        } else if (error.info?.context === 'xhr') {
          this.toast.show([`${this.i18n.tr('Server error')}!`, this.i18n.tr(error.info?.message || error.detail?.message)], 'error');
        } else {
          this.toast.show([`${this.i18n.tr('Error')}!`, this.i18n.tr(error.info?.message || error.detail?.message)], 'error');
        }
        console.error(error.name, error.info);
      })
      .catch((error) => {
        this.toast.show(`${this.i18n.tr('Error')}!`, 'error');
        console.error(error);
      });
  }
}
