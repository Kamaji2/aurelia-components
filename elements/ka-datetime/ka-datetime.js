import { inject, customElement, bindable, bindingMode } from 'aurelia-framework';
import { DateTime, Info, Interval, Duration } from 'luxon';

require('./ka-datetime.sass');

@customElement('ka-datetime')
@inject(Element)
export class KaDatetime {
  @bindable() type = 'date';
  @bindable() utc = true;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value = null;

  constructor(element) {
    this.element = element;

    this.months = Info.months().map((month, index) => {
      return {
        numeric: parseInt(Info.months('numeric')[index], 10),
        long: Info.months('long')[index],
        short: Info.months('short')[index]
      };
    });

    this.weekdays = Info.weekdays().map((weekday, index) => {
      return {
        numeric: index + 1,
        long: Info.weekdays('long')[index],
        short: Info.weekdays('short')[index]
      };
    });

    this.hours = Array.from({ length: 24 }).map((hour, index) => {
      return index;
    });

    this.minutes = Array.from({ length: 60 }).map((minute, index) => {
      return index;
    });
  }

  bind() {
    this.init();
  }

  valueChanged() {
    this.init();
  }
  get dateTime() {
    if (!this.value) return DateTime.now();
    const zone = this.utc ? { zone: 'utc', setZone: true } : {};
    const dateTime = [DateTime.fromISO(this.value, zone), DateTime.fromSQL(this.value, zone)].find((dateTime) => dateTime.isValid);
    if (!dateTime || !dateTime.isValid) return DateTime.now();
    return this.utc ? dateTime.toLocal() : dateTime;
  }
  set dateTime(value) {
    if (this.type === 'date') this.value = value.toFormat('yyyy-MM-dd');
    else if (this.type === 'datetime') this.value = (this.utc ? value.toUTC() : value).set({ seconds: 0, milliseconds: 0 }).toISO({ suppressMilliseconds: true, includeOffset: this.utc });
    else if (this.type === 'time') this.value = value.toFormat('HH:mm:00');
  }

  init() {
    let dateTime = this.dateTime;
    this.selected = {
      day: dateTime.get('day'),
      month: dateTime.get('month'),
      year: dateTime.get('year'),
      hour: dateTime.get('hour'),
      minute: dateTime.get('minute')
    };

    this.years = [];
    for (let i = this.selected.year - 5; i < this.selected.year + 6; i++) {
      this.years.push(i);
    }
    this.weeks = [];
    let monthInterval = Interval.fromDateTimes(dateTime.startOf('month'), dateTime.endOf('month'));
    for (let i = 0; i < monthInterval.count('weeks'); i++) {
      let startWeek = monthInterval.start.plus({ weeks: i }).startOf('week');
      let weekInterval = Interval.fromDateTimes(startWeek, startWeek.endOf('week'));
      let week = [];
      weekInterval.splitBy(Duration.fromObject({ days: 1 })).forEach((day) => {
        week.push({
          day: day.start.get('day'),
          weekday: day.start.get('weekday'),
          month: day.start.get('month'),
          year: day.start.get('year'),
          value: day.start,
          text: day.start.toFormat('dd')
        });
      });
      this.weeks.push(week);
    }
  }
  setValues(values) {
    this.dateTime = this.dateTime.set(values);
    if (values.day) setTimeout(() => {
      this.element.dispatchEvent(new Event('selected', { bubbles: true }));
    }, 100);
  }
  shiftValues(values) {
    this.dateTime = this.dateTime.plus(values);
  }
}
