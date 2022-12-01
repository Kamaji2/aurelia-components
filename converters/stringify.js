export class StringifyValueConverter {
  toView(value, format = { indent: false, space: '\t' }) {
    try {
      return format.indent ? JSON.stringify(value, null, format.space || '\t') : JSON.stringify(value);
    } catch (error) {
      console.warn(error);
      return value;
    }
  }
  fromView(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn(error);
      return value;
    }
  }
}
