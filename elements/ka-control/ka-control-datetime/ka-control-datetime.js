import {
  inject,
  customElement,
  bindable,
  bindingMode,
} from "aurelia-framework";
import { DateTime } from "luxon";
import { KaControlBackdropService } from "../ka-control-backdrop/ka-control-backdrop";

require("./ka-control-datetime.sass");

@customElement("ka-control-datetime")
@inject(Element)
export class KaControlDate {
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
    this.focus();
    this.backdrop.open(this.drawer);
  }
  close() {
    this.change();
    this.blur();
    this.backdrop.close();
  }
  change() {
    setTimeout(() => {
      this.element.dispatchEvent(new Event("change", { bubbles: true }));
    }, 100);
  }
}
export class controlDatetimeValueConverter {
  toView(value, utc) {
    if (
      !/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/.test(
        value
      )
    )
      return value;
    let date = !(utc === false)
      ? DateTime.fromISO(value, { setZone: true }).toLocal()
      : DateTime.fromISO(value);
    if (!date.isValid) return value;
    return date.toFormat("dd/MM/yyyy HH:mm");
  }
  fromView(value, utc) {
    if (!/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(value)) return value;
    let date = DateTime.fromFormat(value, "dd/MM/yyyy HH:mm");
    if (!date.isValid) return value;
    if (!(utc === false)) date = date.toUTC();
    return date
      .set({ seconds: 0, milliseconds: 0 })
      .toISO({ suppressMilliseconds: true });
  }
}
