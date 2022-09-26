import { bindable, inject, customAttribute } from "aurelia-framework";
import { computePosition, flip, shift, offset, arrow } from "@floating-ui/dom";

require("./ka-tooltip.sass");

@customAttribute("ka-tooltip")
@inject(Element)
export class KaTooltipCustomAttribute {
  @bindable({ primaryProperty: true }) value;
  @bindable() style;
  @bindable() placement = "top";
  constructor(element) {
    this.element = element;
  }

  attached() {
    this.element.addEventListener("mouseenter", (e) => {
      if (this.tooltip) return;
      this.tooltip = document.createElement("div");
      this.tooltip.role = "tooltip";
      this.tooltip.classList.add("ka-tooltip");
      if (this.style) this.tooltip.classList.add(this.style);
      this.tooltip.innerHTML = `<span>${this.value}</span><div></div>`;
      document
        .getElementsByTagName("body")[0]
        .insertBefore(
          this.tooltip,
          document.getElementsByTagName("body")[0].children[0]
        );

      setTimeout(() => {
        if (!this.tooltip) return;
        this.tooltip.classList.add("visible");
        const arrowElement = this.tooltip.querySelector("div");
        computePosition(e.target, this.tooltip, {
          placement: this.placement,
          middleware: [
            offset(5),
            flip(),
            shift({ padding: 5 }),
            arrow({ element: arrowElement, padding: 10 }),
          ],
        }).then(({ x, y, placement, middlewareData }) => {
          Object.assign(this.tooltip.style, {
            left: `${x}px`,
            top: `${y}px`,
          });
          // Arrow
          const { x: arrowX, y: arrowY } = middlewareData.arrow;
          const staticSide = {
            top: "bottom",
            right: "left",
            bottom: "top",
            left: "right",
          }[placement.split("-")[0]];
          Object.assign(arrowElement.style, {
            left: arrowX != null ? `${arrowX}px` : "",
            top: arrowY != null ? `${arrowY}px` : "",
            right: "",
            bottom: "",
            [staticSide]: "-4px",
          });
        });
      }, 700);
    });
    this.element.addEventListener("mouseleave", (e) => {
      if (!this.tooltip) return;
      this.tooltip.classList.remove("visible");
      setTimeout(() => {
        document.getElementsByTagName("body")[0].removeChild(this.tooltip);
        this.tooltip = null;
      }, 300);
    });
  }
  detached() {
    if (!this.tooltip) return;
    document.getElementsByTagName("body")[0].removeChild(this.tooltip);
    this.tooltip = null;
  }
}
