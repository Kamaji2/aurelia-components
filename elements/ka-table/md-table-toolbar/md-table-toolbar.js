import {inject, customElement, bindable, observable} from 'aurelia-framework';
import {TableSidebar} from '../../../classes/md-table';
@customElement('md-table-toolbar')
@inject(TableSidebar)
export class MdTableToolbar {
  @bindable() table = {};
  @bindable() search = {};
  @bindable() paginationLimits = {};
  @bindable() buttons = null;
  @bindable() download = () => {};

  constructor(sidebar) {
    this.sidebar = sidebar;
  }

  bind() {
    if (this.buttons && typeof this.buttons === 'string') this.buttons = this.buttons.split(',');
  }
  
  // Search
  openSearch() {
    this.sidebar.open({
      viewModel: PLATFORM.moduleName('resources/elements/md-table-toolbar/sidebars/search'),
      viewModelParams: { table: this.table, search: this.search }
    });
  }

  reset($event = null) {
    $event.stopPropagation();
    this.search.reset();
  }
}
