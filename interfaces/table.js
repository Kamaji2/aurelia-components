import { helpers } from 'aurelia-components';
import { Parser } from 'aurelia-framework';
import { v5 as uuidv5 } from 'uuid';
import { DateTime } from 'luxon';

export class TableInterface {
  client = null;
  endpoint = null;
  data = null;
  query = null;
  filters = null; // String "date_created>=1981-09-25&status=active"
  fields = null; // String "id,date_created,name,surname"
  meta = 1;
  depth = null;
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

  get URL() {
    return this.queryUrl || null;
  }

  constructor(config) {
    Object.assign(this, config || {});
    this.uuid = uuidv5('tableInterface:' + location.pathname + ':' + helpers.stringify(config), '2af1d572-a35c-4248-a38e-348c560cd468');
    console.debug(`[TableInterface] UUID ${this.uuid}`);
    this.storage = ENVIRONMENT.APP_STORAGE && window[ENVIRONMENT.APP_STORAGE] ? window[ENVIRONMENT.APP_STORAGE] : localStorage;
    // Custom events
    this.events = document.createTextNode(null);
    this.events.load = new CustomEvent('load', { detail: { interface: this } });
    this.events.loadSuccess = new CustomEvent('loadSuccess', { detail: { interface: this } });
    this.events.loadFailure = new CustomEvent('loadFailure', { detail: { interface: this } });

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

    // Handle fields
    if (this.fields) {
      let fields = query.has('fields') ? `${decodeURIComponent(query.get('fields'))},` : '';
      query.set('fields', `${fields}${this.fields}`);
    }

    // Handle meta
    if (this.meta) query.set('meta', this.meta);

    // Handle depth
    if (this.depth) query.set('depth', this.depth);

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
    return this.client.get(`${this.endpoint}`, data).then((xhr) => {
      this.queryUrl = xhr.requestMessage.url;
      this.data = this.parseResponse(xhr.response);
      this.total = xhr.headers && xhr.headers.headers && xhr.headers.headers['x-total-count'] ? xhr.headers.headers['x-total-count'].value : this.data.length;
      this.storage.setItem(`${this.uuid}-position`, JSON.stringify({ limit: this.limit, offset: this.offset, sort: this.sort }));
      console.debug(`[TableInterface][${this.uuid}] Load - Success`);
      this.isLoading = false;
      this.events.loadSuccess.detail.xhr = xhr;
      this.events.loadSuccess.detail.data = this.data;
      this.events.dispatchEvent(this.events.loadSuccess);
      return xhr;
    }, (xhr) => {
      //TODO: this.client.dialogError(xhr, this.searchInterface?.controls || {});
      this.data = [];
      this.total = 0;
      console.error(`[TableInterface][${this.uuid}] Load - Failure`);
      console.error(xhr.response);
      this.isLoading = false;
      this.isFailed = true;
      this.events.loadFailure.detail.xhr = xhr;
      this.events.dispatchEvent(this.events.loadFailure);
    }).catch((error) => {
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
    this._config = JSON.parse(helpers.stringify(config)); // Keep a copy of original config
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
        setTimeout(() => { resolve(); }, 500);
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
            for (const [key, control] of Object.entries(this.schema)) {
              control.readonly = false;
              control.required = this._config.schema && this._config.schema[key] && this._config.schema[key].required === true ? true : false;
              control.datamultiple = this._config.schema && this._config.schema[key] && this._config.schema[key].datamultiple === false ? false : true;
            }
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
          const populateFilters = (data, path = []) => {
            for (let [k, v] of Object.entries(data)) {

              let pk = path.concat(k).join('.');

              let schema = this.schema;
              schema = eval(`schema.${pk}`);
              let control = this.controls[pk];

              if (v && v !== 'null' && helpers.isObject(v)) {
                populateFilters(v, path.concat(k));
              } else if (v && v !== 'null' && schema && control) {
                let operator = control.element?.getAttribute('operator') || '=';
                // Format data for datetime
                if (schema.control === 'datetime' && ['>', '>='].includes(operator)) {
                  v = DateTime.fromISO(v, { setZone: true }).toLocal();
                  v = v.isValid ? v.startOf('day').toUTC().toSQL({ includeOffset: false }) : null;
                } else if (schema.control === 'datetime' && ['<', '<='].includes(operator)) {
                  v = DateTime.fromISO(v, { setZone: true }).toLocal();
                  v = v.isValid ? v.endOf('day').toUTC().toSQL({ includeOffset: false }) : null;
                }
                // Format data for date range
                if (schema.control === 'date' && control.isRange) {
                  let [v1, v2] = v.split('<=>');
                  v1 = DateTime.fromFormat(v1, 'yyyy-MM-dd').isValid ? v1 : null;
                  v2 = DateTime.fromFormat(v2, 'yyyy-MM-dd').isValid ? v2 : null;
                  if (v1) filters.push(`${pk}>=${v1}`);
                  if (v2) filters.push(`${pk}<=${v2}`);
                  continue;
                  // Format data for other range types
                } else if (control.isRange) {
                  let [v1, v2] = v.split('<=>');
                  if (v1) filters.push(`${pk}>=${v1}`);
                  if (v2) filters.push(`${pk}<=${v2}`);
                  continue;
                }
                filters.push(`${pk}${operator}${v}`);
              }
            }
          };
          let filters = [];
          populateFilters(data || this.data);
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
    helpers.nullifyObject(this.data);
    if (!soft) {
      this.storage.removeItem(`${this.uuid}-data`);
      this.table.offset = 0;
      return this.table.load({});
    } else {
      return Promise.resolve();
    }
  }
}

export class TableExportInterface {
  _exporting = false;

  constructor(config) {
    const configJson = helpers.stringify(config);

    this._config = JSON.parse(configJson); // keep a copy of original config

    this.storage = ENVIRONMENT.APP_STORAGE && window[ENVIRONMENT.APP_STORAGE] ? window[ENVIRONMENT.APP_STORAGE] : localStorage;

    Object.assign(this, {
      uuid: uuidv5('tableExportInterface:' + location.pathname + ':' + configJson, '2af1d572-a35c-4248-a38e-348c560cd468'),
      data: JSON.parse(this.storage.getItem(`${this.uuid}-data`)) || {},
    }, config);

    this._initialize = this.initialize();

    this._parser = new Parser();
  }

  initialize() {
    if (this._initialize) return this._initialize;

    return new Promise((resolve, reject) => {
      if (!this.table) return reject("missing table reference, interface won't work as expected");
      this.table.exportInterface = this; // self reference inside TableInterface
      resolve();
    }).then(() => {
      console.debug(`[TableExportInterface][${this.uuid}] Initialized`);
    }).catch((error) => {
      console.warn(`[TableExportInterface][${this.uuid}] Initialization failed: ${error}`);
    });
  }

  export() {
    if (this._exporting) return console.warn('Another export is already in progress');

    this._exporting = true;

    return this.downloadCsv(this).finally(() => { this._exporting = false; });
  }

  createCsvString(rows) {
    const csv = [];

    rows.forEach((row) => {
      csv.push(row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','));
    });

    return csv.join("\n");
  }

  async downloadCsv({ columns = [], url = null, limit = 0, offset = 0 } = {}) {
    const fetchUrl = new URL(url || this.table.URL);

    if (limit === null) fetchUrl.searchParams.delete('limit');
    else if (parseInt(limit) > 0) fetchUrl.searchParams.set('limit', limit);

    if (offset === null) fetchUrl.searchParams.delete('offset');
    else if (parseInt(offset) > 0) fetchUrl.searchParams.set('offset', offset);

    const records = await this.fetchData(fetchUrl);

    const rows = [
      columns.map((field) => field.name),
    ];
    records.forEach((record) => {
      const row = [];
      columns.forEach(({ value }) => {
        row.push(value.replaceAll(/\$\{(.*?)\}/g, (match, expr) => {
          return this._parser.parse(expr).evaluate({
            bindingContext: record,
          }, {
            valueConverters: (name) => this.valueConverters[name],
          });
        }));
      });
      rows.push(row);
    });

    const csv = this.createCsvString(rows);
    this.startCsvDownload(csv);

    return Promise.resolve();
  }

  async fetchData(url) {
    return await this.table.client.client.get(url.toString()).then((xhr) => {
      return xhr.response;
    }, (err) => {
      console.error(err);
      throw err;
    });
  }

  startCsvDownload(csv) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const anchor = document.createElement('a');
    anchor.download = DateTime.now().toFormat('yyyy-MM-dd') + '_' + this.table.endpoint.replace(/[^a-zA-Z0-9]/g, '') + '.csv';
    anchor.href = window.URL.createObjectURL(blob);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
