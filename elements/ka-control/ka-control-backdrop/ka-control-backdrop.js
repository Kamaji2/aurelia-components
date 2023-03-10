require('./ka-control-backdrop.sass');

export class KaControlBackdropService {
  constructor(control, close) {
    this.element = control.element;
    this.backdrop = document.createElement('ka-control-backdrop');
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
          let boundsElement = this.element.closest('ka-control') ? this.element.closest('ka-control').querySelector('.ka-control-overlay') || this.element : this.element;
          let bounds = boundsElement.getBoundingClientRect();
          this.backdrop.appendChild(this.drawer);
          this.drawer.style.top = bounds.top + bounds.height + 'px';
          this.drawer.style.left = bounds.left + 'px';
          this.drawer.style.width = bounds.width + 'px';
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
        if (this.drawer && this.backdrop) {
          this.element.appendChild(this.drawer);
          this.drawer.removeAttribute('style');
          document.body.removeChild(this.backdrop);
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
