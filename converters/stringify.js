export class StringifyValueConverter {
  toView(value) {
    console.log(value);
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.warn(error);
      return value;
    }
  }
}
