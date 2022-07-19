import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';
import { DateTime } from 'luxon';
import { KaControlBackdropService } from '../ka-control-backdrop/ka-control-backdrop';

require('./ka-control-time.sass');

@customElement('ka-control-time')
@inject(Element)
export class KaControlTime {
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
export class controlTimeValueConverter {
  toView(value, utc) {
    if (!/\d{2}:\d{2}$/.test(value)) return value;
    let date = DateTime.fromFormat(value, 'HH:mm');
    if (!date.isValid) return value;
    return date.toFormat('HH:mm');
  }
  fromView(value, utc) {
    if (!/^\d{2}:\d{2}$/.test(value)) return value;
    let date = DateTime.fromFormat(value, 'HH:mm');
    if (!date.isValid) return value;
    return date.toFormat('HH:mm');
  }
}
