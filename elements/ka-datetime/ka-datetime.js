import { customElement, bindable, observable, bindingMode } from 'aurelia-framework';
import { DateTime, Info, Interval, Duration } from 'luxon';

require('./ka-datetime.sass');

@customElement('ka-datetime')
export class KaDatetime {
  @bindable() type = 'date';
  @bindable() utc = true;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value = null;
  @observable() proxyValue = null;

  static inject = [Element];
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
      let initials = [];
      for (let i = 0; i < 7; i++) {
        const element = Info.weekdays()[i];
        initials.push(element.slice(0,1).toUpperCase())
      }
      return {
        numeric: index + 1,
        long: Info.weekdays('long')[index],
        short: Info.weekdays('short')[index],
        initials: initials[index]
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
    this.proxyValue = this.value;
    this.init();
  }

  valueChanged() {
    this.proxyValue = this.value;
    this.init();
  }

  proxyValueChanged() {
    this.init();
  }

  get dateTime() {
    return this.parseDateTime(this.proxyValue);
  }

  set dateTime(value) {
    if (this.type === 'date') this.proxyValue = value.toFormat('yyyy-MM-dd');
    else if (this.type === 'datetime') this.proxyValue = (this.utc ? value.toUTC() : value).set({ seconds: 0, milliseconds: 0 }).toISO({ suppressMilliseconds: true, includeOffset: this.utc });
    else if (this.type === 'time') this.proxyValue = value.toFormat('HH:mm:00');
  }

  parseDateTime(string) {
    if (!string) return DateTime.now();
    const zone = this.utc ? { zone: 'utc', setZone: true } : {};
    const dateTime = [DateTime.fromISO(string, zone), DateTime.fromSQL(string, zone)].find((dateTime) => dateTime.isValid);
    if (!dateTime || !dateTime.isValid) return DateTime.now();
    return this.utc ? dateTime.toLocal() : dateTime;
  }

  init() {
    let dateTime = this.dateTime;
    this.selected = this.parseDateTime(this.value);
    this.current = {
      day: dateTime.get('day'),
      month: dateTime.get('month'),
      year: dateTime.get('year'),
      hour: dateTime.get('hour'),
      minute: dateTime.get('minute')
    };

    this.years = [];
    for (let i = this.current.year - 5; i < this.current.year + 6; i++) {
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
      this.value = this.proxyValue;
      this.element.dispatchEvent(new Event('selected', { bubbles: true }));
    }, 100);
  }

  shiftValues(values) {
    this.dateTime = this.dateTime.plus(values);
  }
}
