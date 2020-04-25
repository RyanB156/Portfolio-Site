import { Component, OnInit } from '@angular/core';

// Import from assets/js/morse.js
declare function toMorse(s: string) : string;
declare function toEnglish(s: string) : string;

@Component({
  selector: 'app-morse-code',
  templateUrl: './morse-code.component.html',
  styleUrls: ['./morse-code.component.scss']
})
export class MorseCodeComponent implements OnInit {

  english = "";
  morse = "";


  toMorse() {
    this.english = this.english.toLowerCase();
    this.morse = toMorse(this.english);
  }

  toEnglish() {
    this.english = toEnglish(this.morse);
  }

  constructor() { }

  ngOnInit(): void {
  }

}
