import { inject } from 'aurelia-framework';
import { DialogService as AureliaDialogService } from 'aurelia-dialog';

require('./dialog.sass');

@inject(AureliaDialogService)
export class DialogService {

  constructor(AureliaDialogService) {
    this.AureliaDialogService = AureliaDialogService;
  }

  open(params, lock = true) {
    return this.AureliaDialogService.open({ viewModel: DialogServiceViewModel, model: params, lock: lock });
  }
  alert(params = {}, lock) {
    params.type = 'alert';
    return this.open(params, lock);
  }
  confirm(params = {}, lock) {
    params.type = 'confirm';
    return this.open(params, lock);
  }
}

import { inlineView } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

@inlineView(`
  <template>
    <ux-dialog class.bind="class">
      <ka-layout-heading if.bind="title" level="3" icon.bind="icon" text.bind="title"></ka-layout-heading>

      <ux-dialog-body if.bind="body" innerhtml.bind="body"></ux-dialog-body>
      <ux-dialog-body if.bind="viewModel"><compose view-model.bind="viewModel" model.bind="model"></compose></ux-dialog-body>
      <ux-dialog-body if.bind="viewStrategy"><compose view.bind="viewStrategy"></compose></ux-dialog-body>

      <ux-dialog-footer if.bind="type==='alert'">
        <ka-button click.delegate="DialogController.ok(model || null)">Ok</ka-button>
      </ux-dialog-footer>

      <ux-dialog-footer if.bind="type==='confirm'">
        <ka-button class="inverted" click.delegate="DialogController.cancel(model || null)">Annulla</ka-button>
        <ka-button click.delegate="DialogController.ok(model || null)">Continua</ka-button>
      </ux-dialog-footer>

    </ux-dialog>
  </template>
`)
@inject(DialogController)
export class DialogServiceViewModel {
  constructor(DialogController) {
    this.DialogController = DialogController;
  }
  activate(params) {
    Object.assign(this, params);
    console.log(this, this.DialogController);
  }
}
