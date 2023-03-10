import { inject, customElement, bindable, bindingMode } from 'aurelia-framework';
import { DateTime } from 'luxon';
import { KaControlBackdropService } from '../ka-control-backdrop/ka-control-backdrop';

require('./ka-control-date.sass');

@customElement('ka-control-date')
@inject(Element)
export class KaControlDate {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value = null;

  constructor(element) {
    this.element = element;
    this.backdrop = new KaControlBackdropService(this, this.close);
  }

  attached() {
    this.element.querySelector('input.display-value').addEventListener('dblclick', () => {
      this.open();
    });
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
export class controlDateValueConverter {
  toView(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    let date = DateTime.fromFormat(value, 'yyyy-MM-dd');
    if (!date.isValid) return value;
    return date.toFormat('dd/MM/yyyy');
  }
  fromView(value) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    let date = DateTime.fromFormat(value, 'dd/MM/yyyy');
    if (!date.isValid) return value;
    return date.toFormat('yyyy-MM-dd');
  }
}
