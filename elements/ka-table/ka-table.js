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
      console.warn('ka-table: missing table interface!');
      return;
    } else if (!this.interface.uuid) {
      console.warn('ka-table: cannot bind to table interface!');
      return;
    }
    this.uuid = `ka-table-${this.interface.uuid}`;
    this.element.id = this.uuid;
    // Observe change on this.interface.isLoading
    this.observers.push(this.binding.expressionObserver(this, 'interface.isLoading').subscribe((value) => {
      if (value) this.element.classList.add('isLoading')
      else this.element.classList.remove('isLoading');
    }));
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
        var table = element.closest('ka-table');
        if (!floater) return;
        var h = element.getBoundingClientRect().height;
        var w = floater.getBoundingClientRect().width;
        if (table && floater && h && w) {
          table.scrollLeft = 0;
          floater.classList.add('float');
          floater.style.height = h + 'px';
          element.style.minWidth = element.style.width = w + 'px';
        }
      });
    };
    // Resize event listener
    window[`resize-handler-${this.uuid}`] = resizeHandler;
    window.addEventListener('resize', window[`resize-handler-${this.uuid}`]);
    // Scroll event listener
    this.element.addEventListener('scroll', event => {
      event.target.querySelectorAll('.floater.float').forEach(floater => {
        floater.style.transform = `translateX(${event.target.scrollLeft}px)`;
      });
    });
    
    if (!this.interface) return;
    // Trigger resizeHandler when TableInterface loads new data
    this.interface.events.addEventListener('loadSuccess', () => {
      setTimeout(() => { try { window[`resize-handler-${this.uuid}`](); } catch (error) { console.warn('ka-table: cannot run resize handler on load!'); } }, 0);
    });
    // Trigger resizeHandler if TableInterface has already loaded data when attaching this component to dom
    if (this.interface.data?.length) window[`resize-handler-${this.uuid}`]();
  }

  detached() {
    window.removeEventListener('resize', window[`resize-handler-${this.uuid}`]);
    delete window[`resize-handler-${this.uuid}`];
    for (let observer of this.observers) observer.dispose();
  }
}
