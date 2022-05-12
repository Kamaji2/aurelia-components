import {inject, customElement, bindable, bindingMode, BindingEngine, InlineViewStrategy, NewInstance} from 'aurelia-framework';
import {ValidationController, ValidationRules, validateTrigger} from 'aurelia-validation';

require('./ka-control.sass');

@customElement('ka-control')
@inject(Element, BindingEngine, NewInstance.of(ValidationController))
export class KaControl {
  // Basic input control properties
  @bindable() schema = null;
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;
  // Other input control bindable properties
  @bindable() name = null;
  @bindable() readonly = null;
  @bindable() required = null;
  @bindable() label = null;
  @bindable() description = null;
  @bindable() placeholder = '';
  @bindable() error = null;
  // Input control specific params property
  @bindable() params = null;
  // Other control input properties
  parentResourceName = 'resource';
  buttons = [];

  constructor(element, binding, validator) {
    this.element = element;
    this.binding = binding;
    this.validator = validator;
    this.validator.validateTrigger = validateTrigger.manual; // This is because we don't want model to be automatically validated on input blur

    ValidationRules
      .ensure('value')
      .required()
      .when(self => self.required)
      .withMessage('Campo obbligatorio')
      .equals(true)
      .when(self => self.schema.control === 'check' && self.required)
      .withMessage('Spunta obbligatoria')

      .satisfies((value, self) => value >= self.schema.min && value <= self.schema.max)
      .when(self => self.schema.control === 'number' && self.schema.min && self.schema.max)
      .withMessage('Il valore deve essere compreso tra ${schema.min} e ${schema.max}')
      .satisfies((value, self) => value >= self.schema.min)
      .when(self => self.schema.control === 'number' && self.schema.min && !self.schema.max)
      .withMessage('Il valore deve essere uguale o maggiore di ${schema.min}')
      .satisfies((value, self) => value <= self.schema.max)
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

      .satisfies((value, self) => value === null || value === '' || ((self.schema.pattern).test(value)))
      .when(self => ['text', 'textarea', 'password', 'number'].includes(self.schema.control) && self.schema.pattern)
      .withMessage('Formato non valido')

      .satisfies((value, self) => self.schema.validationRule.satisfies(value, self))
      .when(self => ['text', 'textarea', 'password', 'number'].includes(self.schema.control) && self.schema.validationRule)
      .withMessage('${schema.validationRule.withMessage}')

      .ensure('displayValue')
      .required()
      .when(self => self.required)
      .withMessage('Campo obbligatorio')
      .satisfies((value, self) => value === null || value === '' || ((/^\d{2}\/\d{2}\/\d{4}$/g).test(value) && moment(value, 'DD-MM-YYYY').isValid()))
      .when(self => self.schema.control === 'date' || self.schema.control === 'age')
      .withMessage('Formato data non valido')
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
    if (this.name && this.parentContext[this.parentResourceName]) this.bindToResource();
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
    if (!schema) return;
    this.readonly = this.readonly !== null ? String(this.readonly) === 'true' : String(schema.readonly) === 'true';
    if (!this.readonly && this.bindedToResource && this.parentContext[this.parentResourceName].readonly !== null) this.readonly = String(this.parentContext[this.parentResourceName].readonly) === 'true';
    this.required = this.required !== null ? String(this.required) === 'true' : String(schema.required) === 'true';
    this.label = this.label || schema.label || null;
    this.placeholder = this.placeholder || schema.placeholder || '';
    this.description = this.description || schema.description || null;
    this.viewStrategy = new InlineViewStrategy(`<template><ka-control-${schema.control} view-model.ref="control" schema.bind="schema" value.bind="value & validate" readonly.bind="readonly" placeholder.bind="placeholder" ${schema.control === 'check' ? 'description.bind="description"' : ''} params.bind="params"></ka-control-${schema.control}></template>`);
  }
  valueChanged(value) {
    if (this.bindedToResource && this.parentContext[this.parentResourceName].data && this.checkNested(this.parentContext[this.parentResourceName].data, this.name.split('.'))) eval(`this.parentContext.${this.parentResourceName}.data.${this.name} = value`);
    this.validate();
  }
  readonlyChanged() {
    if (!this.schema) return;
    if (String(this.schema.readonly) === 'true') this.readonly = true;
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
  dropdown() {
    if (this.control && this.control.open) this.control.open();
  }

  bindToResource() {
    if (!this.parentContext[this.parentResourceName]) return;
    const resource = this.parentContext[this.parentResourceName];
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
        this.resourceControlSchemaBinding = this.binding.expressionObserver(this, `parentContext.${this.parentResourceName}.schema.${this.name}`).subscribe((value) => this.schema = value);
      };
      setSchemaBinding();
      // Reset binding if resource schema gets entirely replaced
      this.resourceSchemaBinding = this.binding.expressionObserver(this, `parentContext.${this.parentResourceName}.schema`).subscribe((value) => setSchemaBinding());
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
        this.resourceControlValueBinding = this.binding.expressionObserver(this, `parentContext.${this.parentResourceName}.data.${this.name}`).subscribe((value) => { if (value !== this.value) this.value = value; });
      };
      setDataBinding();
      // Reset binding if resource schema gets entirely replaced
      this.resourceValueBinding = this.binding.expressionObserver(this, `parentContext.${this.parentResourceName}.data`).subscribe((value) => setDataBinding());
    }

    // Bind to parent resource readonly property
    if (!this.readonly) this.resourceReadonlyBinding = this.binding.expressionObserver(this, `parentContext.${this.parentResourceName}.readonly`).subscribe((value) => { this.readonly = value; });

    this.bindedToResource = true;
  }
  unbindFromResource() {
    if (this.resourceControlSchemaBinding) this.resourceControlSchemaBinding.dispose();
    if (this.resourceControlValueBinding) this.resourceControlValueBinding.dispose();
    if (this.resourceSchemaBinding) this.resourceSchemaBinding.dispose();
    if (this.resourceValueBinding) this.resourceValueBinding.dispose();
    if (this.resourceReadonlyBinding) this.resourceReadonlyBinding.dispose();
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
