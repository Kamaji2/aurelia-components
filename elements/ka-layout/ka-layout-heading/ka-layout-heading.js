import {
  inject,
  customElement,
  bindable,
  InlineViewStrategy,
} from "aurelia-framework";

require("./ka-layout-heading.sass");

@customElement("ka-layout-heading")
@inject(Element)
export class KaLayoutHeading {
  @bindable() level = null;
  @bindable() text = null;
  @bindable() icon = null;

  constructor(element) {
    this.element = element;
  }

  bind() {
    this.heading = new InlineViewStrategy(
      `<template><h${this.level}>${this.text}</h${this.level}></template>`
    );
  }
}
