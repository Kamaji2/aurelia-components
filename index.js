import { PLATFORM } from 'aurelia-pal';
import PACKAGE from './package.json';

export { ResourceInterface } from './interfaces/resource';
export { TableInterface, TableSearchInterface } from './interfaces/table';

export { ApiService } from './services/api';
export { LayoutService } from './services/layout';
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
    this.useLottie();
    this.useHeading();
    this.useButtons();
    this.useDatetime();
    this.useControls();
    this.useTools();
    this.useTabs();
    this.useTable();
    this.useResource();
    this.useConverters();
  }
  useLayout() {
    console.debug(`%cDEBUG [${PACKAGE.name}-v${PACKAGE.version}] Loading layout modules`, 'color:#8b64cf;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-layout/ka-layout')]);
  }
  useLottie() {
    console.debug(`%cDEBUG [${PACKAGE.name}-v${PACKAGE.version}] Loading lottie modules`, 'color:#8b64cf;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-lottie/ka-lottie')]);
  }
  useHeading() {
    console.debug(`%cDEBUG [${PACKAGE.name}-v${PACKAGE.version}] Loading heading modules`, 'color:#8b64cf;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-heading/ka-heading')]);
  }
  useButtons() {
    console.debug(`%cDEBUG [${PACKAGE.name}-v${PACKAGE.version}] Loading button modules`, 'color:#8b64cf;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-button/ka-button')]);
  }
  useDatetime() {
    console.debug(`%cDEBUG [${PACKAGE.name}-v${PACKAGE.version}] Loading datetime modules`, 'color:#8b64cf;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-datetime/ka-datetime')]);
  }
  useControls() {
    console.debug(`%cDEBUG [${PACKAGE.name}-v${PACKAGE.version}] Loading control modules`, 'color:#8b64cf;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-check/ka-control-check')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-combo/ka-control-combo')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-date/ka-control-date')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-datetime/ka-control-datetime')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-time/ka-control-time')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-editor/ka-control-editor')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-file/ka-control-file')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-list/ka-control-list')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-number/ka-control-number')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-password/ka-control-password')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-table/ka-control-table')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-text/ka-control-text')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-textarea/ka-control-textarea')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control-range/ka-control-range')]);
  }
  useTools() {
    console.debug(`%cDEBUG [${PACKAGE.name}-v${PACKAGE.version}] Loading tools modules`, 'color:#8b64cf;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/attributes/ka-tooltip/ka-tooltip')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-toolicon/ka-toolicon')]);
  }
  useTabs() {
    console.debug(`%cDEBUG [${PACKAGE.name}-v${PACKAGE.version}] Loading tabs modules`, 'color:#8b64cf;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-tabs/ka-tabs')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-tabs/ka-tab/ka-tab')]);
  }
  useTable() {
    console.debug(`%cDEBUG [${PACKAGE.name}-v${PACKAGE.version}] Loading table modules`, 'color:#8b64cf;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table-pagination/ka-table-pagination')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table-progressbar/ka-table-progressbar')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table-search/ka-table-search')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table-sort/ka-table-sort')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table-toolbar/ka-table-toolbar')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table-row-tools/ka-table-row-tools')]);
  }
  useResource() {
    console.debug(`%cDEBUG [${PACKAGE.name}-v${PACKAGE.version}] Loading resource modules`, 'color:#8b64cf;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-resource/ka-resource')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-resource/ka-resource-toolbar/ka-resource-toolbar')]);
  }
  useConverters() {
    console.debug(`%cDEBUG [${PACKAGE.name}-v${PACKAGE.version}] Loading value converters`, 'color:#8b64cf;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/converters/date')]);
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
  nullifyObject: (object, deep = true) => {
    for (let key of Object.keys(object)) {
      if (deep && helpers.isObject(object[key])) helpers.nullifyObject(object[key]);
      else object[key] = null;
    }
    return object;
  },
  nullifyEmptyStringAttributes: (object) => {
    let data = {};
    for (let [k, v] of Object.entries(object)) {
      if (v === '') v = null;
      if (helpers.isObject(v)) {
        let value = helpers.nullifyEmptyStringAttributes(v);
        if (value && Object.entries(value).length) data[k] = value;
      } else {
        data[k] = v;
      }
    }
    return Object.entries(data).length ? data : null;
  },
  removeNullAttributes: (object) => {
    let data = {};
    for (let [k, v] of Object.entries(object)) {
      if (typeof v === 'undefined') continue;
      if (v === null) continue;
      if (helpers.isObject(v)) {
        let value = helpers.removeNullAttributes(v);
        if (value && Object.entries(value).length) data[k] = value;
      } else {
        data[k] = v;
      }
    }
    return Object.entries(data).length ? data : null;
  },
  deepMerge: (target, ...sources) => {
    target = JSON.parse(JSON.stringify(target));
    if (!sources.length) return target;
    const source = JSON.parse(JSON.stringify(sources.shift()));
    if (helpers.isObject(target) && helpers.isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (helpers.isObject(source[key])) {
          target[key] = helpers.deepMerge(target[key] || {}, source[key]);
        } else {
          target[key] = source[key];
        }
      });
    }
    return helpers.deepMerge(target, ...sources);
  },
  stringify: (object, replacer, spaces) => {
    return JSON.stringify(object,
      replacer ||
        function (field, value) {
          return typeof value === 'object' && value !== null && !['Array', 'Object'].includes(value.constructor?.name) ? '[Class]' : value;
        },
      spaces);
  },
  capitalize: (string) => {
    return (string && string[0].toUpperCase() + string.slice(1)) || '';
  },
  routesFromNav: (nav, inherit) => {
    let routes = [];
    for (let item of nav) {
      if (item.moduleId) {
        let route = {
          name: item.name || item.href,
          href: item.href,
          route: item.route || item.href,
          title: item.title || item.label || helpers.capitalize(item.name || item.href),
          moduleId: item.moduleId,
          activationStrategy: 'replace',
          settings: {
            hasLayout: !!item.hasLayout,
            hasLanguages: !!item.hasLanguages,
            authRequired: (inherit && inherit.authRequired) || !!item.authRequired || (item.authGroups && item.authGroups.length > 0) || (item.authRoles && item.authRoles.length > 0),
            authGroups: item.authGroups || null,
            authRoles: item.authRoles || null
          }
        };
        routes.push(route);
      }
      if (item.nav) routes = routes.concat(helpers.routesFromNav(item.nav, item));
    }
    return routes;
  },
  toastResourceSaveError(toast, error, i18n = { tr: (value) => { return value }}) {
    if (!toast?.show) {
      console.error('Helper\'s toastResourceSaveError function requires an instance of toast service to be passed!');
      return;
    }
    const context = error.context || error.info?.context;
    const message = error.message || error.info?.message || error.detail?.message;
    if (context === 'sanitization') {
      return toast.show(`${i18n.tr('Warning')}: ${i18n.tr(message)}!`, 'warning');
    } else if (context === 'validation') {
      return toast.show([`${i18n.tr('Warning')}: ${i18n.tr('Data validation error')}!`, i18n.tr(message)], 'warning');
    } else if (context === 'xhr') {
      return toast.show([`${i18n.tr('Server error')}!`, i18n.tr(message)], 'error');
    } else {
      return toast.show([`${i18n.tr('Error')}!`, i18n.tr(message)], 'error');
    }
  }
};
