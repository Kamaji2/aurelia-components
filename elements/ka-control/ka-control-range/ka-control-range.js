import { inject, customElement, bindable, bindingMode } from 'aurelia-framework';

require('./ka-control-range.sass');

@customElement('ka-control-range')
@inject(Element)
export class KaControlRange {
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
    this._schema = Object.assign({}, value, { label: null });
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
      this.element.dispatchEvent(new Event('change', { bubbles: true }));
    }, 100);
  }
}
