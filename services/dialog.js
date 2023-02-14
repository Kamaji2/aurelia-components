import { inject } from 'aurelia-framework';
import { DialogService as AureliaDialogService } from 'aurelia-dialog';

require('./dialog.sass');

@inject(AureliaDialogService)
export class DialogService {
  constructor(AureliaDialogService) {
    this.AureliaDialogService = AureliaDialogService;
  }

  open(params, lock = true) {
    return this.AureliaDialogService.open({
      viewModel: DialogServiceViewModel,
      model: params,
      lock: lock
    });
  }
  alert(params = {}, lock) {
    params.type = 'alert';
    return this.open(params, lock);
  }
  confirm(params = {}, lock) {
    params.type = 'confirm';
    return this.open(params, lock);
  }
  continue(params = {}, lock) {
    params.type = 'continue';
    return this.open(params, lock);
  }
}

import { inlineView } from 'aurelia-framework';
import { TemplatingEngine, ViewResources, ViewSlot } from 'aurelia-templating'
import { Container } from 'aurelia-dependency-injection';
import { DialogController } from 'aurelia-dialog';

@inlineView(`
  <template>
    <ux-dialog ref="element" class.bind="class">
      <ka-heading if.bind="title" level="2" icon.bind="icon" text.bind="title"></ka-heading>

      <ux-dialog-body if.bind="body" innerhtml.bind="body"></ux-dialog-body>

      <ux-dialog-body if.bind="wrapViewModel" class="ViewModelWrapper">
        <div ref="placeholder"></div>
      </ux-dialog-body>
      <div else ref="placeholder"></div>

      <ux-dialog-footer if.bind="type==='alert'">
        <ka-button click.delegate="controller.ok(model || null)">\${'OK'|t}</ka-button>
      </ux-dialog-footer>

      <ux-dialog-footer if.bind="type==='confirm'">
        <ka-button class="inverted" click.delegate="controller.cancel(model || null)">\${'Cancel'|t}</ka-button>
        <ka-button click.delegate="controller.ok(model || null)">\${'Confirm'|t}</ka-button>
      </ux-dialog-footer>

      <ux-dialog-footer if.bind="type==='continue'">
        <ka-button class="inverted" click.delegate="controller.cancel(model || null)">\${'Cancel'|t}</ka-button>
        <ka-button click.delegate="controller.ok(model || null)">\${'Continue'|t}</ka-button>
      </ux-dialog-footer>

      <div id="ka-dialog-loader" ref="loader"><div></div></div>

    </ux-dialog>
  </template>
`)
@inject(TemplatingEngine, ViewResources, Container, DialogController)
export class DialogServiceViewModel {
  viewModelReference = { currentViewModel: null };
  constructor(TemplatingEngine, ViewResources, Container, controller) {
    this.templatingEngine = TemplatingEngine;
    this.viewResources = ViewResources;
    this.container = Container;
    this.controller = controller;
  }
  activate(params) {
    Object.assign(this, params);
  }
  attached() {
    if (this.viewModel) this.init();
  }

  async init() {
    const viewController = await this.templatingEngine.compose({
      container: this.container,
      model: this.model,
      owningView: new DialogServiceView(this.loader, this.controller),
      viewModel: this.container.get(this.viewModel),
      viewResources: this.viewResources,
      viewSlot: new ViewSlot(this.placeholder, false)
    });
    this.placeholder.parentElement.removeChild(this.placeholder);
    viewController.attached();
    return viewController;
  }
}

export class DialogServiceView {
  loader = {
    show: () => {
      if (!this.loaderElement) return;
      this.loaderElement.classList.add('visible');
    },
    hide: () => {
      if (!this.loaderElement) return;
      this.loaderElement.classList.remove('visible');
    }
  };
  ok = (model) => {
    this.dialogController.ok(model);
  };
  cancel = (model) => {
    this.dialogController.cancel(model);
  };
  constructor(loaderElement, dialogController) {
    this.loaderElement = loaderElement;
    this.dialogController = dialogController;
  }
}