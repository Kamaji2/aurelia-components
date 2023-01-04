import { helpers } from 'aurelia-components';
import { v5 as uuidv5 } from 'uuid';

export class ResourceInterface {
  client = null;
  endpoint = null;
  controls = {};
  schema = {};
  data = {};
  settings = {
    initializeWithDataset: false
  };
  // status helpers
  isLoading = false;
  isFailed = false;
  isActive = false;

  // API Response data parser functions
  parsers = {
    postRequest: (data) => {
      return data;
    },
    putRequest: (data) => {
      return data;
    },
    patchRequest: (data) => {
      return data;
    },
    getResponse: (data) => {
      return data;
    },
    postResponse: (data) => {
      return data;
    },
    putResponse: (data) => {
      return data;
    },
    patchResponse: (data) => {
      return data;
    },

    // Only keep data of schema defined fields for Kamaji API get responses
    getKamajiResponse: (responseData) => {
      if (!this.client.isKamaji) return responseData;
      let data = {};
      Object.keys(this.schema).forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(responseData, field))
          data[field] = responseData[field];
      });
      return data;
    }
  };

  constructor(config) {
    Object.assign(this, config || {});
    this.uuid = uuidv5('resourceInterface:' + location.pathname + ':' + config.endpoint, '2af1d572-a35c-4248-a38e-348c560cd468');
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
    if (this.initialized) return this.initialized;
    return new Promise((resolve, reject) => {
      if (!this.endpoint || !this.client) return reject("missing endpoint or client configuration, interface won't be able to call api endpoints");
      return new Promise((resolve, reject) => {
        if (this.settings.initializeWithDataset) {
          this.client.get(`datasets/${this.endpoint}`).then((xhr) => {
            let schema = {}, data = {};
            xhr.response.forEach((control) => {
              schema[control.field] = control;
              data[control.field] = null;
            }); 
            this.schema = this.schema && Object.keys(this.schema).length ? helpers.deepMerge(schema, this.schema) : schema;
            this.data = this.data && Object.keys(this.data).length ? helpers.deepMerge(data, this.data) : data;
            resolve();
          }).catch((error) => {
            console.error(error);
            reject(`could not retrieve dataset for ${this.endpoint}`);
          });
        } else resolve();
      }).then(() => {
        if (this.schema && Object.keys(this.schema).length) return resolve();
        else return reject('missing schema configuration');
      }).catch((error) => reject(error));
    }).then(() => {
      console.log('[ResourceInterface] Initialized');
    }).catch((error) => {
      console.warn(`[ResourceInterface] Initialization failed: ${error}`);
    });
  }

  async get(id, data = {}) {
    await this.initialized;
    this.isLoading = true;
    this.isFailed = false;
    this.isActive = true;
    this.id = null;
    data = Object.assign((this.client.isKamaji ? { depth: 0 } : {}), data);
    return this.client.get(`${this.endpoint}` + (id ? `/${id}` : ''), data).then((xhr) => {
      this.data = this.parsers.getResponse(this.parsers.getKamajiResponse(xhr.response));
      this._data = JSON.parse(JSON.stringify(this.data));
      this.id = id;
      console.log('[ResourceInterface] GET - Success');
      this.isLoading = false;
      // Prepare and dispatch success event
      this.events[`getSuccess`] = new CustomEvent(`getSuccess`, { detail: this.data });
      this.events.dispatchEvent(this.events[`getSuccess`]);
    }).catch((error) => {
      console.error('[ResourceInterface] GET - Failure', error);
      this.isLoading = false;
      this.isFailed = true;
      this.events.dispatchEvent(this.events.getFailure);
      throw new ResourceError({
        method: 'get',
        context: 'xhr',
        message: `${error.statusCode} ${error.statusText}`,
        detail: error
      });
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
    if (!id && (this.id || this.id === undefined)) id = this.id;
    if (!data && this.data) data = this.data;
    if (!method) method = id || id === undefined ? 'patch' : 'post';
    return new Promise((resolve, reject) => {
      this.validate().then(() => {
        this.sanitize(data, method).then((data) => {
          this.client[method](this.endpoint + (id ? `/${id}` : ''), this.parsers[`${method}Request`](data)).then((xhr) => {
            resolve(xhr);
          }).catch((error) => {
            reject(this.parseError(error) || {
              context: 'xhr',
              message: `${error.statusCode} ${error.statusText}`,
              detail: error
            });
          });
        }).catch((error) => reject(error));
      }).catch((error) => reject(error));
    }).then((xhr) => {
      console.log(`[ResourceInterface] ${method.toUpperCase()} - Success`);
      this.isLoading = false;
      // Prepare and dispatch success event
      this.events[`${method}Success`] = new CustomEvent(`${method}Success`, { detail: xhr.response });
      this.events.dispatchEvent(this.events[`${method}Success`]);
      return xhr;
    }).catch((error) => {
      console.warn(`[ResourceInterface] ${method.toUpperCase()} - Failure`);
      this.isLoading = false;
      this.isFailed = true;
      // Prepare and dispatch failure event
      this.events[`${method}Failure`] = new CustomEvent(`${method}Failure`, { detail: error });
      this.events.dispatchEvent(this.events[`${method}Failure`]);
      // Prepare and throw custom ResourceError
      if (error.name && ['TypeError', 'SyntaxError', 'ReferenceError'].includes(error.name)) {
        error = {
          context: 'js',
          message: `${error.name}: ${error.message}`,
          detail: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))),
          original: error
        };
      }
      throw new ResourceError(Object.assign({ method }, error));
    });
  }
  validate(controls = null) {
    let promises = [];
    controls = controls || Object.values(this.controls);
    controls.forEach((control) => {
      control.setError(); // Reset in case there is already an error manually attached to the control
      promises.push(new Promise((resolve, reject) => {
        control.validate().then((result) => {
          if (result.valid) resolve();
          else {
            let message = control.validator?.errors?.length ? control.validator.errors[0].message : null;
            let label = control.schema?.label || control.schema?.field || control.name || null;
            if (message) {
              reject({
                context: 'validation',
                message: (label ? `${label}: ` : '') + message,
                detail: control
              });
            } else {
              reject({
                context: 'validation',
                message: `Control "${control.name || control.schema?.label || 'undefined'}" didn't pass validation`,
                detail: control
              });
            }
          }
        });
      }));
    });
    return Promise.all(promises);
  }
  sanitize(data, method) {
    return new Promise((resolve, reject) => {
      data = JSON.parse(JSON.stringify(data));
      if (method === 'patch' && this._data && Object.keys(this._data).length)
        data = helpers.diffObject(this._data, data, !this.client.isKamaji);
      let promises = [];
      const parseData = (object, path = '') => {
        if (!object) return null;
        for (let key of Object.keys(object)) {
          if (typeof object[key] === 'undefined') continue;
          if (helpers.isObject(object[key])) {
            parseData(object[key], path ? `${path}.${key}` : key);
          } else {
            promises.push(new Promise((passed) => {
              let control = this.controls[path ? `${path}.${key}` : key];
              // Missing corresponding control object
              if (!control) return passed();
              // Missing corresponding control schema
              if (!control.schema) return passed();
              // Format control file
              if (control.schema.control === 'file' && object[key] && object[key].length && object[key][0] && object[key][0].name) {
                let filedata = { filename: object[key][0].name }, reader = new FileReader();
                reader.readAsDataURL(object[key][0]);
                reader.onload = () => {
                  filedata.stream = reader.result.indexOf('base64,')? reader.result.slice(reader.result.indexOf('base64,') + 7): reader.result;
                  object[key] = filedata;
                  passed();
                };
                return;
              }
              // Format control json
              if (control.schema.control === 'json' && object[key] && typeof object[key] === 'string') {
                try {
                  object[key] = JSON.parse(object[key]);
                } catch (error) {
                  console.warn('Error parsing value of json control', error);
                }
                return passed();
              }
              // Format control editor
              if (control.schema.control === 'editor' && object[key] === '') {
                object[key] = null;
                return passed();
              }
              // Format control number
              if (control.schema.control === 'number' && this.client.isKamaji && object[key]) {
                object[key] = parseFloat(object[key]) || object[key];
                return passed();
              }
              object[key] = JSON.parse(JSON.stringify(object[key]));
              passed();
            }));
          }
        }
      };
      parseData(data);
      Promise.all(promises).then(() => {
        if (!data || !Object.keys(data).length) {
          reject({
            context: 'sanitization',
            message: 'No data to be sent',
            detail: data
          });
        } else resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }
  parseError(xhr) {
    let response;
    if (!xhr.response) return;
    if (typeof xhr.response === 'string' || xhr.response.startsWith('{')) {
      try {
        response = JSON.parse(xhr.response);
      } catch (error) {
        return;
      }
    } else {
      response = xhr.response;
    }
    // Attempt to handle Kamaji API Error
    if (response.errors && response.errors[0] && response.errors[0].msg) {
      // Handle server 4xx error codes
      if (response.errors[0].num && String(response.errors[0].num).match(/^4[0-9]{2}$/)) {
        let label, field = Object.keys(response.errors[0].arg)[0] || null;
        if (this.controls[field]) {
          label = this.controls[field].schema?.label || this.controls[field].schema?.field || this.controls[field].name || null;
          this.controls[field].setError(response.errors[0].msg);
        }
        return {
          context: 'validation',
          message: (label ? `${label}: ` : '') + response.errors[0].msg,
          detail: response.errors[0]
        }
      }
    }
  }
}

class ResourceError extends Error {
  constructor(info, ...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResourceError);
    }
    this.name = '[ResourceInterface] Error';
    this.info = info;
  }
}
