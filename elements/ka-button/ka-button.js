import {inject, customElement, bindable} from 'aurelia-framework';

require('./ka-button.sass');

@customElement('ka-button')
@inject(Element)
export class KaButton {

  @bindable() disabled;
  @bindable() busy = false;
  @bindable() href = null;
  @bindable() icon = null;

  _ready = false;

  constructor(element) {
    this.element = element;
  }

  bind(bindingContext) {
    this.parent = bindingContext;

    this.disabled = this.disabled === '' ? true : this.disabled;
    this.disabled = this.disabled === null || typeof this.disabled === 'undefined' ? false : this.disabled;
    this.disabled = this.disabled === 'false' ? false : Boolean(this.disabled);
  }

  attached() {
    this._ready = true;
    this.element.addEventListener('click', (e) => {
      if (this.disabled || this.busy) {
        e.stopPropagation();
      } else if (this.href) {
        e.stopPropagation();
        location.href = this.href;
      } else {
        e.toggle = () => { console.log(this.busy); this.busy = !this.busy; };
      }
    });

    let active = (e) => { if (!this.disabled && !this.busy) this.element.classList.toggle('active'); };
    this.element.addEventListener('mousedown', active);
    this.element.addEventListener('touchstart', active);
    this.element.addEventListener('mouseup', active);
    this.element.addEventListener('touchend', active);

    this.init();
  }

  disabledChanged(value) {
    value = value === 'false' ? false : Boolean(value);
    this.disabled = value;
    if (this._ready) this.init();
  }
  busyChanged(value) {
    if (this._ready) this.init();
  }

  init() {
    if (this.disabled === true) this.element.classList.add('disabled');
    else this.element.classList.remove('disabled');
    if (this.busy) this.element.classList.add('busy');
    else this.element.classList.remove('busy');
  }

}
