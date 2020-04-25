export class Time { 
  hour: number; 
  minute: number;

  constructor() {
    this.hour = 0;
    this.minute = 0;
  }

  addTime(amount) {
    this.minute += amount;
    if (this.minute > 59) {
      this.hour += Math.floor(this.minute / 60);
      this.minute %= 60;
    }
  }

}