import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';

require('./ka-control-combo.sass');

@customElement('ka-control-combo')
@inject(Element)
export class KaControlCombo {
  // Basic input control properties
  @bindable() schema = null;
  @bindable() client = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;

  _schema = null;
  _value = null;
  opened = false;

  combostack = [];
  valuestack = [];
  preloadedCombostack = [];

  constructor(element) {
    this.element = element;

    this.backdrop = document.createElement('ka-control-backdrop');
    this.backdrop.addEventListener('click', event => { if (event.target === this.backdrop) this.close(); });
  }

  attached() {}

  clientChanged(client) {
    this.api = client;
    // Override http client if needed
    if ((!this.api && this.schema.datasource.table) || this.schema.datasource.url) {
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
    if (!schema.datasearch.keys) {
      schema.datasearch.keys = schema.datatext;
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
    setTimeout(() => { this.buildCombostack(); }, this.api ? 0 : 100);
  }

  valueChanged(value) {
    if (!this.schema) {
      // Component is not ready for value handling
      console.warn('ka-control-combo: cannot handle value without schema!');
      return;
    }
    // Validate value
    if ((!value && !this._value) || value === JSON.stringify(this._value)) {
      return;
    }
    if (value === null) {
      this.valuestack = [];
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

    console.debug('ka-control-combo: value changed!', value);
    setTimeout(() => { this.element.dispatchEvent(new Event('change', { bubbles: true })); }, 100);
    this._value = value;

    // Build display value
    setTimeout(() => { this.buildValuestack(); }, this.api ? 0 : 100);

  }

  buildCombostack() {
    let dts = this.schema.datasource;
    let dtp = this.schema.datapreload;

    if (dtp === true || Array.isArray(dts)) {
      if (dts.table || dts.url) {
        let endpoint = this.buildQueryUrl();
        this.api.get(endpoint).then(x => {
          this.combostack = x.response;
          this.preloadedCombostack = x.response;
        }).catch(x => {
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
    let dtv = this.schema.datavalue;
    let dtt = this.schema.datatext;
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
    let dtv = this.schema.datavalue;
    let dtt = this.schema.datatext;
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
    if (this.schema.readonly || ($event && $event.target.tagName === 'I')) return;
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
    if (this.schema.datapreload !== true) this.combostack = [];
    this.opened = false;
    this.term = null;
  }
  select(item) {
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
    let dts = this.schema.datasource;
    let dtt = this.schema.datatext;
    let dtp = this.schema.datapreload;
    let dsh = this.schema.datasearch;
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
    let dts = this.schema.datasource;
    let dtv = this.schema.datavalue;
    let dtt = this.schema.datatext;
    let dtf = this.schema.datafilter;
    //let dsh = this.schema.datasearch;

    if (!dts.table && !dts.url) {
      console.error('ka-control-combo: cannot build query url if datasource is not a table or url!', this.schema.datasource);
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
