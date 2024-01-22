import { customElement, bindable } from 'aurelia-framework';
import lottie from 'lottie-web';

require('./ka-lottie.sass');

@customElement('ka-lottie')
export class KaLottie {
  @bindable() path = null; 
  @bindable() animationData = null;
  @bindable() loop = true; 
  @bindable() autoplay = true;

  static inject = [Element];
  constructor(element) {
    this.element = element;
  }

  attached() {
    let options = {
      container: this.element,
      renderer: 'svg',
      loop: String(this.loop) === 'true',
      autoplay: String(this.autoplay) === 'true'
    };
    if (this.path) options.path = this.path;
    else if (this.animationData) options.animationData = this.animationData;
    else return;
    lottie.loadAnimation(options);
  }
}
