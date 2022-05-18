import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';
import { DateTime } from 'luxon';
import Pikaday from 'pikaday';

require('./ka-control-date.sass');
require('../../../node_modules/pikaday/css/pikaday.css');

@customElement('ka-control-date')
@inject(Element)
export class KaControlDate {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;
  // Other input control bindable properties
  @bindable() readonly = null;
  @bindable() placeholder = '';
  // Input control specific params property
  @bindable() params = null;

  constructor(element) {
    this.element = element;
  }

  attached() {
    this.picker = new Pikaday({
      field: this.element.querySelector('input.display-value'),
      format: 'DD/MM/YYYY',
      firstDay: 1,
      setDefaultDate: false,
      keyboardInput: false,
      i18n: {
        previousMonth: 'Mese precedente',
        nextMonth: 'Mese seguente',
        months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
        weekdays: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
        weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
      }
    });
  }

  schemaChanged(schema) {
    // Validate schema
    if (!schema) {
      console.warn('ka-control-date: missing schema!', schema);
      return;
    }
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema);
      } catch (error) {
        console.error('ka-control-date: invalid schema provided!', schema);
        return;
      }
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

    console.debug('ka-control-date: schema changed!', schema);
    this._schema = schema;
  }

  keydown() {
    return !this.readonly;
  }
}
export class controlDateValueConverter {
  toView(value, utc) {
    let date = DateTime.fromISO(value, { setZone: true }).toLocal();
    if (!date.isValid) return value;
    return date.toFormat('dd/MM/yyyy');
  }
  fromView(value, utc) {
    let date = DateTime.fromFormat(value, 'dd/MM/yyyy');
    if (!date.isValid) return value;
    if (!(utc === false)) date = date.toUTC();
    return date.toISO();
  }
}
