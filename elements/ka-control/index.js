import { PLATFORM } from 'aurelia-pal';

export function configure(config) {
  config.globalResources([PLATFORM.moduleName('ka-control/ka-control')]);
  config.globalResources([PLATFORM.moduleName('ka-control-text/ka-control-text')]);
}