import {bindable, bindingMode, inject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import {KaDialogVm} from './ka-dialog-vm';

@inject(DialogService)
export class KaDialog {

  constructor(dialog) {
    this.dialog = dialog;
  }

  open(model, lock = true) {
    return this.dialog.open({ viewModel: KaDialogVm, model: model, lock: lock });
  }
}
