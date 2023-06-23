export class LayoutService {
  config = null;
  aside = { show: () => {}, hide: () => {} };
  loader = { show: () => {}, hide: () => {} };
  configure = (config) => { this.config = config; };
}
