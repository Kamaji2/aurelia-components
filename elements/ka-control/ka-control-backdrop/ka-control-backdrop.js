require('./ka-control-backdrop.sass');

export class KaControlBackdropService {

  constructor(element) {
    this.element = element;
    this.backdrop = document.createElement('ka-control-backdrop');
    this.backdrop.addEventListener('click', event => { if (event.target === this.backdrop) this.close(); });
  }

  open(drawer) {
    this.drawer = drawer;
    return new Promise((resolve, reject) => {
      try {
        document.body.appendChild(this.backdrop);
        setTimeout(() => {
          // Move drawer to backdrop
          let bounds = this.element.getBoundingClientRect();
          let max_h = this.backdrop.getBoundingClientRect().height;
          this.backdrop.appendChild(this.drawer);
          /*
          if (bounds.top + 280 > max_h) {
            this.drawer.style.top = 'auto';
            this.drawer.style.bottom = ((max_h - bounds.top - 30) + 60) + 'px';
          } else {
            this.drawer.style.top = bounds.top + 'px';
            this.drawer.style.bottom = 'auto';
          }
          */
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
        this.element.appendChild(this.drawer);
        this.drawer.removeAttribute('style');
        document.body.removeChild(this.backdrop);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}
