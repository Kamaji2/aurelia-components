import { inject, customElement, bindable, BindingEngine } from 'aurelia-framework';

@customElement('ka-table')
@inject(Element, BindingEngine)
export class KaTable {
  @bindable() height = 'full';
  observers = [];
  constructor(element, binding) {
    this.element = element;
    this.binding = binding;
  }
  bind(bindingContext) {
    // Resolve TableInterface binding
    this.interface = bindingContext && bindingContext.constructor?.name === 'TableInterface'? bindingContext: null;
    if (!this.interface) {
      console.warn();('ka-table: missing table interface!');
      return;
    } else if (!this.interface.uuid) {
      console.warn('ka-table: cannot bind to table interface!');
      return;
    }
    this.uuid = `ka-table-${this.interface.uuid}`;
    this.element.id = this.uuid;
    // Observe change on this.interface.isLoading
    this.observers.push(this.binding.expressionObserver(this, 'interface.isLoading').subscribe((value) => {
      console.debug('ka-table: observable interface.isLoading', value);
      if (value) this.element.classList.add('isLoading')
      else this.element.classList.remove('isLoading');
    }));
  }
  attached() {
    const resizeHandler = () => {
      if (this.height === 'full') {
        let element = document.querySelector(`#${this.uuid}`);
        if (!element) return;
        element.style.height = '0px';
        element.style.height = parseInt(window.innerHeight - element.getBoundingClientRect().top) + 'px';
      }
    };
    window[`resize-handler-${this.uuid}`] = resizeHandler;
    window.addEventListener('resize', window[`resize-handler-${this.uuid}`]);
    setTimeout(() => {
      resizeHandler();
    }, 1000);
  }

  detached() {
    window.removeEventListener('resize', window[`resize-handler-${this.uuid}`]);
    delete window[`resize-handler-${this.uuid}`];
    for (let observer of this.observers) observer.dispose();
  }
}
