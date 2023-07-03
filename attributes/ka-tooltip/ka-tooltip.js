import { bindable, inject, customAttribute } from 'aurelia-framework';
import { v5 as uuidv5 } from 'uuid';
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';

require('./ka-tooltip.sass');

@customAttribute('ka-tooltip')
@inject(Element)
export class KaTooltipCustomAttribute {
  @bindable({ primaryProperty: true }) value;
  @bindable() style;
  @bindable() event = 'enter'; // enter = mouseenter/mouseleave, down = mousedown/mouseup, click = click
  @bindable() placement = 'top';
  constructor(element) {
    this.element = element;
  }

  attached() {
    this.uuid = uuidv5(this.value + this.style + this.event + this.placement, '2af1d572-a35c-4248-a38e-348c560cd468');
    if (this.event === 'click') {
      const clickHandler = (event) => {
        if (event.composedPath().includes(this.element)) {
          this.show(event);
        } else {
          this.hide();
        }
      };
      window[`click-handler-${this.uuid}`] = clickHandler;
      window.addEventListener('click', window[`click-handler-${this.uuid}`]);
    } else {
      let events;
      if (!this.event || this.event === 'enter') events = ['mouseenter', 'mouseleave'];
      else if (this.event === 'down') events = ['mousedown', 'mouseup'];
      this.element.addEventListener(events[0], (event) => {
        this.show(event);
      });
      this.element.addEventListener(events[1], () => {
        this.hide();
      });
    }
  }
  detached() {
    window.removeEventListener('click', window[`click-handler-${this.uuid}`]);
    if (!this.tooltip || !document.body.contains(this.tooltip)) return;
    document.body.removeChild(this.tooltip);
    this.tooltip = null;
  }

  click() {}

  show(event) {
    if (this.tooltip || !this.value || !this.value.trim().length) return;
    this.tooltip = document.createElement('div');
    this.tooltip.role = 'tooltip';
    this.tooltip.classList.add('ka-tooltip');
    if (this.style) this.style.split(' ').forEach((style) => {
      this.tooltip.classList.add(style);
    });
    this.tooltip.innerHTML = `<div class="value">${this.value}</div><div class="arrow"></div>`;
    document.body.insertBefore(this.tooltip, document.body.children[0]);
    setTimeout(() => {
      if (!this.tooltip) return;
      this.tooltip.classList.add('visible');
      const arrowElement = this.tooltip.querySelector('div.arrow');
      computePosition(event.target, this.tooltip, {
        placement: this.placement,
        middleware: [offset(5), flip(), shift({ padding: 5 }), arrow({ element: arrowElement, padding: 10 })]
      }).then(({ x, y, placement, middlewareData }) => {
        Object.assign(this.tooltip.style, {
          left: `${x}px`,
          top: `${y}px`
        });
        // Arrow
        const { x: arrowX, y: arrowY } = middlewareData.arrow;
        const staticSide = {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right'
        }[placement.split('-')[0]];
        Object.assign(arrowElement.style, {
          left: arrowX != null ? `${arrowX}px` : '',
          top: arrowY != null ? `${arrowY}px` : '',
          right: '',
          bottom: '',
          [staticSide]: '-4px'
        });
      });
    },
    this.event === 'enter' ? 700 : 0);
  }

  hide() {
    if (!this.tooltip) return;
    this.tooltip.classList.remove('visible');
    setTimeout(() => {
      if (!this.tooltip) return;
      document.body.removeChild(this.tooltip);
      this.tooltip = null;
    }, 300);
  }
}
