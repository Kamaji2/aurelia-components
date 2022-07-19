import {inject, customElement, bindable, bindingMode, BindingEngine, InlineViewStrategy, NewInstance} from 'aurelia-framework';
import {ValidationController, ValidationRules, validateTrigger} from 'aurelia-validation';
import { DateTime } from 'luxon';

require('./ka-control.sass');

@customElement('ka-control')
@inject(Element, BindingEngine, NewInstance.of(ValidationController))
export class KaControl {
  @bindable() name = null;
  @bindable() schema = null;
  @bindable() client = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;

  parentResourceName = 'resource'; // default ResourceInterface name to look for in parentContext
  buttons = []; // array of button identifiers to show on control - supported value are: clear, dropdown

  constructor(element, binding, validator) {
    this.element = element;
    this.binding = binding;
    this.validator = validator;
    this.validator.validateTrigger = validateTrigger.manual; // disable default automatic validation on input blur

    ValidationRules
      .ensure('value')

      .required()
      .when(self => self.schema.required)
      .withMessage('Campo obbligatorio')

      .equals(true)
      .when(self => self.schema.control === 'check' && self.schema.required)
      .withMessage('Spunta obbligatoria')

      .satisfies((value, self) => parseInt(value, 10) >= parseInt(self.schema.min, 10) && value <= parseInt(self.schema.max, 10))
      .when(self => self.schema.control === 'number' && self.schema.min && self.schema.max)
      .withMessage('Il valore deve essere compreso tra ${schema.min} e ${schema.max}')

      .satisfies((value, self) => parseInt(value, 10) >= parseInt(self.schema.min, 10))
      .when(self => self.schema.control === 'number' && self.schema.min && !self.schema.max)
      .withMessage('Il valore deve essere uguale o maggiore di ${schema.min}')

      .satisfies((value, self) => parseInt(value, 10) <= parseInt(self.schema.max, 10))
      .when(self => self.schema.control === 'number' && !self.schema.min && self.schema.max)
      .withMessage('Il valore deve essere minore o uguale a ${schema.max}')

      .satisfies((value, self) => value.length >= self.schema.min && value.length <= self.schema.max)
      .when(self => self.value && ['text', 'textarea', 'password'].includes(self.schema.control) && self.schema.min && self.schema.max)
      .withMessage('Il numero di caratteri deve essere compreso tra ${schema.min} e ${schema.max}')
      
      .satisfies((value, self) => value.length >= self.schema.min)
      .when(self => self.value && ['text', 'textarea', 'password'].includes(self.schema.control) && self.schema.min && !self.schema.max)
      .withMessage('Il valore deve essere di almeno ${schema.min} caratteri')

      .satisfies((value, self) => value.length <= self.schema.max)
      .when(self => self.value && ['text', 'textarea', 'password'].includes(self.schema.control) && !self.schema.min && self.schema.max)
      .withMessage('Il valore non deve superare i ${schema.max} caratteri')

      .satisfies((value, self) => {
        let pattern = typeof self.schema.pattern === 'string' ? new RegExp(self.schema.pattern) : self.schema.pattern;
        return value === null || value === '' || pattern.test(value);
      })
      .when(self => ['text', 'textarea', 'password', 'number'].includes(self.schema.control) && self.schema.pattern)
      .withMessage('Formato non valido')

      .satisfies((value, self) => self.schema.validationRule.satisfies(value, self))
      .when(self => ['text', 'textarea', 'password', 'number'].includes(self.schema.control) && self.schema.validationRule)
      .withMessage('${schema.validationRule.withMessage}')

      .satisfies((value, self) => value === null || value === '' || DateTime.fromFormat(value, 'yyyy-MM-dd').isValid)
      .when(self => self.schema.control === 'date' || self.schema.control === 'age')
      .withMessage('Formato data non valido')

      .satisfies((value, self) => value === null || value === '' || DateTime.fromISO(value).isValid)
      .when(self => self.schema.control === 'datetime')
      .withMessage('Formato data/orario non valido')

      .satisfies((value, self) => value === null || value === '' || DateTime.fromFormat(value, 'HH:mm:ss').isValid)
      .when(self => self.schema.control === 'time')
      .withMessage('Formato orario non valido')
      

      .on(this);
  }

  bind(bindingContext) {
    // Reference to view-model containing this component
    this.parentContext = bindingContext;
    // Get parent resource name if passed inside name
    if (this.name && this.name.includes(':')) {
      let [parentResourceName, name] = this.name.split(':');
      this.parentResourceName = parentResourceName;
      this.name = name;
    }
    // Bind to ka-resource if any in parentContext
    if (this.name && (this.parentContext[this.parentResourceName] || this.parentContext.constructor?.name === 'ResourceInterface')) this.bindToResource();
    // Handle control if not attached to ka-resource
    if (!this.name && this.schema) this.schemaChanged(this.schema);
    // Handle buttons configuration
    if (this.element.hasAttribute('buttons')) {
      this.buttons = this.element.getAttribute('buttons').split(',');
    }
  }

  detached() {
    this.unbindFromResource();
  }

  schemaChanged(schema) {
    if (!schema || !schema.control) return;
    this.viewStrategy = new InlineViewStrategy(`<template><ka-control-${schema.control} view-model.ref="control" schema.bind="schema" value.bind="value | nullifyEmpty & validate" client.bind="client"></ka-control-${schema.control}></template>`);
  }
  valueChanged(value) {
    if (this.bindedToResource && this.bindedResource.data && this.checkNested(this.bindedResource.data, this.name.split('.'))) eval(`this.bindedResource.data.${this.name} = value`);
    this.validate();
  }

  validate() {
    let validator = this.validator.validate();
    validator.then(result => {
      if (result.valid) {
        this.element.classList.remove('error');
      } else {
        this.element.classList.add('error');
      }
    });
    return validator;
  }
  setError(message) {
    if (message && typeof message === 'string') {
      this.element.classList.add('error');
      this.validator.errors = [message];
    } else if (message) {
      this.element.classList.add('error');
      this.validator.errors = message;
    } else {
      this.element.classList.remove('error');
      this.validator.errors = [];
    }
  }
  /**
   * BUTTON FUNCTIONS
   */
  clear() {
    this.value = null;
  }
  open() {
    if (this.control && this.control.open) this.control.open();
  }

  bindToResource() {
    if (!(this.parentContext[this.parentResourceName] || this.parentContext.constructor?.name === 'ResourceInterface')) return;
    const resource = this.parentContext[this.parentResourceName] ||  this.parentContext;
    // Bind to parent resource controls
    if (resource.controls) {
      resource.controls[this.name] = this;
    }

    // Bind to parent resource schema
    if (resource.schema) {
      const setSchemaBinding = () => {
        // If resource schema is alredy set, bind to it
        if (this.checkNested(resource.schema, this.name.split('.'))) this.schema = eval(`resource.schema.${this.name}`);
        // Set observer for control's schema changes on resource
        if (this.resourceControlSchemaBinding) this.resourceControlSchemaBinding.dispose();
        this.resourceControlSchemaBinding = this.binding.expressionObserver(this, `bindedResource.schema.${this.name}`).subscribe((value) => this.schema = value);
      };
      setSchemaBinding();
      // Reset binding if resource schema gets entirely replaced
      this.resourceSchemaBinding = this.binding.expressionObserver(this, `bindedResource.schema`).subscribe((value) => setSchemaBinding());
    } else if (this.schema) {
      this.schemaChanged(this.schema);
    }

    // Bind to parent resource data
    if (resource.data) {
      // Setup resource data properties for this control if does not already exists
      this.createNested(resource.data, this.name.split('.'));
      const setDataBinding = () => {
        // If resource data is alredy set, bind to it
        if (this.checkNested(resource.data, this.name.split('.'))) this.value = eval(`resource.data.${this.name}`);
        // Set observer for control's data changes on resource
        if (this.resourceControlValueBinding) this.resourceControlValueBinding.dispose();
        this.resourceControlValueBinding = this.binding.expressionObserver(this, `bindedResource.data.${this.name}`).subscribe((value) => { if (value !== this.value) this.value = value; });
      };
      setDataBinding();
      // Reset binding if resource schema gets entirely replaced
      this.resourceValueBinding = this.binding.expressionObserver(this, `bindedResource.data`).subscribe((value) => setDataBinding());
    }
    this.bindedResource = resource;
    this.bindedToResource = true;
  }
  unbindFromResource() {
    if (this.resourceControlSchemaBinding) this.resourceControlSchemaBinding.dispose();
    if (this.resourceControlValueBinding) this.resourceControlValueBinding.dispose();
    if (this.resourceSchemaBinding) this.resourceSchemaBinding.dispose();
    if (this.resourceValueBinding) this.resourceValueBinding.dispose();
    this.bindedResource = null;
    this.bindedToResource = false;
  }
  checkNested(obj, levels) {
    let level = levels.shift();
    if (obj === undefined || !obj.hasOwnProperty(level)) return false;
    return levels.length ? this.checkNested(obj[level], levels) : true;
  }
  createNested(obj, levels) {
    let level = levels.shift();
    if (!obj.hasOwnProperty(level)) obj[level] = levels.length ? {} : null;
    return levels.length ? this.createNested(obj[level], levels) : null;
  }
}
export class NullifyEmptyValueConverter {
  fromView(value) {
    return value === '' ? null : value;
  }
}