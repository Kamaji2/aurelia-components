import { inject, customElement, bindable, bindingMode, BindingEngine } from 'aurelia-framework';
import { HttpClient } from 'aurelia-http-client';
import { KaControlBackdropService } from '../ka-control-backdrop/ka-control-backdrop';

require('./ka-control-combo.sass');

@customElement('ka-control-combo')
@inject(Element, BindingEngine)
export class KaControlCombo {
  // Basic input control properties
  @bindable() schema = null;
  @bindable() client = null;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value = null;

  _schema = null;
  _value = null;

  observers = [];

  _combostack = [];
  _valuestack = [];
  preloadedCombostack = [];

  constructor(element, binding) {
    this.element = element;
    this.binding = binding;
    this.backdrop = new KaControlBackdropService(this, this.close);

    this.element.tabIndex = 0;
    this.element.addEventListener('keydown', (event) => {
      if (event.target !== this.element) return;
      if (['Enter', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        this.open(event);
      } else if (['Tab'].includes(event.key)) {
        this.close();
      }
    });
  }

  detached() {
    this.disposeObservers();
  }

  clientChanged(client) {
    this.api = client;
    // Override http client if needed
    if ((!this.api && this.schema.datasource.table) || this.schema.datasource.url) {
      this.api = new HttpClient();
      this.api.configure((x) => {
        x.withInterceptor({
          response: (msg) => {
            if (msg.responseType === 'json' && typeof msg.response === 'string') {
              msg.response = JSON.parse(msg.response);
            }
            return msg;
          }
        });
      });
    }
  }

  schemaChanged(schema) {
    if (!schema.datasource) {
      console.error('ka-control-combo: missing datasource in schema!', schema);
      return;
    }
    if (typeof schema.datasource === 'string') {
      try {
        schema.datasource = JSON.parse(schema.datasource);
      } catch (error) {
        console.error('ka-control-combo: invalid datasource provided in schema!', schema);
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
    }
    if (!schema.datasearch.operator) {
      schema.datasearch.operator = '^=';
    }

    // Deferred value change if needed
    if (this.value && !this._value) this.valueChanged(this.value);

    // Set client for api calls
    if (schema.client) this.client = schema.client;

    // Element classes
    if (schema.datamultiple === true) {
      this.element.classList.add('multiple');
      //this.drawer.classList.add('multiple'); // added in html template
    }

    // Build combo items list
    setTimeout(() => {
      this.buildCombostack();
    },
    this.api ? 0 : 100);

    this.subscribeObservers();
  }

  valueChanged(value) {
    if (!this.schema) {
      // Component is not ready for value handling
      console.warn('ka-control-combo: cannot handle value without schema!');
      return;
    }
    // Validate value allowing string 'null' value
    if ((!value && !this._value) || (value !== 'null' && value === JSON.stringify(this._value))) {
      return;
    }
    if (value === null) {
      this.valuestack = [];
      this.getValueModel();
    } else if (this.schema.datamultiple === true) {
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch (error) {
          console.error('ka-control-combo: invalid value provided!', value);
          return;
        }
      }
      if (!Array.isArray(value)) {
        console.warn('ka-control-combo: value should be an array! Trying to convert it...', value);
        value = [String(value)];
      }
    } else {
      if (typeof value !== 'string' && typeof value !== 'number') {
        console.error('ka-control-combo: value must be a string or an integer!', value);
        return;
      }
      value = [String(value)];
    }
    this._value = value;

    // Build display value
    setTimeout(() => {
      this.buildValuestack();
    },
    this.api ? 0 : 100);
  }

  subscribeObservers() {
    if (this.observers.length) return;
    for (let key of Object.keys(this.schema)) {
      if (key.startsWith('data')) {
        this.observers.push(this.binding.expressionObserver(this, `schema.${key}`).subscribe(() => {
          this.buildCombostack();
          this.buildValuestack();
        }));
      }
    }
  }
  disposeObservers() {
    for (let observer of this.observers) observer.dispose();
  }

  buildCombostack() {
    let dts = this.schema.datasource;
    let dtp = this.schema.datapreload;

    if (dtp === true || Array.isArray(dts)) {
      if (dts.table || dts.url) {
        let endpoint = this.buildQueryUrl();
        if (!this.api) throw new Error('ka-control-combo: missing http client configuration!');
        if (!endpoint) return console.warn('ka-control-combo: no endpoint set for building combo stack');
        this.api.get(endpoint).then((xhr) => {
          this.combostack = xhr.response;
          this.preloadedCombostack = xhr.response;
        }).catch(() => {
          console.error('ka-control-combo: invalid datasource provided in schema!', this.schema);
        });
      } else if (Array.isArray(dts)) {
        this.combostack = dts;
        this.preloadedCombostack = dts;
      } else {
        console.error('ka-control-combo: invalid datasource provided in schema!', this.schema);
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
    let dts = this.schema.datasource;
    let dtv = this.schema.datavalue;
    let dtt = this.schema.datatext;
    let dtp = this.schema.datapreload;
    let combostack = [];
    for (let item of stack) {
      let text = '';
      let keys = dtt.match(/\{[a-zA-Z0-9_.]*?\}/g);
      if (keys) {
        text = dtt;
        for (let key of keys) {
          let replacement = '';
          key = /\{([^.]*)\.?(.*)\}/g.exec(key);
          if (item[key[1]] && key[2] && item[key[1]][key[2]]) replacement = item[key[1]][key[2]];
          else if (item[key[1]]) replacement = item[key[1]];
          text = text.replace(key[0], replacement);
        }
      } else text = item[dtt] || '';
      combostack.push({ value: String(item[dtv]), text: text, model: item });
    }
    this._combostack = combostack;

    if (!(!dtp && (dts.table || dts.url)) && combostack.length === 1 && this.schema.required && this.value === null) {
      this.value = combostack[0].value;
    }
  }

  buildValuestack() {
    if (!this._value) return;
    let dts = this.schema.datasource;
    let dtv = this.schema.datavalue;
    let dtt = this.schema.datatext;
    let values = this._value;
    let valuestack = [];
    let promises = [];
    for (let value of values) {
      let matched = this.combostack.find((x) => String(x.value) === String(value)) || { value: String(value) };
      valuestack.push(matched);
    }
    let unmatched = valuestack.filter((x) => !x.text);
    if (unmatched.length) {
      if (!dts.table && !dts.url) {
        this.value = null;
        return;
      }
      let endpoint = this.buildQueryUrl({
        filters: `${dtv}~~${unmatched.map((x) => x.value).join(',')}`
      });
      if (!this.api) throw new Error('ka-control-combo: missing http client configuration!');
      if (!endpoint) return console.warn('ka-control-combo: no endpoint set for building value stack');
      promises.push(this.api.get(endpoint).then((x) => {
        let response = x.response;
        for (let item of response) {
          let text = '';
          let keys = dtt.match(/\{[a-zA-Z0-9_.]*?\}/g);
          if (keys) {
            text = dtt;
            for (let key of keys) {
              let replacement = '';
              key = /\{([^.]*)\.?(.*)\}/g.exec(key);
              if (item[key[1]] && key[2] && item[key[1]][key[2]]) replacement = item[key[1]][key[2]];
              else if (item[key[1]]) replacement = item[key[1]];
              text = text.replace(key[0], replacement);
            }
          } else text = item[dtt] || '';
          let entry = valuestack.find((i) => i.value === String(item[dtv]));
          entry.text = text;
          entry.model = item;
        }
      }).catch((error) => {
        if (!error.statusCode === 0) {
          console.error(error);
        }
      }));
    }
    Promise.all(promises).finally(() => {
      this.valuestack = valuestack;
      this.getValueModel();
    });
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

  getValueModel() {
    if (!this.value) return (this.valueModel = null);
    if (this.schema.datamultiple === true) {
      this.valueModel = this.valuestack.filter((x) => this.value.includes(x.value)).map((x) => x.model);
    } else {
      this.valueModel = this.valuestack.filter((x) => String(this.value) === String(x.value)).map((x) => x.model)[0];
    }
  }

  open($event) {
    if (this.schema.readonly || ($event && $event.target.tagName === 'I')) return;
    this._combostack.forEach((x) => (x.selected = this._value && this._value.includes(x.value)));
    setTimeout(() => {
      this.element.dispatchEvent(new Event('focus', { bubbles: true }));
    }, 1);
    this.backdrop.open(this.drawer).then(() => {
      if (this.searchInput) this.searchInput.focus();
    });
  }
  close() {
    this.element.dispatchEvent(new Event('blur', { bubbles: true }));
    this.backdrop.close();
    if (this.schema.datapreload !== true) this.combostack = [];
    this.term = null;
  }
  select(item) {
    if (item.model.optgroup || item.model.readonly === true) return;
    let value = this._value || [];
    let multiple = this.schema.datamultiple === true;
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
    } else if (!multiple && index > -1) {
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
    setTimeout(() => {
      this.element.dispatchEvent(new Event('change', { bubbles: true }));
    }, 100);
    this.getValueModel();
  }

  search() {
    let dts = this.schema.datasource;
    let dtt = this.schema.datatext;
    let dtp = this.schema.datapreload;
    let dsh = this.schema.datasearch;
    let term = this.term;
    let filters = [];

    if (dtp && this.preloadedCombostack.length > 8) {
      this.combostack = this.preloadedCombostack.filter((x) => String(x[dtt]).toUpperCase().indexOf(term.toUpperCase()) === 0);
      return true;
    }

    if (!term || term.length < 2) return true;

    if (!dts.table && !dts.url) {
      return true;
    }

    if (dsh.filters) {
      // if schema.datasearch.filters is set, this overrides any other filtering logic
      // schema.datasearch.filters can contain only the {term} keyword to be replaced
      filters.push(dsh.filters.replaceAll('{term}', term));
    } else {
      // dtt can be something like '{key1} {key2} {key3}' or 'Label1 {key1} label2 {key2}'
      let keys = dtt.match(/{(.*?)}/g);
      if (keys) {
        let terms = term.trim().split(' ');
        if (terms.length > 1) {
          keys.forEach((key, index) => {
            if (terms[index]) filters.push(`${key.replace(/{|}/g, '')}${dsh.operator}${terms[index]}`);
          });
        } else {
          keys.forEach((key) => {
            filters.push(`${key.replace(/{|}/g, '')}${dsh.operator}${terms[0]}`);
          });
          filters = [`(${filters.join('|')})`];
        }
      } else {
        filters.push(`(${dtt}${dsh.operator}${term.trim()})`);
      }
    }
    filters = filters.join('&');

    let endpoint = this.buildQueryUrl({ filters: filters });
    if (this.searchRequest && this.searchRequest.cancel) {
      this.searchRequest.cancel();
    }
    this.searchPending = true;
    this.searchRequest = this.api.get(endpoint);
    this.searchRequest.then((x) => {
      this.combostack = x.response;
      this._combostack.forEach((c) => (c.selected = this._value && this._value.includes(c.value)));
      this.searchPending = false;
      // Dispatch resize event on backdrop in order to eventually reposition the drawer
      setTimeout(() => {
        this.backdrop.backdropElement.dispatchEvent(new Event('resize'));
      }, 0);
    }).catch((error) => {
      if (!error.statusCode === 0) {
        console.error(error);
        this.searchPending = false;
      }
    });
    return true;
  }
  searchKeyUp() {
    if (this.searchDebounceTimeout) {
      clearTimeout(this.searchDebounceTimeout);
    }
    this.searchDebounceTimeout = setTimeout(() => {
      this.search();
    }, 800);
    return true;
  }
  searchKeyDown($event) {
    if (['Enter', 'Tab'].includes($event.key)) {
      $event.preventDefault();
      this.close();
      this.element.focus();
      return false;
    }
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
    let dts = this.schema.datasource;
    let dtv = this.schema.datavalue;
    let dtt = this.schema.datatext;
    let dtf = this.schema.datafilter;
    //let dsh = this.schema.datasearch;

    if (!dts.table && !dts.url) {
      console.warn('ka-control-combo: cannot build query url if datasource is not a table or url!', this.schema.datasource);
      return;
    }

    let endpoint = dts.table || dts.url;
    let urlParams = this.getUrlParams(endpoint);

    // Build sort url param
    if (this.schema.datasort) {
      urlParams.sort = (urlParams.sort ? urlParams.sort + ',' : '') + this.schema.datasort;
    }

    // Build fields and sort url params
    let keys, fields, sort;
    keys = dtt.match(/\{[a-zA-Z0-9_.]*?\}/g);
    if (keys) {
      keys = keys.map((b) => b.replace(/\{(.*?)\}/g, '$1').replace(/([^.]*).*/g, '$1'));
      fields = keys.join(',');
      sort = `+${keys.join(',+')}`;
    } else {
      fields = dtt;
      sort = `+${dtt}`;
    }
    if (!(this.schema.datasort === false)) urlParams.sort = (urlParams.sort ? urlParams.sort + ',' : '') + sort;
    urlParams.fields = (urlParams.fields ? urlParams.fields + ',' : '') + `${dtv},${fields}`;

    // Build filters url param
    if (dtf) {
      // Filters set into schema.datafilter
      urlParams.filters = (urlParams.filters ? urlParams.filters + '&' : '') + `(${dtf})`;
    }
    if (params && params.filters) {
      // Filters set into function caller
      urlParams.filters = (urlParams.filters ? urlParams.filters + '&' : '') + `(${params.filters})`;
    }

    endpoint = endpoint.replace(/\?.*$/, '') + '?' + this.buildQueryString(urlParams);
    return endpoint;
  }
  buildQueryString(params) {
    return Object.keys(params)
      .reduce((query, key) => {
        return `${query}&${key}=` + encodeURIComponent(params[key]);
      }, '')
      .replace(/^&/, '');
  }
}

export class kaControlComboHighlightValueConverter {
  toView(text, term) {
    if (!term || !text) return text;
    let index = text.toLowerCase().indexOf(term.toLowerCase());
    if (index >= 0) text = text.substring(0, index) + '<strong>' + text.substring(index, index + term.length) + '</strong>' + text.substring(index + term.length);
    return text;
  }
}
export class kaControlComboTextifyValueConverter {
  toView(text) {
    if (!text) return text;
    return text.replace(/(<([^>]+)>)/gi, "");
  }
}
