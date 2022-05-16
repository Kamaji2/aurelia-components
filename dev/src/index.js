import '@babel/polyfill';
import { PLATFORM } from 'aurelia-pal';

export function configure (aurelia) {

  console.log('%c[app-init]', 'color:darkorange;font-weight:bold;', 'aurelia initialization started');

  const storage = ENVIRONMENT.APP_STORAGE && window[ENVIRONMENT.APP_STORAGE] ? window[ENVIRONMENT.APP_STORAGE] : localStorage;

  aurelia.use
  .standardConfiguration()
  //.globalResources([PLATFORM.moduleName('aurelia-components/elements/ka-control/ka-control/ka-control')])
  .plugin(PLATFORM.moduleName('aurelia-components'))
  .plugin(PLATFORM.moduleName('aurelia-http-client'))
  .plugin(PLATFORM.moduleName('aurelia-dialog'))
  .plugin(PLATFORM.moduleName('aurelia-validation'));

  aurelia.use.developmentLogging(ENVIRONMENT.APP_DEBUG === 'true' ? 'debug' : 'warn');
  
  aurelia.start().then(() => {
    console.log('%c[app-init]', 'color:darkorange;font-weight:bold;', 'aurelia application started');
    aurelia.setRoot(PLATFORM.moduleName('views/app/app'), document.body);
  });
}
