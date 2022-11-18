export class StringifyValueConverter {
  toView(value, format = { indent: false, space: '\t' }) {
    console.log(value);
    try {
      return format.indent ? JSON.stringify(value, null, format.space || '\t') : JSON.stringify(value);
    } catch (error) {
      console.warn(error);
      return value;
    }
  }
}
