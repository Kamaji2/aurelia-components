import { inject, customElement } from 'aurelia-framework';

require('./ka-tabs.sass');

@customElement('ka-tabs')
@inject(Element)
export class KaTabs {
  tabs = [];
  constructor(element) {
    this.element = element;
    this.element.controller = this;
  }
  attached() {
    const tabs = this.element.querySelectorAll(':scope > ka-tab');
    //const parentTab = this.element.closest('ka-tabs:not(:scope)');
    tabs.forEach((tab, index) => {
      this.tabs.push({
        element: tab,
        id: tab.id,
        label: tab.getAttribute('label') || tab.id || 'tab-' + index,
        icon: tab.getAttribute('icon') || null,
        active: false
      });
    });
    this._initialize = new Promise((resolve) => {
      this.setSelected(location.hash.replace('#', ''), false, true).then(() => { resolve(); }).catch(() => {
        this.setSelected(this.tabs[0].id, false, false).then(() => { resolve(); });
      });
    });
  }

  async select(id, replaceState = true, traverse = false) {
    await this._initialize;
    this.setSelected(id, replaceState, traverse);
  }

  setSelected(id, replaceState = true, traverse = false) {
    console.log(`Select tab ${id.length ? id : 'NONE'} with replaceState=${replaceState} and traverse=${traverse}`);
    return new Promise((resolve, reject) => {
      let tab = this.tabs.find((tab) => { return tab.id === id });
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
          console.log('Select parent tab', parentTab.id);
          parentTabs.controller.select(parentTab.id, false, true);
        }
      }
      
      if (replaceState) window.history.replaceState({}, '', `#${tab.id}`);
      resolve(tab);
    });
  }

}
