require('./app.scss');

import { ResourceInterface } from 'aurelia-components';

export class App {

  constructor() {
    this.resource = new ResourceInterface({
      schema: {
        c01: { control: 'text', label: 'Control c01', required: true, min: 5, max: 8 },
        c02: { control: 'check', label: 'Control c02', description: 'Check this box' },
        c03: { control: 'combo', label: 'Control c03', datasource: [{ value: 'Option 1' }, { value: 'Option 2' }, { value: 'Option 3' }], datavalue: 'value', datatext: 'value', datapreload: true },
        c04: { control: 'date', label: 'Control c04', description: 'Select a date' },
        c05: { control: 'editor', label: 'Control c05' },
        c06: { control: 'file', label: 'Control c06' },
        c07: { control: 'list', label: 'Control c07', datasource: { model: { schema: [{ control: 'text', label: 'Control c07s1' }, { control: 'text', label: 'Control c07s2' }] } } },
      }
    });
    console.log(this.resource);
    this.resource.readonly = false;
  }
}
