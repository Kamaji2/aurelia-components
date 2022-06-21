import { inject, customElement } from 'aurelia-framework';

@customElement('ka-resource')
@inject(Element)
export class KaResource {
  constructor (element) {
    this.element = element;
  }
  bind(bindingContext) {
    this.interface = bindingContext && bindingContext.constructor?.name === 'ResourceInterface' ? bindingContext : null;
    console.log('interface', this.interface);
    if (!this.interface) {
      console.error('ka-resource: missing resource interface!');
      return;
    } else if (!this.interface.uuid) {
      console.error('ka-resource: cannot bind to resource interface!');
      return;
    }
    this.uuid = `ka-resource-${this.interface.uuid}`;
    this.element.id = this.uuid;
  }
  attached() {
    const resizeHandler = () => {
      let element = document.querySelector(`#${this.uuid}`);
      if (!element) return;
      /* element.style.height = '0px';
      element.style.height = parseInt(window.innerHeight - element.getBoundingClientRect().top) + 'px';*/
      console.log(element.scrollHeight, element.clientHeight);
      console.log(element.getBoundingClientRect().height, '>', parseInt(window.innerHeight - element.getBoundingClientRect().top));
      element.classList.remove('overflowed');
      element.style.height = 'unset';
      if (element.getBoundingClientRect().height > parseInt(window.innerHeight - element.getBoundingClientRect().top)) {
        element.classList.add('overflowed');
        element.style.height = '0px';
        element.style.height = parseInt(window.innerHeight - element.getBoundingClientRect().top) + 'px';
      }
    }
    window[`resize-handler-${this.uuid}`] = resizeHandler;
    window.addEventListener('resize', window[`resize-handler-${this.uuid}`]);
    setTimeout(() => { resizeHandler(); }, 1000);
  }

  detached() {
    window.removeEventListener('resize', window[`resize-handler-${this.uuid}`]);
    delete(window[`resize-handler-${this.uuid}`]);
  }

  save() {
    console.log('Save');
  }
}

