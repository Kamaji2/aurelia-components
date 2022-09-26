require("./toast.sass");

export class ToastService {
  duration = 4000;
  transition = 500;
  hold = false;
  stack = [];

  show(message = "", elementClass = "", hold = false) {
    this.stack.push({ message, elementClass, hold });
    this.consume();
  }

  consume() {
    if (this.holdedElement) {
      this.holdedElement.remove();
      this.hold = false;
      this.holdedElement = null;
    }
    if (this.stack.length && !this.hold) {
      this.hold = true;
      let current = this.stack.shift();
      let element = document.createElement("div");
      element.classList.add("ka-toast");
      element.classList.add(`ka-toast-${current.elementClass}`);
      element.innerHTML = `<div class="messages"><span>${(Array.isArray(
        current.message
      )
        ? current.message
        : [current.message]
      ).join("</span><span>")}</span></div><a href="#"></a>`;
      element.querySelector("a").addEventListener("click", ($event) => {
        $event.preventDefault();
        this.remove(element);
      });
      document.body.append(element);

      setTimeout(() => {
        element.classList.add("visible");
      }, this.transition);

      if (!current.hold) {
        this.holdedElement = null;
        setTimeout(() => {
          if (document.body.contains(element)) this.remove(element);
        }, this.duration - this.transition);
      } else {
        this.holdedElement = element;
      }
    }
  }

  remove(element) {
    element.classList.remove("visible");
    setTimeout(() => {
      element.remove();
      this.hold = false;
      this.consume();
    }, this.transition);
  }
}
