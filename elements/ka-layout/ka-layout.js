import { inject, customElement, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { helpers } from 'aurelia-components';

require('./ka-layout.sass');

@customElement('ka-layout')
@inject(Element, Router)
export class KaLayout {
  @bindable() config = null;

  _collapsed = false;
  _intervals = [];

  constructor(element, router) {
    this.element = element;
    this.router = router;
    // Handle click on burger to expand/collapse aside navigation
    document.addEventListener('click', e => {
      if (e.target.closest('.no-toggle')) return;
      if (e.target.classList.contains('expand') || e.target.classList.contains('collapse')) return;
      for (let st of this.element.querySelectorAll('[data-subtool]')) { st.classList.remove('visible'); }
      let isBurger = e.target === this.burgerAside || e.target === this.burgerHeader || (e.target.parentElement && (e.target.parentElement === this.burgerAside || e.target.parentElement === this.burgerHeader));
      if (!isBurger && !this._collapsed && window.innerWidth < 860) this.toggle();
    });
  }

  attached() {
    this.init();
  }
  detached() {
    for (let interval of this._intervals) clearInterval(interval);
  }

  init() {
    if (!this.config) console.warn('[ka-layout] Missing configuration');
    let config = {
      brand: null,
      user: { groups: [], roles: [] },
      profile: null, // { name: '', description: '' }
      navigation: { items: [] },
      toolbar: { items: [] }
    };
    this.config = helpers.deepMerge(config, this.config);
    this.activateBadges(this.config.navigation.items);
    if (window.innerWidth < 860) this.toggle();
  }

  toggle() {
    this._collapsed = !this._collapsed;
    if (this._collapsed) this.element.classList.add('collapsed'); else this.element.classList.remove('collapsed');
  }

  activateBadges(items) {
    for (let item of items) {
      if (item.nav && item.nav.length > 0 && this.authorized(item)) this.activateBadges(item.nav);
      if (!item.badge || !item.badge.promise || !this.authorized(item)) continue;
      let callback = () => {
        new Promise((resolve, reject) => { return item.badge.promise(resolve, reject); }).then(x => {
          item.badge.value = x;
        }).catch(() => { item.badge.value = null; });
      };
      this._intervals.push(setInterval(callback, item.badge.interval || 5000));
      callback();
    }
  }

  subtool(index, $event) {
    $event.stopPropagation();
    let subtool = this.element.querySelector(`[data-subtool="${index}"]`);
    if (!subtool) return;
    subtool.style.right = (window.innerWidth - ($event.currentTarget.getBoundingClientRect().left + $event.currentTarget.getBoundingClientRect().width)) + 'px';
    subtool.classList.toggle('visible');
  }

  authorized(item) {
    let userGroups = this.config.user ? (this.config.user.group || this.config.user.groups || []) : [];
    if (!Array.isArray(userGroups)) userGroups = [userGroups];
    let userGroupsPassed =  !item.authGroups || (item.authGroups && userGroups.some(e => item.authGroups.includes(e)));
    let userRoles = this.config.user ? (this.config.user.role || this.config.user.roles || []) : [];
    if (!Array.isArray(userRoles)) userGroups = [userRoles];
    let userRolesPassed =  !item.authRoles || (item.authRoles && userRoles.some(e => item.authRoles.includes(e.id)));
    return userGroupsPassed && userRolesPassed;
  }

  expand(item) {
    item.collapsed = false;
  }
  collapse(item) {
    item.collapsed = true;
  }
}
