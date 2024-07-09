import { inject, customElement, bindable } from 'aurelia-framework';
import { DateTime } from 'luxon';

@customElement('ka-table-toolbar')
@inject(Element)
export class KaTableToolbar {
  @bindable() buttonSearch = () => {
    console.warn('ka-table-toolbar: buttonSearch function unset!');
  };
  @bindable() buttonDownload = () => {
    console.warn('ka-table-toolbar: buttonDownload function unset, using default!');
    this.defaultDownload();
  };
  @bindable() buttonAdd = () => {
    console.warn('ka-table-toolbar: buttonAdd function unset!');
  };
  constructor(element) {
    this.element = element;
  }
  bind(bindingContext) {
    this.interface = bindingContext && bindingContext.constructor?.name === 'TableInterface' ? bindingContext : null;
    if (!this.interface) {
      console.error('ka-table-toolbar: missing table interface!');
      return;
    }
    if (!this.interface.uuid) {
      console.error('ka-table-toolbar: cannot bind to table interface!');
      return;
    }
    this.uuid = `ka-table-toolbar-${this.interface.uuid}`;
    this.element.id = this.uuid;

    // Handle buttons configuration
    if (this.element.hasAttribute('buttons')) {
      this.buttons = this.element.getAttribute('buttons').split(',');
    }
  }

  defaultDownload() {
    if (this.pendingDefaultDownload) return;
    this.pendingDefaultDownload = true;
    this.interface.isLoading = true;

    let url = new URL(this.interface.URL);
    url.searchParams.delete('limit');
    url.searchParams.delete('offset');

    this.interface.client.client.get(url.toString()).then((xhr) => {
      // Backup and replace table rows
      const tableRows = structuredClone(this.interface.data);
      this.interface.data = xhr.response;

      setTimeout(() => {
        // Prepare data
        const tableElement = this.element.closest('ka-table').querySelector('table');
        const dataColumns = [];
        const dataRows = [];
        let dataColumnsMap = {};
        tableElement.querySelectorAll('thead tr:first-of-type th').forEach((th, index) => {
          if (th.innerText.trim().length) {
            dataColumnsMap[index] = true;
            dataColumns.push(th.innerText.trim());
          } else {
            dataColumnsMap[index] = false;
          }
        });
        if (!Object.keys(dataColumnsMap).length) {
          throw new Error('ka-table-toolbar: defaultDownload() failed due to missing column headers!');
        }
        tableElement.querySelectorAll('tbody tr').forEach((tr) => {
          let row = [];
          tr.querySelectorAll('td').forEach((td, index) => {
            if (dataColumnsMap[index]) {
              let value = (td.innerText.trim().match(/^.*$/m)||[''])[0];
              if (value.match(/;|"/)) value = `"${value.replaceAll('"', '""')}"`; // Escape csv special chars
              row.push(value);
            }
          });
          dataRows.push(row);
        });
        if (!dataRows.length) {
          throw new Error('ka-table-toolbar: defaultDownload() failed due to missing rows!');
        }
        
        // Build CSV
        let csv = [dataColumns.join(';')];
        dataRows.forEach((row) => {
          csv.push(row.join(';'));
        });
        csv = csv.join('\n');
        let blob = new Blob([csv], { type: 'text/csv' });
        let anchor = document.createElement('a');
        anchor.download = DateTime.now().toFormat('yyyy-MM-dd') + '_' + this.interface.endpoint.replace(/[^a-zA-Z0-9]/g, '') + '.csv';
        anchor.href = window.URL.createObjectURL(blob);
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        // Restore table rows
        this.interface.data = tableRows;

      }, 250);
      
    }).catch((error) => {
      console.error(error);
    }).finally(() => {
      this.pendingDefaultDownload = false;
      this.interface.isLoading = false;
    });
  }
}
