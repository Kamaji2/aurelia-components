import { inject, customElement, bindable, bindingMode } from 'aurelia-framework';
import { DateTime } from 'luxon';
import { KaControlBackdropService } from '../ka-control-backdrop/ka-control-backdrop';

require("./ka-control-date-range.sass");

@customElement('ka-control-date-range')
@inject(Element)
export class KaControlDateRange {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value = null;

  _schema = this.schema;
  valueFrom = null;
  valueTo = null;

  constructor(element) {
    this.element = element;
  }

  schemaChanged(value) {
    this._schema = Object.assign({}, value, { control: 'date', label: null });
  }
  valueChanged(value) {
    if (!value) {
      this.valueFrom = null;
      this.valueTo = null;
      return;
    }
    [this.valueFrom, this.valueTo] = value.split('<=>');
  }

  attached() {}

  focus() {
    this.element.dispatchEvent(new Event('focus', { bubbles: true }));
  }
  blur() {
    this.element.dispatchEvent(new Event('blur', { bubbles: true }));
  }
  change() {
    setTimeout(() => {
      this.value = [this.valueFrom, this.valueTo].join('<=>').replace(/^<=>$/, '');
      this.element.dispatchEvent(new Event("change", { bubbles: true }));
    }, 100);
  }
}
