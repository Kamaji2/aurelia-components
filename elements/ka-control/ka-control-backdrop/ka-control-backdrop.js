import { helpers } from 'aurelia-components';
import { v5 as uuidv5 } from 'uuid';
require('./ka-control-backdrop.sass');

export class KaControlBackdropService {
  constructor(control, close, config) {
    Object.assign(this, config || {});
    this.uuid = uuidv5('kaControlBackdrop:' + location.pathname + ':' + helpers.stringify(config), '2af1d572-a35c-4248-a38e-348c560cd468');
    this.element = control.element;
    this.element.dataset.backdropElement = this.uuid;
    this.backdropElement = document.createElement('ka-control-backdrop');
    this.backdropElement.id = this.uuid;
    this.backdropElement.addEventListener('click', (event) => {
      if (event.target === this.backdropElement) {
        if (close) close.call(control);
        else this.close();
      }
    });
  }

  open(drawer) {
    this.drawer = drawer;
    return new Promise((resolve, reject) => {
      try {
        document.body.appendChild(this.backdropElement);
        setTimeout(() => {
          // Move drawer to backdrop
          this.backdropElement.appendChild(this.drawer);
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
        if (this.drawer && this.backdropElement && document.body.contains(this.backdropElement)) {
          this.element.appendChild(this.drawer);
          this.drawer.removeAttribute('style');
          document.body.removeChild(this.backdropElement);
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
      let controlElement = this.element.closest('ka-control.ka-control-range') || this.element.closest('ka-control > div');
      if (!controlElement) return;
      let controlBounds = controlElement.getBoundingClientRect();
      let drawerBounds = this.drawer.getBoundingClientRect();
      if (this.drawer) {
        this.drawer.style.left = controlBounds.left + 'px';
        this.drawer.style.width = controlBounds.width + 'px';
       
        if (controlBounds.top + controlBounds.height + drawerBounds.height < document.documentElement.clientHeight) {
          this.drawer.style.top = controlBounds.top + controlBounds.height + 'px';
        } else {
          this.drawer.style.top = controlBounds.top - drawerBounds.height + 'px';
        }

        if (controlBounds.width < 180) this.drawer.classList.add('xs'); else this.drawer.classList.remove('xs');
        if (controlBounds.width >= 180 && controlBounds.width < 300) this.drawer.classList.add('sm'); else this.drawer.classList.remove('sm');
        if (controlBounds.width >= 300 && controlBounds.width < 400) this.drawer.classList.add('md'); else this.drawer.classList.remove('md');
        if (controlBounds.width >= 400) this.drawer.classList.add('lg'); else this.drawer.classList.remove('lg');
      }
    };
    window[`resize-backdrop-${this.uuid}`] = resizeHandler;
    window.addEventListener('resize', window[`resize-backdrop-${this.uuid}`]);
    // Expose resize handler for ka-controls inside drawer to trigger repositioning
    this.backdropElement.addEventListener('resize', resizeHandler);
    resizeHandler();
  }

  detachResizeHandler() {
    window.removeEventListener('resize', window[`resize-backdrop-${this.uuid}`]);
    delete window[`resize-backdrop-${this.uuid}`];
  }
}