import { DateTime } from 'luxon';

export class DateFormatValueConverter {
  toView(value, format = 'dd/MM/yyyy') {
    let date = DateTime.fromISO(value, { setZone: true }).toLocal();
    if (!date.isValid) return value;
    return date.toFormat(format);
  }
}