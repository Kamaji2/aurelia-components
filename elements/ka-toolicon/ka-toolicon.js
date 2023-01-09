import { inject, customElement, bindable, InlineViewStrategy } from 'aurelia-framework';
import { I18N } from 'aurelia-i18n';
import { ToastService } from 'aurelia-components';

require('./ka-toolicon.sass');

@customElement('ka-toolicon')
@inject(Element, I18N, ToastService)
export class KaToolicon {
  @bindable() tool = null;
  @bindable() source = '';
  @bindable() context = '';
  @bindable() icon = null;

  constructor(element, i18n, toast) {
    this.element = element;
    this.i18n = i18n;
    this.toast = toast;
    this.element.addEventListener('click', () => { this.click(); });
  }

  click() {
    if (this.tool === 'copy-to-clipboard') {
      if (!this.source) return console.error('ka-toolicon: missing source to be copied to clipboard!');
      navigator.clipboard.writeText(this.source);
      this.toast.show(`${this.context} ${this.i18n.tr('copied to clipboard')}!`, 'success');
    }
  }

}
