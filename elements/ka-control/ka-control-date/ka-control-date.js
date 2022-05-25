import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';
import { DateTime } from 'luxon';
import Pikaday from 'pikaday';

require('./ka-control-date.sass');
require('pikaday/css/pikaday.css');

@customElement('ka-control-date')
@inject(Element)
export class KaControlDate {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;

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

  keydown() {
    return !this.schema.readonly;
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
