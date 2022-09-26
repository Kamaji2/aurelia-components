import { inject, bindable, customElement } from "aurelia-framework";

@customElement("md-table-sort")
@inject(Element)
export class MdTableSort {
  @bindable() table = {};
  @bindable() attribute = null;
  order = null;

  constructor(element) {
    this.element = element;
  }

  bind() {
    this.update();
    this.table.events.addEventListener("dataLoaded", () => {
      this.update();
    });
  }

  sort() {
    if (!this.order) this.order = "asc";
    else if (this.order === "asc") this.order = "desc";
    else if (this.order === "desc") this.order = null;
    this.table
      .load(
        null,
        this.order ? [{ name: this.attribute, order: this.order }] : []
      )
      .then(() => {
        this.update();
      });
  }

  update() {
    let item = this.table.sort?.find((x) => x.name === this.attribute);
    this.order = item?.order || null;
  }
}
