import { inject, customElement, bindable, bindingMode } from 'aurelia-framework';
import { DateTime } from 'luxon';
import { KaControlBackdropService } from '../ka-control-backdrop/ka-control-backdrop';

require('./ka-control-datetime.sass');

@customElement('ka-control-datetime')
@inject(Element)
export class KaControlDate {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value = null;

  constructor(element) {
    this.element = element;
    this.backdrop = new KaControlBackdropService(this, this.close);
  }

  bind() {
    // Reformat value on initial data binding, if necessary
    this.formatValue(this.value, null);
  }

  attached() {
    this.element.querySelector('input.display-value').addEventListener('dblclick', () => {
      this.open();
    });
  }

  valueChanged(newValue, oldValue) {
    // Reformat value on value change, if necessary
    this.formatValue(newValue, oldValue);
  }

  formatValue(newValue, oldValue) {
    if (!newValue || newValue === oldValue) return;
    const isUTC = !(this.schema?.params?.utc === false);
    const zone =  isUTC ? { zone: 'utc', setZone: true } : {};
    const dateTime = [DateTime.fromISO(newValue, zone), DateTime.fromSQL(newValue, zone)].find((dateTime) => dateTime.isValid);
    if (!dateTime || !dateTime.isValid) return;
    newValue = (isUTC ? dateTime : dateTime).toISO({ suppressMilliseconds: true, includeOffset: isUTC });
    if (newValue !== oldValue) {
      this.value = newValue;
    }
  }

  keydown() {
    return !this.schema.readonly;
  }
  keyup(event) {
    if (event.key === 'Enter') this.element.dispatchEvent(new Event('enter', { bubbles: true }));
  }
  focus() {
    this.element.dispatchEvent(new Event('focus', { bubbles: true }));
  }
  blur() {
    this.element.dispatchEvent(new Event('blur', { bubbles: true }));
  }
  open() {
    this.focus();
    this.backdrop.open(this.drawer);
  }
  close() {
    this.change();
    this.blur();
    this.backdrop.close();
  }
  change() {
    setTimeout(() => {
      this.element.dispatchEvent(new Event('change', { bubbles: true }));
    }, 100);
  }
}
export class controlDatetimeValueConverter {
  toView(value, utc = true) {
    const dateTime = DateTime.fromISO(value);
    if (!dateTime || !dateTime.isValid) return value;
    return (utc ? dateTime.toLocal() : dateTime).toFormat('dd/MM/yyyy HH:mm');
  }
  fromView(value, utc = true) {
    const dateTime = DateTime.fromFormat(value, 'dd/MM/yyyy HH:mm');
    if (!dateTime || !dateTime.isValid) return value;
    return (utc ? dateTime.toUTC() : dateTime).set({ seconds: 0, milliseconds: 0 }).toISO({ suppressMilliseconds: true, includeOffset: utc });
  }
}
