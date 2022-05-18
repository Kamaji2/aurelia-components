export class StripHtmlValueConverter {
  toView(value) {
    if (!value || typeof value !== "string") return value;
    let div = document.createElement("div");
    div.innerHTML = value;
    return div.textContent || div.innerText;
  }
}
