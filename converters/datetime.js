import { DateTime } from 'luxon';

export class DatetimeFormatValueConverter {
  toView(value, format = 'dd/MM/yyyy hh:mm') {
    let date = DateTime.fromISO(value, { setZone: true }).toLocal();
    if (!date.isValid) return value;
    return date.toFormat(format);
  }
}