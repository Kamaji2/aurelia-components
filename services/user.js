import { inject } from "aurelia-framework";
import { ApiService, AuthService } from "aurelia-components";

@inject(ApiService, AuthService)
export class UserService {
  constructor(api, auth) {
    this.api = api;
    this.auth = auth;
    this.storage = ENVIRONMENT.APP_STORAGE && window[ENVIRONMENT.APP_STORAGE] ? window[ENVIRONMENT.APP_STORAGE] : localStorage;
    // Custom events
    this.events = document.createTextNode(null);
    this.events.dataChanged = new CustomEvent("dataChanged", { detail: this });
  }

  get data() {
    return JSON.parse(this.storage.getItem("user"));
  }
  set data(value) {
    if (value) this.storage.setItem("user", JSON.stringify(value));
    else this.storage.removeItem("user");
    this.events.dispatchEvent(this.events.dataChanged);
  }

  get isAuthenticated() {
    return !!this.auth.accessToken && !!this.data;
  }

  reset() {
    this.data = null;
  }

  fetch() {
    this.data = null;
    return new Promise((resolve, reject) => {
      this.api.get('me?depth=0').then((xhr) => {
        this.data = xhr.response;
        resolve(this);
      }).catch(() => {
        reject("user fetch failed");
      });
    });
  }
}
