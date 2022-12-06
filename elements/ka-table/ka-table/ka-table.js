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
    this.interface.events.addEventListener('loadSuccess', () => {
      console.warn('ka-table: loadSuccess!');
      setTimeout(() => {
        try { window[`resize-handler-${this.uuid}`](); } catch (error) { console.warn('ka-table: cannot run resize handler on load!'); }
      }, 0);
    });
  }
  attached() {
    const resizeHandler = () => {
      let element = document.querySelector(`#${this.uuid}`);
      if (!element) return;

      if (this.height === 'full') {
        element.style.height = '0px';
        element.style.height = parseInt(window.innerHeight - element.getBoundingClientRect().top) + 'px';
      }
      element.querySelectorAll('tbody td.ka-table-row-tools:last-child').forEach(function (element) {
        var floater = element.querySelector('.floater');
        if (!floater) return;
        var h = element.getBoundingClientRect().height;
        var w = floater.getBoundingClientRect().width;
        if (floater && h && w) {
          floater.classList.add('float');
          floater.style.transform = `translateX(${element.closest('ka-table').scrollLeft}px)`;
          floater.style.height = h + 'px';
          element.style.minWidth = w + 'px';
        }
      });
    };
    window[`resize-handler-${this.uuid}`] = resizeHandler;
    window.addEventListener('resize', window[`resize-handler-${this.uuid}`]);
    /* setTimeout(() => {
      resizeHandler();
    }, 1000); */

    this.element.addEventListener('scroll', event => {
      event.target.querySelectorAll('.floater.float').forEach(floater => {
        floater.style.transform = `translateX(${event.target.scrollLeft}px)`;
      });
    });
  }

  detached() {
    window.removeEventListener('resize', window[`resize-handler-${this.uuid}`]);
    delete window[`resize-handler-${this.uuid}`];
    for (let observer of this.observers) observer.dispose();
  }
}
