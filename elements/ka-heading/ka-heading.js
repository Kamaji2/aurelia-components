import { customElement, bindable, InlineViewStrategy } from 'aurelia-framework';

require('./ka-heading.sass');

@customElement('ka-heading')
export class KaHeading {
  @bindable() level = null;
  @bindable() text = null;
  @bindable() icon = null;

  static inject = [Element];
  constructor(element) {
    this.element = element;
  }

  bind() {
    this.heading = new InlineViewStrategy(`<template><h${this.level}>${this.text}</h${this.level}></template>`);
  }
}
