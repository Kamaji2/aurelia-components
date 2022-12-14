import { inject, customElement, bindable, InlineViewStrategy } from 'aurelia-framework';

require('./ka-heading.sass');

@customElement('ka-heading')
@inject(Element)
export class KaHeading {
  @bindable() level = null;
  @bindable() text = null;
  @bindable() icon = null;

  constructor(element) {
    this.element = element;
  }

  bind() {
    this.heading = new InlineViewStrategy(`<template><h${this.level}>${this.text}</h${this.level}></template>`);
  }
}
