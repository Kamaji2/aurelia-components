import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';
import { DateTime } from 'luxon';
import { KaControlBackdropService } from '../ka-control-backdrop/ka-control-backdrop';

require('./ka-control-datetime.sass');

@customElement('ka-control-datetime')
@inject(Element)
export class KaControlDate {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;

  constructor(element) {
    this.element = element;
    this.backdrop = new KaControlBackdropService(this.element);
  }

  attached() {
    this.element.querySelector('input.display-value').addEventListener('dblclick', () => { this.open(); });
  }

  keydown() {
    return !this.schema.readonly;
  }
  open() {
    this.opened = true;
    this.backdrop.open(this.drawer);
  }
  close() {
    this.backdrop.close();
  }
}
export class controlDatetimeValueConverter {
  toView(value, utc) {
    if (!/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/.test(value)) return value;
    let date = (!(utc === false)) ? DateTime.fromISO(value, { setZone: true }).toLocal() : DateTime.fromISO(value);
    if (!date.isValid) return value;
    return date.toFormat('dd/MM/yyyy HH:mm');
  }
  fromView(value, utc) {
    if (!/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(value)) return value;
    let date = DateTime.fromFormat(value, 'dd/MM/yyyy HH:mm');
    if (!date.isValid) return value;
    if (!(utc === false)) date = date.toUTC();
    return date.toISO();
  }
}