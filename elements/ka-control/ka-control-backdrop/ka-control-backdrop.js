import { helpers } from 'aurelia-components';
import { v5 as uuidv5 } from 'uuid';
require('./ka-control-backdrop.sass');

export class KaControlBackdropService {
  constructor(control, close, config) {
    Object.assign(this, config || {});
    this.uuid = uuidv5('kaControlBackdrop:' + location.pathname + ':' + helpers.stringify(config), '2af1d572-a35c-4248-a38e-348c560cd468');
    this.element = control.element;
    this.element.dataset.backdrop = this.uuid;
    this.backdrop = document.createElement('ka-control-backdrop');
    this.backdrop.id = this.uuid;
    this.backdrop.addEventListener('click', (event) => {
      if (event.target === this.backdrop) {
        if (close) close.call(control);
        else this.close();
      }
    });
  }

  open(drawer) {
    this.drawer = drawer;
    return new Promise((resolve, reject) => {
      try {
        document.body.appendChild(this.backdrop);
        setTimeout(() => {
          // Move drawer to backdrop
          this.backdrop.appendChild(this.drawer);
          this.attachResizeHandler();
          resolve();
        }, 0);
      } catch (error) {
        reject(error);
      }
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      try {
        if (this.drawer && this.backdrop && document.body.contains(this.backdrop)) {
          this.element.appendChild(this.drawer);
          this.drawer.removeAttribute('style');
          document.body.removeChild(this.backdrop);
          this.detachResizeHandler();
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  attachResizeHandler() {
    const resizeHandler = () => {
      let boundsElement = this.element.closest('ka-control.ka-control-range') || this.element.closest('ka-control');
      if (!boundsElement) return;
      let bounds = boundsElement.getBoundingClientRect();
      if (this.drawer) {
        this.drawer.style.top = bounds.top + bounds.height + 'px';
        this.drawer.style.left = bounds.left + 'px';
        this.drawer.style.width = bounds.width + 'px';

        if (bounds.width < 180) this.drawer.classList.add('xs'); else this.drawer.classList.remove('xs');
        if (bounds.width >= 180 && bounds.width < 300) this.drawer.classList.add('sm'); else this.drawer.classList.remove('sm');
        if (bounds.width >= 300 && bounds.width < 400) this.drawer.classList.add('md'); else this.drawer.classList.remove('md');
        if (bounds.width >= 400) this.drawer.classList.add('lg'); else this.drawer.classList.remove('lg');
      }
    };
    window[`resize-backdrop-${this.uuid}`] = resizeHandler;
    window.addEventListener('resize', window[`resize-backdrop-${this.uuid}`]);
    resizeHandler();
  }

  detachResizeHandler() {
    window.removeEventListener('resize', window[`resize-backdrop-${this.uuid}`]);
    delete window[`resize-backdrop-${this.uuid}`];
  }
}