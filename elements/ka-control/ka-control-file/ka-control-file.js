import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';

require('./ka-control-file.sass');

@customElement('ka-control-file')
@inject(Element)
export class KaControlFile {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;

  constructor(element) {
    this.element = element;
  }

  valueChanged(value) {
    console.debug('ka-control-file: value changed!', value);
    if (typeof value === 'undefined' || value === '' || (value && !value.length)) value = null;
    this.displayValue = value && value.length && value[0] && value[0].name ? value[0].name : value;
  }

  clear() {
    this.value = null;
  }

  download() {
    if (!this.value || !this.schema.params.download) return;
    window.open(this.schema.params.download);
  }
}
