import { inject, customElement, bindable } from 'aurelia-framework';

require('./ka-button.scss');

@customElement('ka-button')
@inject(Element)
export class KaButton {
  @bindable() disabled;
  @bindable() icon = null;
  @bindable() busy = false;
  @bindable() href = null;
  @bindable() target = null;

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
        if (this.target) window.open(this.href, this.target);
        else location.href = this.href;
      } else {
        e.toggle = () => {
          this.busy = !this.busy;
        };
      }
    }, { capture: true });

    let active = () => {
      if (!this.disabled && !this.busy) this.element.classList.toggle('active');
    };
    this.element.addEventListener('mousedown', active);
    this.element.addEventListener('touchstart', active);
    this.element.addEventListener('mouseup', active);
    this.element.addEventListener('touchend', active);

    // Prevent multiple fast clicks hack
    this.element.addEventListener('click', (event) => {
      if (this.click_pending) {
        event.preventDefault();
        event.stopPropagation();
      } else this.click_pending = true;
      setTimeout(() => {
        this.click_pending = false;
      }, 1000);
    });

    this.init();
  }

  click() {}

  disabledChanged(value) {
    value = value === 'false' ? false : Boolean(value);
    this.disabled = value;
    if (this._ready) this.init();
  }
  busyChanged() {
    if (this._ready) this.init();
  }

  init() {
    if (this.disabled === true) this.element.classList.add('disabled');
    else this.element.classList.remove('disabled');
    if (this.busy) this.element.classList.add('busy');
    else this.element.classList.remove('busy');
  }
}
