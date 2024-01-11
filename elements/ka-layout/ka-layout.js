import { inject, customElement } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { LayoutService, helpers } from 'aurelia-components';

require('./ka-layout.sass');

@customElement('ka-layout')
@inject(Element, LayoutService, Router)
export class KaLayout {
  config = null;
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
    this.layout.loader.show = (message) => {
      this.loaderShow.call(this, message);
    };
    this.layout.loader.hide = () => {
      this.loaderHide.call(this);
    };
    this.layout.configure = (config) => {
      this.configure.call(this, config);
    };
    if (this.layout.config) this.configure(this.layout.config);
    if (window.innerWidth < 860) this.toggle();
  }

  attached() {
  }
  detached() {
    for (let interval of this._intervals) clearInterval(interval);
  }

  configure(config) {
    this.config = helpers.deepMerge({
      brand: null,
      user: { roles: [] },
      profile: null, // { name: '', description: '' }
      navigation: { items: [] },
      toolbar: { items: [] }
    }, config || {});

    const authorized = (item) => {
      let userRoles = this.config.user ? this.config.user.role || this.config.user.roles || [] : [];
      if (!Array.isArray(userRoles)) userRoles = [userRoles];
      return !item.authRoles || (item.authRoles && userRoles.some((e) => item.authRoles.includes(e)));
    };
    const setHiddens = (items) => {
      let hiddens = true;
      for (let item of items) {
        if (authorized(item) && !item.hidden && (item.href || item.call)) {
          item.hidden = false;
        } else if (authorized(item) && !item.hidden && item.nav) {
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
    const activateBadges = (items) => {
      for (let item of items) {
        if (item.nav && item.nav.length > 0 && !item.hidden) activateBadges(item.nav);
        if (!item.badge || !item.badge.promise || item.hidden) continue;
        const callback = () => {
          new Promise((resolve, reject) => {
            return item.badge.promise(resolve, reject);
          }).then((x) => {
            item.badge.value = x;
          }).catch(() => {
            item.badge.value = null;
          });
        };
        this._intervals.push(setInterval(callback, item.badge.interval || 5000));
        callback();
      }
    };
    setHiddens(this.config.navigation.items);
    activateBadges(this.config.navigation.items);
    setHiddens(this.config.toolbar.items);
    this.layout.config = this.config;
    this.initialized = true;
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
  loaderShow(message) {
    if (!this.loader) return;
    this.loaderMessage = message || null;
    this.loader.classList.add('visible');
  }
  loaderHide() {
    if (!this.loader) return;
    this.loaderMessage = null;
    this.loader.classList.remove('visible');
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
  expand(item) {
    item.collapsed = false;
  }
  collapse(item) {
    item.collapsed = true;
  }
}
