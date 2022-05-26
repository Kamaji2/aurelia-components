import { PLATFORM } from 'aurelia-pal';

export { ResourceInterface } from './interfaces/resource';

export { ApiService } from './services/api';
export { AuthService } from './services/auth';
export { UserService } from './services/user';
export { DialogService } from './services/dialog';
export { ToastService } from './services/toast';

export function configure(config, callback) {
  config = new AureliaComponentsConfiguration(config);
  if (callback instanceof Function) {
    callback(config);
  } else {
    config.useAll();
  }
  config.apply();
}
export class AureliaComponentsConfiguration {
  constructor(config) {
    this.config = config;
  }
  useAll() {
    this.useLayout();
    this.useButtons();
    this.useControls();
    this.useConverters();
  }
  useLayout() {
    console.log('%c[kamaji2-aurelia-components] loading layout modules', 'color:#8b64cf;font-size:8px;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-layout/ka-layout')]);
  }
  useButtons() {
    console.log('%c[kamaji2-aurelia-components] loading button modules', 'color:#8b64cf;font-size:8px;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-button/ka-button')]);
  }
  useControls() {
    console.log('%c[kamaji2-aurelia-components] loading control modules', 'color:#8b64cf;font-size:8px;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control/ka-control')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-check/ka-control-check')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-combo/ka-control-combo')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-date/ka-control-date')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-editor/ka-control-editor')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-file/ka-control-file')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-list/ka-control-list')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-number/ka-control-number')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-password/ka-control-password')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-table/ka-control-table')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-text/ka-control-text')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-textarea/ka-control-textarea')]);
  }
  useConverters() {
    console.log('%c[kamaji2-aurelia-components] loading value converters', 'color:#8b64cf;font-size:8px;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/converters/datetime')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/converters/striphtml')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/converters/stringify')]);
  }

  apply() {}
}

export const helpers = {
  isObject: (object) => {
    return object instanceof Object && object.constructor === Object;
  },
  diffObject: (object1, object2, deep = true) => {
    // object1 = original data, object2 = modified data
    let data = {};
    for (let [k, v] of Object.entries(object1)) {
      if (typeof object2[k] === 'undefined') continue;
      if (deep && helpers.isObject(v)) {
        let value = helpers.diffObject(v, object2[k]);
        if (value) data[k] = value;
      } else if (JSON.stringify(v) !== JSON.stringify(object2[k])) {
        data[k] = object2[k];
      }
    }
    return Object.entries(data).length ? data : null;
  },
  deepMerge: (target, ...sources) => {
    target = JSON.parse(JSON.stringify(target));
    if (!sources.length) return target;
    const source = JSON.parse(JSON.stringify(sources.shift()));
    if (helpers.isObject(target) && helpers.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (helpers.isObject(source[key])) {
          target[key] = helpers.deepMerge(target[key] || {}, source[key]);
        } else {
          target[key] = source[key];
        }
      });
    }
    return helpers.deepMerge(target, ...sources);
  }
}