import { helpers } from 'aurelia-components';

export class ResourceInterface {
  client = null;
  endpoint = null;
  controls = {};
  schema = {};
  data = {};
  settings = {
    initializeWithDataset: false
  };

  // API Response data parser functions
  parsers = {
    postRequest: (data) => { return data; },
    putRequest: (data) => { return data; },
    patchRequest: (data) => { return data; },
    getResponse: (data) => { return data; },
    postResponse: (data) => { return data; },
    putResponse: (data) => { return data; },
    patchResponse: (data) => { return data; },

    // Only keep data of schema defined fileds for Kamaji API get responses
    getKamajiResponse: (responseData) => {
      if (!this.client.isKamaji) return responseData;
      let data = {};
      Object.keys(this.schema).forEach(field => { if (responseData.hasOwnProperty(field)) data[field] = responseData[field]; });
      return data;
    }
  }

  constructor(config) {
    Object.assign(this, config || {});
    // Custom events
    this.events = document.createTextNode(null);
    this.events.getSuccess = new CustomEvent('getSuccess', { detail: this });
    this.events.getFailure = new CustomEvent('getFailure', { detail: this });
    this.events.postSuccess = new CustomEvent('postSuccess', { detail: this });
    this.events.postFailure = new CustomEvent('postFailure', { detail: this });
    this.events.putSuccess = new CustomEvent('putSuccess', { detail: this });
    this.events.putFailure = new CustomEvent('putFailure', { detail: this });
    this.events.patchSuccess = new CustomEvent('patchSuccess', { detail: this });
    this.events.patchFailure = new CustomEvent('patchFailure', { detail: this });
    // Initialize
    this.initialized = this.initialize();
  }

  initialize() {
    return new Promise((resolve, reject) => {
      if (!this.endpoint || !this.client) return reject('missing endpoint or client configuration, interface won\'t be able to call api endpoints');
      new Promise((resolve, reject) => {
        if (this.settings.initializeWithDataset) {
          this.client.get(`datasets/${this.endpoint}`).then(xhr => {
            let schema = {};
            xhr.response.forEach(control => { schema[control.field] = control; });
            this.schema = (this.schema && Object.keys(this.schema).length) ? helpers.deepMerge(schema, this.schema) : schema;
            resolve();
          }).catch(error => reject(`could not retrieve dataset for ${this.endpoint}`));
        } else resolve();
      }).then(() => {
        if (this.schema && Object.keys(this.schema).length) return resolve();
        else return reject('missing schema configuration');
      }).catch(error => reject(error));
    }).then(() => {
      console.log('[ResourceInterface] Initialized');
    }).catch(error => {
      console.warn(`[ResourceInterface] Initialization failed: ${error}`);
    });
  }

  async get(id) {
    await this.initialized;
    return this.client.get(`${this.endpoint}/${id}`).then(xhr => {
      this.data = this.parsers.getResponse(this.parsers.getKamajiResponse(xhr.response));
      this._data = JSON.parse(JSON.stringify(this.data));
      console.log('[ResourceInterface] GET - Success');
      this.events.dispatchEvent(this.events.getSuccess);
    }).catch(error => {
      console.error('[ResourceInterface] GET - Failure');
      this.events.dispatchEvent(this.events.getFailure);
      throw new ResourceError({ method: 'get', context: 'xhr', message: `${error.statusCode} ${error.statusText}`, detail: error });
    });
  }
  async post(data) {
    await this.initialized;
    return this.save('post', null, data);
  }
  async put(id, data) {
    await this.initialized;
    return this.save('put', id, data);
  }
  async patch(id, data) {
    await this.initialized;
    return this.save('patch', id, data);
  }

  save(method, id, data) {
    return new Promise((resolve, reject) => {
      this.validate().then(() => {
        this.sanitize(data || this.data, method).then(data => {
          this.client[method](this.endpoint + (id ? `/${id}` : ''), this.parsers[`${method}Request`](data)).then(xhr => {
            /*
            // Auto update resource data has been commented out as it gets really complex
            // when sent data has been manipulated by request parser
            if (this.client.isKamaji) {
              this.data = this.parsers[`${method}Response`](this.parsers.getKamajiResponse(xhr.response));
              this._data = JSON.parse(JSON.stringify(this.data));
            }
            */
            resolve();
          }).catch(error => {
            this.parseError(error);
            reject({ context: 'xhr', message: `${error.statusCode} ${error.statusText}`, detail: error });
          });
        }).catch(error => reject(error));
      }).catch(error => reject(error));
    }).then(() => {
      console.log(`[ResourceInterface] ${method.toUpperCase()} - Success`);
      this.events.dispatchEvent(this.events[`${method}Success`]);
    }).catch(error => {
      console.warn(`[ResourceInterface] ${method.toUpperCase()} - Failure`);
      this.events.dispatchEvent(this.events[`${method}Failure`]);
      if (error.name && ['TypeError', 'SyntaxError'].includes(error.name)) {
        error = { context: 'js', message: `${error.name}: ${error.message}`, detail: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))) } 
      }
      throw new ResourceError(Object.assign({ method }, error));
    });
  }
  validate(controls = null) {
    let promises = [];
    controls = controls || Object.values(this.controls);
    controls.forEach(control => {
      control.setError(); // Reset in case there is already an error manually attached to the control
      promises.push(new Promise((resolve, reject) => { control.validate().then(result => { if (result.valid) resolve(); else reject({ context: 'validation', message: `Control "${control.name || control.schema?.label || 'undefined'}" didn't pass validation`, detail: control }); }); }));
    });
    return Promise.all(promises);
  }
  sanitize(data, method) {
    return new Promise((resolve, reject) => {
      data = JSON.parse(JSON.stringify(data));
      if (method === 'patch' && this._data && Object.keys(this._data).length) data = helpers.diffObject(this._data, data, !this.client.isKamaji);
      let promises = [];
      const parseData = (object, path = '') => {
        if (!object) return null;
        for (let key of Object.keys(object)) {
          if (typeof object[key] === 'undefined') continue;
          if (helpers.isObject(object[key])) parseData(object[key], path ? `${path}.${key}` : key);
          else promises.push(new Promise(passed => {
            let control = this.controls[path ? `${path}.${key}` : key];
            // Missing corresponding control object
            if (!control) return passed();
            // Missing corresponding control schema
            if (!control.schema) return passed();
            // Format control file
            if (control.schema.control === 'file' && object[key] && object[key].length && object[key][0] && object[key][0].name) {
              let filedata = { filename: object[key][0].name }, reader = new FileReader();
              reader.readAsDataURL(object[key][0]);
              reader.onload = (x) => {
                filedata.stream = reader.result.indexOf('base64,') ? reader.result.slice(reader.result.indexOf('base64,') + 7) : reader.result;
                object[key] = filedata;
                passed();
              };
              return;
            }
            // Format control json
            if (control.schema.control === 'json' && object[key] && typeof object[key] === 'string') {
              try { object[key] = JSON.parse(object[key]); } catch(error) { console.warn('Error parsing value of json control', error) }
              return passed();
            }
            // Format control editor
            if (control.schema.control === 'editor' && object[key] === '') {
              object[key] = null;
              return passed();
            }
            object[key] = JSON.parse(JSON.stringify(object[key]));
            passed();
          }));
        }
      };
      parseData(data);
      Promise.all(promises).then(() => { if (!data || !Object.keys(data).length) reject({ context: 'sanitization', message: 'No data to be sent', detail: data }); else resolve(data); }).catch(error => { reject(error) });
    });
  }
  parseError(xhr) {
    if (!xhr.response || typeof xhr.response !== 'string' || !xhr.response.startsWith('{')) return;
    let response = JSON.parse(xhr.response);
    // Attempt to handle Kamaji API Error
    if (this.client.isKamaji && response.errors) {
      /* TODO
      for (let error of response.errors) {
        // Gestisci errore formato kamaji
        if (error.arg && Array.isArray(error.arg) && error.arg[0]) this.toast.show(`<strong>${this.schema[error.arg[0]].label}</strong>: ${error.msg}`, 'error');
        else if (error.arg && typeof error.arg === 'object') this.toast.show(`<strong>${this.schema[Object.keys(error.arg)[0]].label}</strong>: ${error.msg}`, 'error');
        // Gestisci errore formato gateway
        else if (error.message) {
          let message = (error.data && this.schema[error.data] ? `<strong>${this.schema[error.data].label}</strong>: ` : '') + error.message;
          this.toast.show(message, 'error');
        }
      }
      */
    }
  }

}

class ResourceError extends Error {
  constructor(info, ...params) {
    super(...params)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResourceError)
    }
    this.name = '[ResourceInterface] Error';
    this.info = info;
  }
}