export class JoinValueConverter {
  toView(value, separator, key = null) {
    if (!value || !Array.isArray(value)) return value;

    return value.map((val) => {
      return key
        ? key.replaceAll(/\w+/g, (match) => (val[match]).toString())
        : val.toString();
    }).join(separator);
  }
}
