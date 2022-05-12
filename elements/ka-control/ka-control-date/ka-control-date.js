import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';
import moment from 'moment';
import Pikaday from 'pikaday';

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
      konsole.warn('ka-control-date: missing schema!', schema);
      return;
    }
    if (typeof schema === 'string') {
      try {
        schema = JSON.parse(schema);
      } catch (error) {
        konsole.error('ka-control-date: invalid schema provided!', schema);
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

    konsole.debug('ka-control-date: schema changed!', schema);
    this._schema = schema;
  }

  keydown() {
    return !this.readonly;
  }
}
export class controlDateValueConverter {
  toView(value, format = 'DD/MM/YYYY') {
    if (!value) return null;
    if (moment.utc(value).isValid()) {
      konsole.debug(`ControlDateValueConverter - From ${moment.utc(value)} to view ${moment.utc(value).local().format(format)}`);
      return moment.utc(value).local().format(format);
    }
    konsole.debug(`ControlDateValueConverter - No conversion toView on ${value}`);
    return value;
  }
  fromView(value, format = 'DD/MM/YYYY') {
    if (!value) return null;
    if (moment(value, format).isValid()) {
      konsole.debug(`ControlDateValueConverter - From view ${moment(value, format)} to ${moment(value, format).utc().format()}`);
      return moment(value, format).hour(moment().hour()).minute(moment().minute()).utc().format();
    }
    konsole.debug(`ControlDateValueConverter - No conversion fromView on ${value}`);
    return value;
  }
}
