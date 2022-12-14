import { PLATFORM } from 'aurelia-pal';

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
  if (callback instanceof Function) { callback(config); } else {
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
    this.useHeading();
    this.useButtons();
    this.useDatetime();
    this.useControls();
    this.useTooltip();
    this.useTabs();
    this.useTable();
    this.useResource();
    this.useConverters();
  }
  useLayout() {
    console.log('%c[kamaji2-aurelia-components] loading layout modules', 'color:#8b64cf;font-size:8px;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-layout/ka-layout')]);
  }
  useHeading() {
    console.log('%c[kamaji2-aurelia-components] loading heading modules', 'color:#8b64cf;font-size:8px;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-heading/ka-heading')]);
  }
  useButtons() {
    console.log('%c[kamaji2-aurelia-components] loading button modules', 'color:#8b64cf;font-size:8px;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-button/ka-button')]);
  }
  useDatetime() {
    console.log('%c[kamaji2-aurelia-components] loading datetime modules', 'color:#8b64cf;font-size:8px;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-datetime/ka-datetime')]);
  }
  useControls() {
    console.log('%c[kamaji2-aurelia-components] loading control modules', 'color:#8b64cf;font-size:8px;');
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
  useTooltip() {
    console.log('%c[kamaji2-aurelia-components] loading tooltip modules', 'color:#8b64cf;font-size:8px;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/attributes/ka-tooltip/ka-tooltip')]);
  }
  useTabs() {
    console.log('%c[kamaji2-aurelia-components] loading tabs modules', 'color:#8b64cf;font-size:8px;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-tabs/ka-tabs')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-tabs/ka-tab/ka-tab')]);
  }
  useTable() {
    console.log('%c[kamaji2-aurelia-components] loading table modules', 'color:#8b64cf;font-size:8px;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table-pagination/ka-table-pagination')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table-progressbar/ka-table-progressbar')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table-search/ka-table-search')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table-sort/ka-table-sort')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table-toolbar/ka-table-toolbar')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-table/ka-table-row-tools/ka-table-row-tools')]);
  }
  useResource() {
    console.log('%c[kamaji2-aurelia-components] loading resource modules', 'color:#8b64cf;font-size:8px;');
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-resource/ka-resource')]);
    this.config.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-resource/ka-resource-toolbar/ka-resource-toolbar')]);
  }
  useConverters() {
    console.log('%c[kamaji2-aurelia-components] loading value converters', 'color:#8b64cf;font-size:8px;');
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
          title:
            item.title ||
            item.label ||
            helpers.capitalize(item.name || item.href),
          moduleId: item.moduleId,
          activationStrategy: 'replace',
          settings: {
            hasLayout: !!item.hasLayout,
            hasLanguages: !!item.hasLanguages,
            authRequired:
              (item.authGroups && item.authGroups.length > 0) ||
              (item.authRoles && item.authRoles.length > 0) ||
              (inherit &&
                inherit.authGroups &&
                inherit.authGroups.length > 0) ||
              (inherit && inherit.authRoles && inherit.authRoles.length > 0) ||
              !!item.authRequired,
            authGroups: item.authGroups || null,
            authRoles: item.authRoles || null
          }
        };
        routes.push(route);
      }
      if (item.nav)
        routes = routes.concat(helpers.routesFromNav(item.nav, item));
    }
    return routes;
  }
};
