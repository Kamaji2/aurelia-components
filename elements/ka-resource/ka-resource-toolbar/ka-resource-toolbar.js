import { inject, customElement, bindable } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';
import { helpers, DialogService, ToastService } from 'aurelia-components';

@customElement('ka-resource-toolbar')
@inject(Element, I18N, DialogService, ToastService)
export class KaResourceToolbar {
  @bindable() close = () => {
    console.warn('ka-resource-toolbar: close function unset!');
  };
  @bindable() buttonCancel = () => {
    console.warn('ka-resource-toolbar: buttonCancel function unset, using default!');
    this.defaultCancel();
  };
  @bindable() buttonSave = () => {
    console.warn('ka-resource-toolbar: buttonSave function unset, using default!');
    this.defaultSave();
  };
  @bindable() buttonDelete = () => {
    console.warn('ka-resource-toolbar: buttonDelete function unset, using default!');
    this.defaultDelete();
  };
  @bindable() interface = null;

  constructor(element, i18n, dialog, toast) {
    this.element = element;
    this.i18n = i18n;
    this.dialog = dialog;
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

  pendingDefaultSave = false;
  defaultSave() {
    if (this.pendingDefaultSave) return;
    this.pendingDefaultSave = true;
    this.interface.save().then((xhr) => {
      let message = xhr.requestMessage.method === 'POST' ? this.i18n.tr('Record successfully created') : this.i18n.tr('Record successfully edited');
      this.toast.show(`${message}!`, 'success');
      this.close({ xhr });
    }).catch((error) => {
      helpers.toastResourceSaveError(this.toast, error, this.i18n);
      console.error(error, error.info);
    }).finally(() => {
      this.pendingDefaultSave = false;
    });
  }

  pendingdefaultDelete = false;
  defaultDelete() {
    if (this.pendingdefaultDelete) return;
    this.pendingdefaultDelete = true;
    this.dialog.confirm({
      title: this.i18n.tr('Warning'),
      body: this.i18n.tr('confirm_delete')
    }).whenClosed((response) => {
      if (!response.wasCancelled) {
        this.interface.delete().then((xhr) => {
          this.toast.show(`${this.i18n.tr('Record successfully deleted')}!`, 'success');
          this.close({ xhr });
        }).catch((error) => {
          helpers.toastResourceSaveError(this.toast, error, this.i18n);
          console.error(error, error.info);
        }).finally(() => {
          this.pendingdefaultDelete = false;
        });
      } else {
        this.pendingdefaultDelete = false;
      }
    });
  }
}
