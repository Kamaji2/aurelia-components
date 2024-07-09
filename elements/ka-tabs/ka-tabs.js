import { inject, customElement } from 'aurelia-framework';

require('./ka-tabs.scss');

@customElement('ka-tabs')
@inject(Element)
export class KaTabs {
  tabs = [];
  constructor(element) {
    this.element = element;
    this.element.controller = this;
    // Slot content mutation observer
    const observer = new MutationObserver(() => {
      this.init();
    });
    observer.observe(this.element, { childList: true }); 
  }
  
  init() {
    this.tabs = [];
    const tabs = this.element.querySelectorAll(':scope > ka-tab');
    tabs.forEach((tab, index) => {
      this.tabs.push({
        element: tab,
        id: tab.id,
        label: tab.getAttribute('label') || tab.label || tab.id || 'tab-' + index,
        icon: tab.getAttribute('icon') || tab.icon || null,
        active: false
      });
    });
    if (!this.tabs.length) return;
    this._initialize = new Promise((resolve) => {
      this.syncSelect(location.hash.replace('#', ''), false, true)
        .then(() => {
          resolve();
        })
        .catch(() => {
          this.syncSelect(this.tabs[0].id, false, false).then(() => {
            resolve();
          });
        });
    });
  }

  async select(id, replaceState = true, traverse = false) {
    await this._initialize;
    this.syncSelect(id, replaceState, traverse);
  }
  syncSelect(id, replaceState = true, traverse = false) {
    return new Promise((resolve, reject) => {
      let tab = this.tabs.find((tab) => {
        return tab.id === id;
      });
      if (!tab) return reject();

      this.tabs.forEach((t, i) => {
        if (i < this.tabs.indexOf(tab)) {
          t.active = false;
          t.element.classList.remove('current', 'next');
          t.element.classList.add('previous');
        } else if (i === this.tabs.indexOf(tab)) {
          t.active = true;
          t.element.classList.remove('previous', 'next');
          t.element.classList.add('current');
        } else if (i > this.tabs.indexOf(tab)) {
          t.active = false;
          t.element.classList.remove('previous', 'current');
          t.element.classList.add('next');
        }
      });

      if (traverse) {
        let parentTab = this.element.closest('ka-tab');
        let parentTabs = this.element.closest('ka-tabs:not(:scope)');
        if (parentTab && parentTabs) {
          parentTabs.controller.select(parentTab.id, false, true);
        }
      }

      if (replaceState) window.history.replaceState({}, '', `#${tab.id}`);
      resolve(tab);
    });
  }
}
