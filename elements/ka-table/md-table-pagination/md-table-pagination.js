import {customElement, bindable, observable} from 'aurelia-framework';
@customElement('md-table-pagination')
export class MdTablePagination {
  @bindable() table = {};
  @bindable() limits = null;

  schema = {
    limit: { 
      control: 'combo',
      datasource: [{ text: '10', value: 10 }, { text: '25', value: 25 }, { text: '50', value: 50 }, { text: '100', value: 100 }],
      datatext: 'text',
      datavalue: 'value',
      datapreload: true,
      datamultiple: false
    },
    page: {
      control: 'combo',
      datasource: [],
      datatext: 'text',
      datavalue: 'value',
      datapreload: true,
      datamultiple: false
    }
  };

  @observable() limit;
  @observable() page;

  bind() {
    if (this.limits && this.limits.length > 0) {
      if (typeof this.limits === 'string') {
        this.limits = this.limits.split(',');
      }
      let datasource = [];
      this.limits.forEach(limit => {
        datasource.push({ text: String(limit), value: parseInt(limit, 10) });
      });
      this.schema.limit.datasource = datasource;
    }
    this.update();
    this.table.events.addEventListener('dataLoaded', () => { this.update(); });
  }

  update() {
    this.limit = this.table.limit;
    this.page = (this.table.offset / this.table.limit) + 1;
  }

  limitChanged(value, old) {
    if (!value && old) value = old;
    else if (!value) return;
    this.table.limit = value;
    this.table.offset = 0;
    if (typeof old !== 'undefined') this.applyOptions();
  }
  
  pageChanged(value, old) {
    if (!value && old) value = old;
    else if (!value) return;
    this.table.offset = this.table.limit * (value - 1);
    if (typeof old !== 'undefined') this.applyOptions();
  }

  paginate(direction) {
    let page = this.page;
    let pages = Math.ceil(this.table.total / this.table.limit);
    if (direction === 'forward' && page + 1 <= pages) this.page = page + 1;
    else if (direction === 'back' && page - 1 > 0) this.page = page - 1;
    else if (direction === 'start' && page !== 1) this.page = 1;
    else if (direction === 'end' && pages && page !== pages) this.page = pages;
  }

  showOptions($event) {
    if (!$event.target.classList.contains('count')) return;
    let pages = Math.ceil(this.table.total / this.table.limit);
    let pagesDatasource = [];
    for (let i = 1; i <= pages; i++) pagesDatasource.push({ value: i, text: String(i)});
    this.schema.page.datasource = pagesDatasource;
    this.optionsShown = true; 
  }

  hideOptions() {
    this.optionsShown = false;
  }

  applyOptions() {
    this.hideOptions();
    this.table.load();
  }
}
export class integerCastValueConverter {
  fromView(value) {
    let parsed = value ? parseInt(value, 10) : value;
    return parsed;
  }
}
