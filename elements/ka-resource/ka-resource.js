import { inject, customElement, bindable } from "aurelia-framework";

@customElement("ka-resource")
@inject(Element)
export class KaResource {
  @bindable() height = 'full';
  constructor(element) {
    this.element = element;
  }
  bind(bindingContext) {
    this.interface = bindingContext && bindingContext.constructor?.name === "ResourceInterface"? bindingContext: null;
    if (!this.interface) {
      console.error("ka-resource: missing resource interface!");
      return;
    } else if (!this.interface.uuid) {
      console.error("ka-resource: cannot bind to resource interface!");
      return;
    }
    this.uuid = `ka-resource-${this.interface.uuid}`;
    this.element.id = this.uuid;
  }
  attached() {
    const resizeHandler = () => {
      let element = document.querySelector(`#${this.uuid}`);
      if (!element) return;

      if (this.height === 'full') {
        element.classList.remove("overflowed");
        element.style.height = null;
        
        let container = (element.closest('ux-dialog-body') || element.closest('router-view')).getBoundingClientRect();
        if (element.getBoundingClientRect().bottom > container.bottom) {
          element.classList.add("overflowed");
          element.style.height = parseInt(container.bottom - element.getBoundingClientRect().top) + 'px';
        }
      }
    };
    window[`resize-handler-${this.uuid}`] = resizeHandler;
    window.addEventListener("resize", window[`resize-handler-${this.uuid}`]);
    setTimeout(() => {
      resizeHandler();
    }, 1000);
  }

  detached() {
    window.removeEventListener("resize", window[`resize-handler-${this.uuid}`]);
    delete window[`resize-handler-${this.uuid}`];
  }
}
