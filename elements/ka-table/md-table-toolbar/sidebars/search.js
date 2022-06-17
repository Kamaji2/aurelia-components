import {activationStrategy} from 'aurelia-router';

export class SidebarSearch {
  inputs = [];
  constructor(api) {
    this.api = api;
  }

  determineActivationStrategy() {
    return activationStrategy.replace;
  }

  activate(params) {
    this.params = params;
    this.inputs = Object.keys(params.search.schema);
  }

  search() {
    this.params.search.search().then(() => { this.close(); });
  }

  reset() {
    this.params.search.reset();
  }
}
