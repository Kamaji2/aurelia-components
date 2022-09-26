import { inject, customElement, observable } from "aurelia-framework";

@customElement("ka-table-pagination")
@inject(Element)
export class KaTablePagination {
  schema = {
    limit: {
      control: "combo",
      datasource: [
        { text: "10", value: 10 },
        { text: "25", value: 25 },
        { text: "50", value: 50 },
        { text: "100", value: 100 },
      ],
      datatext: "text",
      datavalue: "value",
      datapreload: true,
      datamultiple: false,
    },
    page: {
      control: "combo",
      datasource: [],
      datatext: "text",
      datavalue: "value",
      datapreload: true,
      datamultiple: false,
    },
  };

  @observable() limit;
  @observable() page;

  constructor(element) {
    this.element = element;
  }
  bind(bindingContext) {
    this.interface = bindingContext.interface || null;
    if (!this.interface) {
      console.error("ka-table-pagination: missing table interface!");
      return;
    } else if (!this.interface.uuid) {
      console.error("ka-table-pagination: cannot bind to table interface!");
      return;
    }
    this.uuid = `ka-table-pagination-${this.interface.uuid}`;
    this.element.id = this.uuid;

    this.update();
    this.interface.events.addEventListener("load", () => {
      this.element.classList.remove("visible");
    });
    this.interface.events.addEventListener("loadSuccess", () => {
      this.update();
      this.element.classList.add("visible");
    });
    this.interface.events.addEventListener("loadFailure", () => {
      this.update();
      this.element.classList.remove("visible");
    });
  }

  update() {
    this.limit = this.interface.limit;
    this.page = this.interface.offset / this.interface.limit + 1;
  }

  limitChanged(value, old) {
    if (!value && old) value = old;
    else if (!value) return;
    this.interface.limit = value;
    this.interface.offset = 0;
    if (typeof old !== "undefined") this.applyOptions();
  }

  pageChanged(value, old) {
    if (!value && old) value = old;
    else if (!value) return;
    this.interface.offset = this.interface.limit * (value - 1);
    if (typeof old !== "undefined") this.applyOptions();
  }

  paginate(direction) {
    let page = this.page;
    let pages = Math.ceil(this.interface.total / this.interface.limit);
    if (direction === "forward" && page + 1 <= pages) this.page = page + 1;
    else if (direction === "back" && page - 1 > 0) this.page = page - 1;
    else if (direction === "start" && page !== 1) this.page = 1;
    else if (direction === "end" && pages && page !== pages) this.page = pages;
  }

  showOptions($event) {
    if (!$event.target.classList.contains("count")) return;
    let pages = Math.ceil(this.interface.total / this.interface.limit);
    let pagesDatasource = [];
    for (let i = 1; i <= pages; i++)
      pagesDatasource.push({ value: i, text: String(i) });
    this.schema.page.datasource = pagesDatasource;
    this.optionsShown = true;
  }

  hideOptions() {
    this.optionsShown = false;
  }

  applyOptions() {
    this.hideOptions();
    this.interface.load();
  }
}
export class integerCastValueConverter {
  fromView(value) {
    let parsed = value ? parseInt(value, 10) : value;
    return parsed;
  }
}
