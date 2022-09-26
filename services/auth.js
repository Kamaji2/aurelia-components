import { inject } from "aurelia-framework";
import { ApiService } from "aurelia-components";

@inject(ApiService)
export class AuthService {
  constructor(api) {
    this.api = api;
    this.api.auth = this.api.auth || this;
    this.storage =
      ENVIRONMENT.APP_STORAGE && window[ENVIRONMENT.APP_STORAGE]
        ? window[ENVIRONMENT.APP_STORAGE]
        : localStorage;
    this.endpoints = {
      authentication: "auth",
      service: "auth/service",
      refresh: "auth/refresh",
      authorization: "auth/sua",
    };
  }

  get accessToken() {
    return this.storage.getItem("access_token");
  }
  set accessToken(value) {
    if (value) this.storage.setItem("access_token", value);
    else this.storage.removeItem("access_token");
  }

  get refreshToken() {
    return this.storage.getItem("refresh_token");
  }
  set refreshToken(value) {
    if (value) this.storage.setItem("refresh_token", value);
    else this.storage.removeItem("refresh_token");
  }

  get authorization() {
    return JSON.parse(this.storage.getItem("authorization"));
  }
  set authorization(value) {
    if (value) this.storage.setItem("authorization", JSON.stringify(value));
    else this.storage.removeItem("authorization");
  }

  reset() {
    this.accessToken = null;
    this.refreshToken = null;
    this.authorization = null;
  }

  login(username, password) {
    this.reset();
    return new Promise((resolve, reject) => {
      this.api
        .post(this.endpoints.authentication, {
          username,
          password,
          grant_type: "password",
        })
        .then((xhr) => {
          this.accessToken = xhr.response.access_token;
          this.refreshToken = xhr.response.refresh_token;
          resolve(this);
        })
        .catch((error) => {
          reject(error);
        });
    }).catch((error) => {
      console.error("Authentication promise error", error);
      throw error;
    });
  }

  service(username, password) {
    this.reset();
    return new Promise((resolve, reject) => {
      this.api
        .post(this.endpoints.authentication, {
          username,
          password,
          grant_type: "password",
        })
        .then((xhr) => {
          if (!xhr.response.service_token)
            return reject("Service token missing");
          this.api
            .post(`${this.endpoints.service}/${xhr.response.service_token}`)
            .then((xhr) => {
              this.accessToken = xhr.response.access_token;
              this.refreshToken = xhr.response.refresh_token;
              resolve(this);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          reject(error);
        });
    }).catch((error) => {
      console.error("Authentication promise error", error);
      throw error;
    });
  }

  authorize(sid, suat) {
    this.reset();
    return new Promise((resolve, reject) => {
      this.api
        .post(this.endpoints.authorization, { sid, suat })
        .then((xhr) => {
          this.accessToken = xhr.response.access_token;
          this.refreshToken = xhr.response.refresh_token;
          this.authorization = { sid, suat };
          resolve(this);
        })
        .catch((error) => {
          reject(error);
        });
    }).catch((error) => {
      console.error("Authorization promise error", error);
      throw error;
    });
  }

  refresh() {
    if (this._refreshPromise) return this._refreshPromise;
    return (this._refreshPromise = new Promise((resolve, reject) => {
      this.api
        .post(`${this.endpoints.refresh}/${this.refreshToken}`)
        .then((xhr) => {
          this.accessToken = xhr.response.access_token;
          this.refreshToken = xhr.response.refresh_token;
          resolve(this);
        })
        .catch((error) => {
          reject(error);
        });
    })
      .catch((error) => {
        console.error("Refresh promise error", error);
        throw error;
      })
      .finally(() => {
        this._refreshPromise = null;
      }));
  }

  logout(referrer = null) {
    this.reset();
    if (referrer) this.referrer = referrer;
  }
}
