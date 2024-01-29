import { inject } from 'aurelia-framework';
import { ApiService, AuthService } from 'aurelia-components';

@inject(ApiService, AuthService)
export class UserService {
  constructor(api, auth) {
    this.api = api;
    this.auth = auth;
    this.storage = ENVIRONMENT.APP_STORAGE && window[ENVIRONMENT.APP_STORAGE] ? window[ENVIRONMENT.APP_STORAGE] : localStorage;
    // Custom events
    this.events = document.createTextNode(null);
    this.events.dataChanged = new CustomEvent('dataChanged', { detail: this });
  }

  get data() {
    return JSON.parse(this.storage.getItem('user'));
  }
  set data(value) {
    if (value) this.storage.setItem('user', JSON.stringify(value));
    else this.storage.removeItem('user');
    this.events.dispatchEvent(this.events.dataChanged);
  }

  get isAuthenticated() {
    return !!this.auth.accessToken && !!this.data;
  }

  reset() {
    this.data = null;
    this.storage.clear();
  }

  fetch(endpoint = 'me', data = { depth: 0 }) {
    this.data = null;
    return new Promise((resolve, reject) => {
      this.api
        .get(endpoint, data)
        .then((xhr) => {
          this.data = xhr.response;
          return resolve(this);
        })
        .catch(() => {
          reject('user fetch failed');
        });
    });
  }

  hasRole(roles) {
    if (!this.data || !roles) return false;
    let userRoles = this.data.roles || this.data.role || this.data.groups || this.data.group || null;
    if (!Array.isArray(userRoles)) userRoles = [userRoles]; // could be userRoles = [null];
    if (!userRoles.length || !userRoles[0]) return false;
    userRoles = userRoles.map((role) => {
      return (role.value || role.id)?.toString() || role;
    });
    if (!Array.isArray(roles)) roles = [roles];
    return userRoles.some((userRole) => roles.includes(userRole));
  }
}
