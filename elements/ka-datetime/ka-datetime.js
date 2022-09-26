import {
  inject,
  customElement,
  bindable,
  bindingMode,
} from "aurelia-framework";
import { DateTime, Info, Interval, Duration } from "luxon";

require("./ka-datetime.sass");

@customElement("ka-datetime")
@inject(Element)
export class KaDatetime {
  @bindable() type = "date";
  @bindable({ defaultBindingMode: bindingMode.twoWay }) value = null;

  constructor(element) {
    this.element = element;

    this.months = Info.months().map((month, index) => {
      return {
        numeric: parseInt(Info.months("numeric")[index], 10),
        long: Info.months("long")[index],
        short: Info.months("short")[index],
      };
    });

    this.weekdays = Info.weekdays().map((weekday, index) => {
      return {
        numeric: index + 1,
        long: Info.weekdays("long")[index],
        short: Info.weekdays("short")[index],
      };
    });

    this.hours = Array.from({ length: 24 }).map((hour, index) => {
      return index;
    });

    this.minutes = Array.from({ length: 60 }).map((minute, index) => {
      return index;
    });

    this.init();
  }

  valueChanged(value) {
    this.init();
  }
  get dateTime() {
    if (!this.value) return DateTime.now();
    let value = this.value;
    if (this.type === "date") value = DateTime.fromFormat(value, "yyyy-MM-dd");
    else if (this.type === "datetime")
      value = !(this.utc === false)
        ? DateTime.fromISO(value, { setZone: true }).toLocal()
        : DateTime.fromISO(value);
    else if (this.type === "time")
      value = DateTime.fromFormat(value, "HH:mm:ss");
    return value && value.isValid ? value : DateTime.now();
  }
  set dateTime(value) {
    if (this.type === "date") this.value = value.toFormat("yyyy-MM-dd");
    else if (this.type === "datetime")
      this.value = !(this.utc === false)
        ? value
            .set({ seconds: 0, milliseconds: 0 })
            .toUTC()
            .toISO({ suppressMilliseconds: true })
        : value
            .set({ seconds: 0, milliseconds: 0 })
            .toISO({ suppressMilliseconds: true });
    else if (this.type === "time") this.value = value.toFormat("HH:mm:00");
  }

  init() {
    let date = this.dateTime;
    this.selected = {
      day: date.get("day"),
      month: date.get("month"),
      year: date.get("year"),
      hour: date.get("hour"),
      minute: date.get("minute"),
    };

    this.years = [];
    for (let i = this.selected.year - 5; i < this.selected.year + 6; i++) {
      this.years.push(i);
    }
    this.weeks = [];
    let monthInterval = Interval.fromDateTimes(
      date.startOf("month"),
      date.endOf("month")
    );
    for (let i = 0; i < monthInterval.count("weeks"); i++) {
      let startWeek = monthInterval.start.plus({ weeks: i }).startOf("week");
      let weekInterval = Interval.fromDateTimes(
        startWeek,
        startWeek.endOf("week")
      );
      let week = [];
      weekInterval.splitBy(Duration.fromObject({ days: 1 })).forEach((day) => {
        week.push({
          day: day.start.get("day"),
          weekday: day.start.get("weekday"),
          month: day.start.get("month"),
          year: day.start.get("year"),
          value: day.start,
          text: day.start.toFormat("dd"),
        });
      });
      this.weeks.push(week);
    }
  }
  setValues(values) {
    this.dateTime = this.dateTime.set(values);
    if (values.day)
      setTimeout(() => {
        this.element.dispatchEvent(new Event("selected", { bubbles: true }));
      }, 100);
  }
  shiftValues(values) {
    this.dateTime = this.dateTime.plus(values);
  }
}
