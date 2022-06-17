import {inject} from 'aurelia-framework';
import {DialogController} from 'aurelia-dialog';

@inject(DialogController)
export class KaDialogVm {

  constructor(controller){
    this.controller = controller;
  }

  activate(params) {
    let classes = params.viewModel ? ['viewModel'] : [''];
    params.class = params.class ? classes.concat(params.class.split(' ')).join(' ') : classes.join(' ');
    this.params = params;
    if (this.params.viewModel && this.params.viewModelParams) this.params.viewModelParams.dialog = this.controller;
  }
}
