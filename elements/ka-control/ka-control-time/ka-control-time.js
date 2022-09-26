import {
  inject,
  customElement,
  bindable,
  bindingMode,
} from "aurelia-framework";
import { DateTime } from "luxon";
import { KaControlBackdropService } from "../ka-control-backdrop/ka-control-backdrop";

require("./ka-control-time.sass");

@customElement("ka-control-time")
@inject(Element)
export class KaControlTime {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value = null;

  constructor(element) {
    this.element = element;
    this.backdrop = new KaControlBackdropService(this, this.close);
  }

  attached() {
    this.element
      .querySelector("input.display-value")
      .addEventListener("dblclick", () => {
        this.open();
      });
  }

  keydown() {
    return !this.schema.readonly;
  }
  focus() {
    this.element.dispatchEvent(new Event("focus", { bubbles: true }));
  }
  blur() {
    this.element.dispatchEvent(new Event("blur", { bubbles: true }));
  }
  open() {
    this.opened = true;
    this.focus();
    this.backdrop.open(this.drawer);
  }
  close() {
    this.opened = false;
    this.blur();
    this.backdrop.close();
  }
  change() {
    setTimeout(() => {
      this.element.dispatchEvent(new Event("change", { bubbles: true }));
    }, 100);
  }
}
export class controlTimeValueConverter {
  toView(value, utc) {
    if (!/\d{2}:\d{2}:\d{2}$/.test(value)) return value;
    let date = DateTime.fromFormat(value, "HH:mm:ss");
    if (!date.isValid) return value;
    return date.toFormat("HH:mm");
  }
  fromView(value, utc) {
    if (!/^\d{2}:\d{2}$/.test(value)) return value;
    let date = DateTime.fromFormat(value, "HH:mm");
    if (!date.isValid) return value;
    return date.toFormat("HH:mm:00");
  }
}
