import { inject, customElement, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { LayoutService, helpers } from 'aurelia-components';

require('./ka-layout.sass');

@customElement('ka-layout')
@inject(Element, LayoutService, Router)
export class KaLayout {
  @bindable() config = null;

  _collapsed = false;
  _intervals = [];

  constructor(element, layout, router) {
    this.element = element;
    this.layout = layout;
    this.router = router;
    // Handle click on burger to expand/collapse aside navigation
    document.addEventListener('click', (e) => {
      if (e.target.closest('.no-toggle')) return;
      if (e.target.classList.contains('expand') || e.target.classList.contains('collapse')) return;
      for (let st of this.element.querySelectorAll('[data-subtool]')) {
        st.parentElement.classList.remove('visible');
      }
      let isBurger = e.target === this.burgerAside || e.target === this.burgerHeader || (e.target.parentElement && (e.target.parentElement === this.burgerAside || e.target.parentElement === this.burgerHeader));
      if (!isBurger && !this._collapsed && window.innerWidth < 860) this.toggle();
    });
    // Share selected functions to LayoutService
    this.layout.aside.show = () => {
      this.asideShow.call(this);
    };
    this.layout.aside.hide = () => {
      this.asideHide.call(this);
    };
    this.layout.loader.show = () => {
      this.loaderShow.call(this);
    };
    this.layout.loader.hide = () => {
      this.loaderHide.call(this);
    };
    // Initialize
    this.initialize();
  }

  attached() {
  }
  detached() {
    for (let interval of this._intervals) clearInterval(interval);
  }

  initialize() {
    if (!this.config) console.warn('[ka-layout] Missing configuration');
    let config = {
      brand: null,
      user: { roles: [] },
      profile: null, // { name: '', description: '' }
      navigation: { items: [] },
      toolbar: { items: [] }
    };
    config = helpers.deepMerge(config, this.config);
    let setHiddens = (items) => {
      let hiddens = true;
      for (let item of items) {
        if (this.authorized(item) && !item.hidden && item.href) {
          item.hidden = false;
        } else if (this.authorized(item) && !item.hidden && item.nav) {
          item.hidden = setHiddens(item.nav);
        } else {
          item.hidden = true;
        }
        if (item.hidden === false) {
          hiddens = false;
        }
      }
      return hiddens;
    };
    setHiddens(config.navigation.items);
    this.config = config;

    this.activateBadges(this.config.navigation.items);

    this.initialized = true;
    
    if (window.innerWidth < 860) this.toggle();
  }

  toggle() {
    this._collapsed = !this._collapsed;
    if (this._collapsed) this.element.classList.add('collapsed');
    else this.element.classList.remove('collapsed');
  }
  asideShow() {
    this._collapsed = false;
    this.element.classList.remove('collapsed');
  }
  asideHide() {
    this._collapsed = true;
    this.element.classList.add('collapsed');
  }
  loaderShow() {
    if (!this.loader) return;
    this.loader.classList.add('visible');
  }
  loaderHide() {
    if (!this.loader) return;
    this.loader.classList.remove('visible');
  }

  activateBadges(items) {
    for (let item of items) {
      if (item.nav && item.nav.length > 0 && this.authorized(item)) this.activateBadges(item.nav);
      if (!item.badge || !item.badge.promise || !this.authorized(item)) continue;
      let callback = () => {
        new Promise((resolve, reject) => {
          return item.badge.promise(resolve, reject);
        })
          .then((x) => {
            item.badge.value = x;
          })
          .catch(() => {
            item.badge.value = null;
          });
      };
      this._intervals.push(setInterval(callback, item.badge.interval || 5000));
      callback();
    }
  }

  subtool(index, $event) {
    $event.stopPropagation();
    let subtool = this.element.querySelector(`[data-subtool="${index}"]`);
    if (!subtool) return;
    subtool.style.right = window.innerWidth - ($event.currentTarget.getBoundingClientRect().left + $event.currentTarget.getBoundingClientRect().width) + 'px';

    // Remove class visible
    if (this.element.querySelectorAll(`ul[data-subtool]:not([data-subtool="${index}"])`)) {
      this.element.querySelectorAll(`ul[data-subtool]:not([data-subtool="${index}"])`).forEach((x) => {
        if (x.parentElement.classList.contains('visible')) x.parentElement.classList.remove('visible');
      });
    }
    // Toggle class visible
    subtool.parentElement.classList.toggle('visible');
  }

  authorized(item) {
    let userRoles = this.config.user ? this.config.user.role || this.config.user.roles || [] : [];
    if (!Array.isArray(userRoles)) userRoles = [userRoles];
    return !item.authRoles || (item.authRoles && userRoles.some((e) => item.authRoles.includes(e)));
  }

  expand(item) {
    item.collapsed = false;
  }
  collapse(item) {
    item.collapsed = true;
  }
}
