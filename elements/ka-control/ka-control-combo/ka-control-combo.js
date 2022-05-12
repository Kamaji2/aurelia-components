import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {KaApi} from 'ka-components';


@customElement('ka-control-combo')
@inject(Element, KaApi)
export class KaControlCombo {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;
  // Other input control bindable properties
  @bindable() readonly = null;

  _schema = null;
  _value = null;
  opened = false;

  combostack = [];
  valuestack = [];
  preloadedCombostack = [];

  constructor(element, api) {
    this.element = element;
    this.api = api;

    this.backdrop = document.createElement('ka-control-backdrop');
    this.backdrop.addEventListener('click', event => { if (event.target === this.backdrop) this.close(); });
  }

  attached() {}

  schemaChanged(schema) {
    // Validate schema
    if (!schema) {
      konsole.warn('ka-control-combo: missing schema!', schema);
      return;
    }
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema);
      } catch (error) {
        konsole.error('ka-control-combo: invalid schema provided!', schema);
        return;
      }
    }
    if (!schema.datasource) {
      konsole.error('ka-control-combo: missing datasource in schema!', schema);
      return;
    }
    if (typeof schema.datasource === 'string') {
      try {
        schema.datasource = JSON.parse(schema.datasource);
      } catch (error) {
        konsole.error('ka-control-combo: invalid datasource provided in schema!', schema);
        return;
      }
    }
    if (Array.isArray(schema.datasource) && !schema.datapreload) {
      schema.datapreload = true; // Force datapreload = true if datasource is array of values
    }
    if (!schema.datavalue) {
      schema.datavalue = 'value';
    }
    if (!schema.datatext) {
      schema.datatext = 'text';
    }
    if (!schema.datasearch) {
      schema.datasearch = {};
    } else if (typeof schema.datasearch === 'string') {
      try {
        schema.datasearch = JSON.parse(schema.datasearch);
      } catch (error) {
        konsole.error('ka-control-combo: invalid datasearch provided in schema!', schema);
        return;
      }
    }
    if (!schema.datasearch.operator) {
      schema.datasearch.operator = '^=';
    }
    if (!schema.datasearch.keys) {
      schema.datasearch.keys = schema.datatext;
    }

    // Thisify boolean schema attributes
    for (let attribute of ['readonly']) {
      if (this[attribute] === null) {
        if (this.element.getAttribute(attribute)) {
          this[attribute] = String(this.element.getAttribute(attribute)).toLowerCase() === 'true';
        } else if (typeof schema[attribute] !== undefined) {
          this[attribute] = String(schema[attribute]).toLowerCase() === 'true';
        }
      } else this[attribute] = String(this[attribute]).toLowerCase() === 'true';
    }

    konsole.debug('ka-control-combo: schema changed!', schema);
    this._schema = schema;

    // Deferred value change if needed
    if (this.value && !this._value) this.valueChanged(this.value);

    // Override http client if needed
    if (schema.datasource.url) {
      this.api = new HttpClient();
      this.api.configure(x => {
        x.withInterceptor({
          response: msg => {
            if (msg.responseType === 'json' && typeof msg.response === 'string') {
              msg.response = JSON.parse(msg.response);
            }
            return msg;
          }
        });
      });
    }

    // Element classes
    if (schema.datamultiple === true) {
      this.element.classList.add('multiple');
      //this.drawer.classList.add('multiple'); // added in html template
    }

    // Build combo items list
    this.buildCombostack();
  }

  valueChanged(value) {
    if (!this._schema) {
      // Component is not ready for value handling
      konsole.warn('ka-control-combo: cannot handle value without schema!');
      return;
    }
    // Validate value
    if ((!value && !this._value) || value === JSON.stringify(this._value)) {
      return;
    }
    if (value === null) {
      this.valuestack = [];
    } else if (this._schema.datamultiple === true) {
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch (error) {
          konsole.error('ka-control-combo: invalid value provided!', value);
          return;
        }
      }
      if (!Array.isArray(value)) {
        konsole.warn('ka-control-combo: value should be an array! Trying to convert it...', value);
        value = [String(value)];
      }
    } else {
      if (typeof value !== 'string' && typeof value !== 'number') {
        konsole.error('ka-control-combo: value must be a string or an integer!', value);
        return;
      }
      value = [String(value)];
    }

    konsole.debug('ka-control-combo: value changed!', value);
    this._value = value;

    // Build display value
    this.buildValuestack();
  }

  buildCombostack() {
    let dts = this._schema.datasource;
    let dtp = this._schema.datapreload;

    if (dtp === true || Array.isArray(dts)) {
      if (dts.table || dts.url) {
        let endpoint = this.buildQueryUrl();
        this.api.get(endpoint).then(x => {
          this.combostack = x.response;
          this.preloadedCombostack = x.response;
        }).catch(x => {
          konsole.error('ka-control-combo: invalid datasource provided in schema!', this._schema);
        });
      } else if (Array.isArray(dts)) {
        this.combostack = dts;
        this.preloadedCombostack = dts;
      } else {
        konsole.error('ka-control-combo: invalid datasource provided in schema!', this._schema);
        return;
      }
    }
  }
  get combostack() {
    return this._combostack;
  }
  set combostack(stack) {
    if (!stack || stack.length === 0) {
      this._combostack = [];
      return;
    }
    let dtv = this._schema.datavalue;
    let dtt = this._schema.datatext;
    let combostack = [];
    for (let item of stack) {
      let text = '';
      let keys = dtt.match(/\{[a-zA-Z0-9_\.]*?\}/g);
      if (keys) {
        text = dtt;
        for (let key of keys) {
          let replacement = '';
          key = /\{([^\.]*)\.?(.*)\}/g.exec(key);
          if (item[key[1]] && key[2] && item[key[1]][key[2]]) replacement = item[key[1]][key[2]];
          else if (item[key[1]]) replacement = item[key[1]];
          text = text.replace(key[0], replacement);
        }
      } else text = item[dtt] || '';
      combostack.push({ value: String(item[dtv]), text: text });
    }
    this._combostack = combostack;
  }

  buildValuestack() {
    if (!this._value) return;
    let dtv = this._schema.datavalue;
    let dtt = this._schema.datatext;
    let values = this._value;
    let valuestack = [];
    let promises = [];
    for (let value of values) {
      let matched = this.combostack.find(x => String(x.value) === String(value)) || { value: String(value) };
      valuestack.push(matched);
    }
    let unmatched = valuestack.filter(x => !x.text);
    if (unmatched.length) {
      let endpoint = this.buildQueryUrl({ filters: `${dtv}~~${unmatched.map(x => x.value).join(',')}` });
      promises.push(this.api.get(endpoint).then(x => {
        let response = x.response;
        for (let item of response) {
          let text = '';
          let keys = dtt.match(/\{[a-zA-Z0-9_\.]*?\}/g);
          if (keys) {
            text = dtt;
            for (let key of keys) {
              let replacement = '';
              key = /\{([^\.]*)\.?(.*)\}/g.exec(key);
              if (item[key[1]] && key[2] && item[key[1]][key[2]]) replacement = item[key[1]][key[2]];
              else if (item[key[1]]) replacement = item[key[1]];
              text = text.replace(key[0], replacement);
            }
          } else text = item[dtt] || '';
          valuestack.find(i => i.value === String(item[dtv])).text = text;
        }
      }));
    }
    Promise.all(promises).finally(() => { this.valuestack = valuestack; });
  }
  get valuestack() {
    return this._valuestack;
  }
  set valuestack(stack) {
    if (!stack || stack.length === 0) {
      this._valuestack = [];
      return;
    }
    this._valuestack = stack;
  }

  open($event) {
    if (this.readonly || ($event && $event.target.tagName === 'I')) return;
    if (this.opened) return this.close();
    this._combostack.forEach(x => x.selected = this._value && this._value.includes(x.value));
    document.body.appendChild(this.backdrop);
    this.opened = true;

    setTimeout(() => {
      // Move drawer to backdrop
      let bounds = this.drawer.getBoundingClientRect();
      let max_h = this.backdrop.getBoundingClientRect().height;
      this.backdrop.appendChild(this.drawer);
      if (bounds.top + 280 > max_h) {
        this.drawer.style.top = 'auto';
        this.drawer.style.bottom = ((max_h - bounds.top - 30) + 60) + 'px';
      } else {
        this.drawer.style.top = bounds.top + 'px';
        this.drawer.style.bottom = 'auto';
      }
      this.drawer.style.left = bounds.left + 'px';
      this.drawer.style.width = bounds.width + 'px';
      // Search input focus
      if (this.searchInput) this.searchInput.focus();
    }, 0);
  }
  close() {
    this.element.appendChild(this.drawer);
    this.drawer.setAttribute('style', '');
    document.body.removeChild(this.backdrop);
    if (this._schema.datapreload !== true) this.combostack = [];
    this.opened = false;
    this.term = null;
  }
  select(item) {
    let value = this._value || [];
    let multiple = this._schema.datamultiple === true;
    let index = value.indexOf(item.value);
    if (multiple && index > -1) {
      item.selected = false;
      value.splice(index, 1);
      this.valuestack.splice(index, 1);
      if (value.length === 0) value = this._value = null;
    } else if (multiple) {
      item.selected = true;
      value.push(item.value);
      this.valuestack.push(item);
    } else if (!multiple  && index > -1) {
      item.selected = false;
      value = this._value = null;
      this.valuestack = [];
      this.close();
    } else if (!multiple) {
      item.selected = true;
      value = item.value;
      this.valuestack = [item];
      this.close();
    }
    this.value = value;
  }

  search() {
    let dts = this._schema.datasource;
    let dtt = this._schema.datatext;
    let dtp = this._schema.datapreload;
    let dsh = this._schema.datasearch;
    let term = this.term;
    let filters = [];

    if (dtp && this.preloadedCombostack.length > 8) {
      this.combostack = this.preloadedCombostack.filter(x => String(x[dtt]).toUpperCase().indexOf(term.toUpperCase()) === 0);
      return true;
    }

    if (!term || term.length < 2) return true;

    if (!dts.table && !dts.url) {
      return true;
    }

    // dtt can be something like "{key1} {key2} {key3}" or "Label1 {key1} label2 {key2}"
    let keys = dsh.keys.match(/{(.*?)}/g);
    if (keys) {
      let terms = term.trim().split(' ');
      if (terms.length > 1) {
        keys.forEach((key, index) => {
          if (terms[index]) filters.push(`${key.replace(/{|}/g, '')}${dsh.operator}${terms[index]}`);
        });
      } else {
        keys.forEach((key, index) => {
          filters.push(`${key.replace(/{|}/g, '')}${dsh.operator}${terms[0]}`);
        });
        filters = [`(${filters.join('|')})`];
      }
    } else {
      filters.push(`${dtt}${dsh.operator}${term.trim()}`);
    }

    let endpoint = this.buildQueryUrl({filters: filters.join('&')});
    if (this.searchRequest && this.searchRequest.cancel) { this.searchRequest.cancel(); }
    this.searchRequest = this.api.get(endpoint);
    this.searchRequest.then(x => {
      this.combostack = x.response;
      this._combostack.forEach(c => c.selected = this._value && this._value.includes(c.value));
    });
    return true;
  }

  getUrlParams(url) {
    let query = url.match(/\?(.*)$/);
    if (!query) return {};
    let chunks = query[1].split('&');
    return chunks.reduce((params, hash) => {
      let [key, val] = hash.split('=');
      return Object.assign(params, { [key]: decodeURIComponent(val) });
    }, {});
  }
  buildQueryUrl(params) {
    let dts = this._schema.datasource;
    let dtv = this._schema.datavalue;
    let dtt = this._schema.datatext;
    let dtf = this._schema.datafilter;
    //let dsh = this._schema.datasearch;

    if (!dts.table && !dts.url) {
      konsole.error('ka-control-combo: cannot build query url if datasource is not a table or url!', this._schema.datasource);
      return;
    }

    let endpoint = dts.table || dts.url;
    if (dts.table && dts.query) endpoint = endpoint + (endpoint.indexOf('?') > -1 ? '&' : '?') + dts.query;

    let urlParams = this.getUrlParams(endpoint);
    let fields;
    let sort;
    let keys;

    keys = dtt.match(/\{[a-zA-Z0-9_\.]*?\}/g);
    if (keys) {
      keys = keys.map(b=>b.replace(/\{(.*?)\}/g, '$1').replace(/([^\.]*).*/g, '$1'));
      fields = keys.join(',');
      sort = `+${keys.join(',+')}`;
    } else {
      fields = dtt;
      sort = `+${dtt}`;
    }

    // keys = dsh.keys.match(/\{[a-zA-Z0-9_\.]*?\}/g);
    // if (keys) {
    //   keys = keys.map(b=>b.replace(/\{(.*?)\}/g, '$1').replace(/([^\.]*).*/g, '$1'));
    //   fields = fields.split(',');
    //   fields = fields.concat(keys.filter(x => fields.indexOf(x) < 0)).join(',');
    // } else {
    //   fields = fields.split(',');
    //   fields = fields.concat([dsh.keys].filter(x => fields.indexOf(x) < 0)).join(',');
    // }

    //let operator = this.queryOperator ? this.queryOperator : '^=';
    //operator = this.dataoperator ? this.dataoperator : operator;
    //params.filters = (params.filters ? '&' : '') + `(${datatext}${operator}${query})`;
    if (dtf) {
      urlParams.filters = (urlParams.filters ? urlParams.filters + '&' : '') + `(${dtf})`;
    }
    if (params && params.filters) {
      urlParams.filters = (urlParams.filters ? urlParams.filters + '&' : '') + `(${params.filters})`;
    }
    urlParams.sort = (urlParams.sort ? urlParams.sort + ',' : '') + sort;
    urlParams.fields = (urlParams.fields ? urlParams.fields + ',' : '') + `${dtv},${fields}`;
    endpoint = endpoint.replace(/\?.*$/, '') + '?' + this.buildQueryString(urlParams);
    return endpoint;
  }
  buildQueryString(params) {
    return Object.keys(params).reduce((query, key) => {
      return `${query}&${key}=` + encodeURIComponent(params[key]);
    }, '').replace(/^\&/, '');
  }
}

export class kaControlComboHighlightValueConverter {
  toView(text, term) {
    if (!term) return text;
    let index = text.toLowerCase().indexOf(term.toLowerCase());
    if (index >= 0) text = text.substring(0, index) + '<strong>' + text.substring(index, index + term.length) + '</strong>' + text.substring(index + term.length);
    return text;
  }
}
