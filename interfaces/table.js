import { helpers } from 'aurelia-components';
import { v5 as uuidv5 } from 'uuid';
import { DateTime } from 'luxon';

export class TableInterface {
  client = null;
  endpoint = null;
  data = null;
  query = null;
  filters = null; // String "date_created>=1981-09-25&status=active"
  meta = 1;
  limit = 10;
  offset = 0;
  total = 0;
  sort = null; // Array of json objects [{ name: 'field_name', order: 'asc'||'desc'}]
  // status helpers
  isLoading = false;
  isFailed = false;
  isActive = false;

  // Data parser functions
  parsers = {
    getRequest: (data) => {
      return data;
    }
  };

  constructor(config) {
    Object.assign(this, config || {});
    this.uuid = uuidv5('tableInterface:' + location.pathname + ':' + helpers.stringify(config), '2af1d572-a35c-4248-a38e-348c560cd468');
    console.debug(`[TableInterface] UUID ${this.uuid}`);
    this.storage = ENVIRONMENT.APP_STORAGE && window[ENVIRONMENT.APP_STORAGE] ? window[ENVIRONMENT.APP_STORAGE] : localStorage;
    // Custom events
    this.events = document.createTextNode(null);
    this.events.load = new CustomEvent('load', { detail: this });
    this.events.loadSuccess = new CustomEvent('loadSuccess', { detail: this });
    this.events.loadFailure = new CustomEvent('loadFailure', { detail: this });
    // Initialize
    this._initialize = this.initialize();
  }

  initialize() {
    if (this._initialize) return this._initialize;
    return new Promise((resolve, reject) => {
      if (!this.endpoint || !this.client) return reject("missing endpoint or client configuration, interface won't be able to call api endpoints");
      this.initialized = true;
      resolve();
    }).then(() => {
      Object.assign(this, JSON.parse(this.storage.getItem(`${this.uuid}-position`)) || {});
      console.debug(`[TableInterface][${this.uuid}] Initialized`);
    }).catch((error) => {
      console.warn(`[TableInterface][${this.uuid}] Initialization failed: ${error}`);
    });
  }

  async load(params = null, sort = null) {
    await this._initialize;
    this.isLoading = true;
    this.isFailed = false;
    this.isActive = true;
    // Handle query params
    let query = new URLSearchParams('');
    if (params) {
      query = new URLSearchParams(this.query || '');
      for (const [key, value] of Object.entries(params)) {
        query.set(key, value);
      }
    } else if (this._query) {
      query = new URLSearchParams(this._query);
    } else if (this.query) {
      query = new URLSearchParams(this.query);
    }
    this._query = query.toString();

    // Handle filters (aka prefilters)
    if (this.filters) {
      let filters = query.has('filters') ? `(${decodeURIComponent(query.get('filters'))})&` : '';
      query.set('filters', `${filters}(${this.filters})`);
    }

    // Handle meta
    if (this.meta) query.set('meta', this.meta);

    // Handle sort
    this.sort = sort || this.sort || [];
    let sorts = [];
    this.sort.forEach((item) => {
      sorts.push(`${item.order === 'desc' ? '-' : ''}${item.name}`);
    });
    if (sorts.length) {
      sorts = sorts.join(',');
      query.set('sort', sorts);
    }

    // Handle limit and offset
    if (this.limit) query.set('limit', this.limit);
    if (this.offset) query.set('offset', this.offset);

    // Finally make the api call
    this.events.dispatchEvent(this.events.load);
    let data = this.parsers.getRequest(Object.fromEntries(new URLSearchParams(query)));
    return this.client
      .get(`${this.endpoint}`, data)
      .then((xhr) => {
        this.data = this.parseResponse(xhr.response);
        this.total = xhr.headers && xhr.headers.headers && xhr.headers.headers['x-total-count'] ? xhr.headers.headers['x-total-count'].value : this.data.length;
        this.storage.setItem(`${this.uuid}-position`, JSON.stringify({ limit: this.limit, offset: this.offset, sort: this.sort }));
        console.debug(`[TableInterface][${this.uuid}] Load - Success`);
        this.isLoading = false;
        this.events.dispatchEvent(this.events.loadSuccess);
        return xhr;
      },
      (xhr) => {
        //TODO: this.client.dialogError(xhr, this.searchInterface?.controls || {});
        this.data = [];
        this.total = 0;
        console.error(`[TableInterface][${this.uuid}] Load - Failure`);
        console.error(xhr.response);
        this.isLoading = false;
        this.isFailed = true;
        this.events.dispatchEvent(this.events.loadFailure);
      })
      .catch((error) => {
        console.error(error);
        this.data = null;
      });
  }

  parseResponse(response) {
    return response;
  }
}
export class TableSearchInterface {
  controls = {};
  schema = {};
  data = {};
  settings = {
    initializeWithDataset: false
  };

  constructor(config) {
    Object.assign(this, config || {});
    this.uuid = uuidv5('tableSearchInterface:' + location.pathname + ':' + helpers.stringify(config), '2af1d572-a35c-4248-a38e-348c560cd468');
    console.debug(`[TableSearchInterface] UUID ${this.uuid}`);
    this.storage = ENVIRONMENT.APP_STORAGE && window[ENVIRONMENT.APP_STORAGE] ? window[ENVIRONMENT.APP_STORAGE] : localStorage;
    // Get session stored data
    this.data = JSON.parse(this.storage.getItem(`${this.uuid}-data`)) || this.data || {};
    // Initialize
    this._initialize = this.initialize();
  }

  initialize() {
    if (this._initialize) return this._initialize;
    return new Promise((resolve, reject) => {
      const solve = () => {
        this.initialized = true;
        setTimeout(() => {
          resolve();
        }, 500);
      };
      if (!this.table) return reject("missing table reference, interface won't work as expected");
      // Self reference inside TableInterface
      this.table.searchInterface = this;
      return new Promise((resolve, reject) => {
        if (this.settings.initializeWithDataset) {
          this.table.client
            .get(`datasets/${this.table.endpoint}`)
            .then((xhr) => {
              let schema = {};
              xhr.response.forEach((control) => {
                schema[control.field] = control;
              });
              this.schema = this.schema && Object.keys(this.schema).length ? helpers.deepMerge(schema, this.schema) : schema;
              resolve();
            })
            .catch((error) => {
              console.error(error);
              reject(`could not retrieve dataset for ${this.table.endpoint}`);
            });
        } else resolve();
      })
        .then(() => {
          if (this.schema && Object.keys(this.schema).length) {
            Object.values(this.schema).forEach((control) => {
              control.readonly = false;
              control.required = false;
              control.datamultiple = true;
            });
            return solve();
          } else return reject('missing schema configuration');
        })
        .catch((error) => reject(error));
    })
      .then(() => {
        console.debug(`[TableSearchInterface][${this.uuid}] Initialized`);
      })
      .catch((error) => {
        console.warn(`[TableSearchInterface][${this.uuid}] Initialization failed: ${error}`);
      });
  }

  async validate(controls = null) {
    await this._initialize;
    let promises = [];
    controls = controls || Object.values(this.controls);
    controls.forEach((control) => {
      if (control) {
        // Control can be null if in the meantime view removes it (eg: with an if.bind)
        control.setError(); // Reset in case there is already an error manually attached to the control
        promises.push(new Promise((resolve, reject) => {
          control
            .validate()
            .then((result) => {
              if (result.valid) resolve();
              else reject("control didn't pass validation");
            })
            .catch((error) => reject(error));
        }));
      }
    });
    return Promise.all(promises);
  }

  async search(params = {}, data = null) {
    await this._initialize;
    return new Promise((resolve, reject) => {
      this.validate()
        .then(() => {
          let filters = [];
          for (let [k, v] of Object.entries(data || this.data)) {
            if (v && v !== 'null' && this.schema[k]) {
              let operator = this.controls[k] ? this.controls[k].element?.getAttribute('operator') || '=' : '=';
              // Format data for datetime
              if (this.schema[k].control === 'datetime' && ['>', '>='].includes(operator)) {
                v = DateTime.fromISO(v, { setZone: true }).toLocal();
                v = v.isValid ? v.startOf('day').toUTC().toSQL({ includeOffset: false }) : null;
              } else if (this.schema[k].control === 'datetime' && ['<', '<='].includes(operator)) {
                v = DateTime.fromISO(v, { setZone: true }).toLocal();
                v = v.isValid ? v.endOf('day').toUTC().toSQL({ includeOffset: false }) : null;
              }
              // Format data for date range
              if (this.schema[k].control === 'date' && this.controls[k].isRange) {
                let [v1, v2] = v.split('<=>');
                v1 = DateTime.fromFormat(v1, 'yyyy-MM-dd').isValid ? v1 : null;
                v2 = DateTime.fromFormat(v2, 'yyyy-MM-dd').isValid ? v2 : null;
                if (v1) filters.push(`${k}>=${v1}`);
                if (v2) filters.push(`${k}<=${v2}`);
                continue;
                // Format data for other range types
              } else if (this.controls[k].isRange) {
                let [v1, v2] = v.split('<=>');
                if (v1) filters.push(`${k}>=${v1}`);
                if (v2) filters.push(`${k}<=${v2}`);
                continue;
              }
              filters.push(`${k}${operator}${v}`);
            }
          }
          if (filters.length) params.filters = params.filters ? `(${params.filters})&(${filters.join('&')})` : filters.join('&');
          if (this.storage.getItem(`${this.uuid}-data`) !== JSON.stringify(this.data)) {
            this.storage.setItem(`${this.uuid}-data`, JSON.stringify(this.data));
            this.table.offset = 0; // Reset offset only if search data has changed
          }
          this.table
            .load(params)
            .then((xhr) => resolve(xhr))
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });
  }

  async reset(soft = false) {
    await this._initialize;
    for (let key of Object.keys(this.data)) {
      this.data[key] = null;
    }
    if (!soft) {
      this.storage.removeItem(`${this.uuid}-data`);
      this.table.offset = 0;
      return this.table.load({});
    } else {
      return Promise.resolve();
    }
  }
}
/* 
export class SearchInterface {
  active = false; // Used for highlighting search icon on table
  inizialized = false;
  configurables = ['name', 'table', 'schema', 'data'];
  controls = {}; // Contains auto-referenced controls
  last = { params: {} } // Reference to last search query

  constructor(config) {
    // Thisify config
    for (let attribute of this.configurables) {
      if (typeof config[attribute] !== 'undefined') {
        this[attribute] = config[attribute];
      } else if (typeof this[attribute] === 'undefined') throw new Error(`SearchInterface construct fail! Missing required configuration attribute '${attribute}'`);
    }
    // Get session stored data
    this.data = JSON.parse(this.storage.getItem(`${this.name}-data`)) || this.data || {};
    // Self reference inside TableInterface
    if (this.table) this.table.searchInterface = this;
  }

  initialize() {
    let promises = []; // promises.push(this.api.get());
    return Promise.all(promises).then(xhrs => {
      this.initialized = true;
    }).catch(error => {
      console.error('SearchInterface initialization failed', error);
    });
  }

  validate(controls = null) {
    let promises = [];
    controls = controls || Object.values(this.controls);
    console.log('Controls to validate', controls);
    controls.forEach(control => {
      if (control) { // Control can be null if in the meantime view removes it (eg: with an if.bind)
        console.log('Validate control', control);
        if (control.setError) control.setError(); // Reset in case control is a ka-control (not ka-input) and there is already an error manually attached to the control
        promises.push(new Promise((resolve, reject) => { control.validate().then(result => { if (result.valid) resolve(); else reject('Control didn\'t pass validation'); }).catch(error => reject(error)); }));
      }
    });
    return Promise.all(promises);
  }

  search() {
    if (!this.initialized) return Promise.reject('SearchInterface was not yet initialized when the search() function was called!');
    let params = {};
    return new Promise((resolve, reject) => {
      this.validate().then(() => {
        for (let [k,v] of Object.entries(this.data)) {
          if (v && v !== 'null' && this.schema[k]?.query) {
            if (this.schema[k].control === 'date' && this.schema[k].query.includes('-gte')) {
              v = moment.utc(v).local().startOf('day').utc().format();
            } else if (this.schema[k].control === 'date' && this.schema[k].query.includes('-lte')) {
              v = moment.utc(v).local().endOf('day').utc().format();
            }
            params[this.schema[k].query] = encodeURIComponent(v);
          }
        }
        if (Object.keys(params).length) {
          this.storage.setItem(`${this.name}-data`, JSON.stringify(this.data));
          this.table.offset = 0;
          this.active = true;
          this.last.params = params;
          this.table.load(params).then(xhr => resolve(xhr)).catch(error => reject(error));
        } else {
          this.storage.setItem(`${this.name}-data`, JSON.stringify(this.data));
          this.table.offset = 0;
          this.active = false;
          this.last.params = {};
          this.table.load({}).then(xhr => resolve(xhr)).catch(error => reject(error)); //return this.reset(); // Not sure what it is for...
        }
      }).catch(error => reject(error));
    });
  }

  reset(soft = false) {
    for (let key of Object.keys(this.data)) { this.data[key] = null; }
    if (!soft) {
      this.storage.removeItem(`${this.name}-data`);
      this.table.offset = 0;
      this.active = false;
      this.last.params = {};
      return this.table.load({});
    } else {
      return Promise.resolve();
    }
  }
} */
/* 
@inject(CompositionEngine, Container)
export class TableSidebar {
  constructor(compositionEngine, container) {
    this.compositionEngine = compositionEngine;
    this.container = container;
  }
  open(params) {
    if (this.isOpen) return this.close();

    // Add backdrop
    this.backdrop = document.createElement('div');
    this.backdrop.classList.add('md-table-backdrop');
    this.backdrop.addEventListener('click', event => { if (event.target === this.backdrop) this.close(); });
    document.getElementsByTagName('body')[0].insertBefore(this.backdrop, document.getElementsByTagName('body')[0].children[0]);

    // Add sidebar
    this.sidebar = document.createElement('div');
    this.sidebar.classList.add('md-table-sidebar', 'off');
    this.backdrop.appendChild(this.sidebar);

    // Compose
    this.context = {
      container: this.container.createChild(),
      viewModel: params.viewModel,
      model: params.viewModelParams,
      host: this.sidebar,
      bindingContext: null,
      viewResources: null,
      viewSlot: new ViewSlot(this.sidebar, true)
    };
    this.compositionEngine.compose(this.context).then(composition => {
      this.composition = composition;
      this.composition.viewModel.close = () => { this.close(); };
      this.context.viewSlot.attached();
      // Timeout used for css transition
      setTimeout(() => { this.sidebar.classList.remove('off'); }, 100);
      this.isOpen = true;
    });
  }
  close() {
    // Timeout used for css transition
    this.sidebar.classList.add('off');
    setTimeout(() => {
      document.getElementsByTagName('body')[0].removeChild(this.backdrop);
      this.context.viewSlot.detached();
      this.isOpen = false;
    }, 500);
  }
}
 */
