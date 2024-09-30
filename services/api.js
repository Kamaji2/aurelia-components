import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { HttpClient } from 'aurelia-http-client';

@inject(Router)
export class ApiService {
  /**
   * @deprecated 
   */
  language = null;

  constructor(router) {
    this.router = router;
    this.isKamaji = true;
    this.isOffline = false;

    this.storage = ENVIRONMENT.APP_STORAGE && window[ENVIRONMENT.APP_STORAGE] ? window[ENVIRONMENT.APP_STORAGE] : localStorage;
    this.baseUrl = this.storage.getItem('APP_KAMAJI_BASE_URL') || ENVIRONMENT.APP_KAMAJI_BASE_URL || this.storage.getItem('APP_API_BASE_URL') || ENVIRONMENT.APP_API_BASE_URL;

    this.auth = null; // If needed, this will be referenced by the AuthService class itself

    this.client = new HttpClient();
    this.client.configure((x) => {
      x.withBaseUrl(this.baseUrl);
      x.withInterceptor({
        request: (msg) => {
          if (this.auth && this.auth.accessToken && !msg.url.startsWith(this.baseUrl + this.auth.endpoints.refresh) && !msg.headers.has('Authorization')) {
            msg.headers.add('Authorization', 'Bearer ' + this.auth.accessToken);
          }

          /**
           * @deprecated 
           */
          if (this.language && !msg.headers.has('Accept-Language')) {
            msg.headers.add('Accept-Language', this.language);
          }

          this.runRequestInterceptorTasks(msg);
          return msg;
        },
        response: (msg) => {
          if (String(msg.statusCode) !== '204' && msg.responseType === 'json' && typeof msg.response === 'string') {
            msg.response = JSON.parse(msg.response);
          }
          return msg;
        },
        responseError: (msg) => {
          if (msg.statusCode === 0 && (!msg.responseType || msg.responseType !== 'abort')) {
            //net::ERR_FAILED
            this.isOffline = true;
            console.debug(msg);
            console.warn('net::ERR_FAILED intercepted! Retry in 5 seconds... ');
            return new Promise((resolve) => {
              setTimeout(() => {
                this.client.send(msg.requestMessage).then((xhr) => {
                  this.isOffline = false;
                  resolve(xhr);
                });
              }, 5000);
            });
          }
          if (msg.statusCode === 401) {
            if (!this.auth) return Promise.reject(msg);
            const requestedUrl = msg.requestMessage.url;
            const referrerFragment = this.getRouteFragment(requestedUrl);
            console.debug(`[ApiService] referrerFragment = ${referrerFragment}`);
            if (!this.auth.refreshToken) {
              this.auth.logout(referrerFragment);
              this.routeToLogout();
            } else if (!this.isRefreshUrl(requestedUrl)) {
              return this.auth.refresh().then(() => {
                msg.requestMessage.headers.add('Authorization', 'Bearer ' + this.auth.accessToken);
                return this.client.send(msg.requestMessage);
              }).catch((error) => {
                this.auth.logout(referrerFragment);
                this.routeToLogout();
                throw error;
              });
            }
          }
          return Promise.reject(msg);
        }
      });
    });
  }

  addRequestInterceptorTask(name, func) {
    if (!this.requestInterceptorTasks) this.requestInterceptorTasks = {};
    this.requestInterceptorTasks[name] = func;
  }
  removeRequestInterceptorTask(name) {
    if (!this.requestInterceptorTasks) return;
    delete this.requestInterceptorTasks[name];
  }
  runRequestInterceptorTasks(msg) {
    if (!this.requestInterceptorTasks) return;
    Object.values(this.requestInterceptorTasks).forEach((func) => func.call(this, msg));  
  }

  get(endpoint, params) {
    let queryString = typeof params === 'object' ? '?' + this.buildQueryString(params) : '';
    return this.client.get(this.baseUrl + endpoint + queryString);
  }

  post(endpoint, data) {
    return this.client.post(this.baseUrl + endpoint, data);
  }

  put(endpoint, data) {
    return this.client.put(this.baseUrl + endpoint, data);
  }

  patch(endpoint, data) {
    return this.client.patch(this.baseUrl + endpoint, data);
  }

  delete(endpoint) {
    return this.client.delete(this.baseUrl + endpoint);
  }

  buildQueryString(params) {
    let query = [];
    for (let [key, value] of Object.entries(params)) query.push(`${key}=` + encodeURIComponent(value));
    return query.join('&');
  }

  routeToLogout() {
    try {
      if (this.router.routes.find((x) => x.route.includes('logout'))) this.router.navigate('logout');
      else if (this.router.routes.find((x) => x.name === 'logout' || x.href === 'logout')) this.router.navigateToRoute('logout');
      else if (this.router.routes.find((x) => x.route.includes('login'))) this.router.navigate('login');
      else if (this.router.routes.find((x) => x.name === 'login' || x.href === 'login')) this.router.navigateToRoute('login');
    } catch (error) {
      console.error(error);
    }
  }

  isAuthenticationUrl(url) {
    return url === this.baseUrl + this.auth.endpoints.authentication;
  }
  isRefreshUrl(url) {
    return url.startsWith(this.baseUrl + this.auth.endpoints.refresh);
  }
  getRouteFragment(url) {
    if (this.isAuthenticationUrl(url)) return null;
    const fragment = this.router?.currentInstruction?.fragment || null;
    if (['login', 'logout'].includes(fragment.replace(/[^\w]/g, ''))) return null;
    return fragment;
  }
}
