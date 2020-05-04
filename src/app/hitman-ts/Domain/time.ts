export class Time { 
  hour: number; 
  minute: number;

  constructor(hour, minute) {
    this.hour = hour;
    this.minute = minute;
  }

  addTime(amount) {
    this.minute += amount;
    if (this.minute > 59) {
      this.hour += Math.floor(this.minute / 60);
      this.minute %= 60;
    }
  }

  asString() : string {
    return `${this.hour}:${this.minute}`;
  }

}