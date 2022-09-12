import {inject, customElement} from 'aurelia-framework';

@customElement('ka-table')
@inject(Element)
export class KaTable {
  constructor (element) {
    this.element = element;
  }
  bind(bindingContext) {
    this.interface = bindingContext && bindingContext.constructor?.name === 'TableInterface' ? bindingContext : null;
    if (!this.interface) {
      console.error('ka-table: missing table interface!');
      return;
    } else if (!this.interface.uuid) {
      console.error('ka-table: cannot bind to table interface!');
      return;
    }
    this.uuid = `ka-table-${this.interface.uuid}`;
    this.element.id = this.uuid;
  }
  attached() {
    const resizeHandler = () => {
      let element = document.querySelector(`#${this.uuid}`);
      if (!element) return;
      element.style.height = '0px';
      element.style.height = parseInt(window.innerHeight - element.getBoundingClientRect().top) + 'px';
    }
    window[`resize-handler-${this.uuid}`] = resizeHandler;
    window.addEventListener('resize', window[`resize-handler-${this.uuid}`]);
    setTimeout(() => { resizeHandler(); }, 1000);
  }

  detached() {
    window.removeEventListener('resize', window[`resize-handler-${this.uuid}`]);
    delete(window[`resize-handler-${this.uuid}`]);
  }
}

