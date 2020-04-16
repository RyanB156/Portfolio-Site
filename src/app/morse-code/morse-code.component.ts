import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-morse-code',
  templateUrl: './morse-code.component.html',
  styleUrls: ['./morse-code.component.scss']
})
export class MorseCodeComponent implements OnInit {

  english = "";
  morse = "";

  etom = {
    'a': '.-',
    'b': '-...',
    'c': '-.-.',
    'd': '-..',
    'e': '.',
    'f': '..-.',
    'g': '--.',
    'h': '....',
    'i': '..',
    'j': '.---',
    'k': '-.-',
    'l': '.-..',
    'm': '--',
    'n': '-.',
    'o': '---',
    'p': '.--.',
    'q': '--.-',
    'r': '.-.',
    's': '...',
    't': '-',
    'u': '..-',
    'v': '...-',
    'w': '.--',
    'x': '-..-',
    'y': '-.--',
    'z': '--..',
    '0': '-----',
    '1': '.----',
    '2': '..---',
    '3': '...--',
    '4': '....-',
    '5': '.....',
    '6': '-....',
    '7': '--...',
    '8': '---..',
    '9': '----.',
    '.': '/'
  };

  mtoe = {
    '.-': 'a',
    '-...': 'b',
    '-.-.': 'c',
    '-..': 'd',
    '.': 'e',
    '..-.': 'f',
    '--.': 'g',
    '....': 'h',
    '..': 'i',
    '.---': 'j',
    '-.-': 'k',
    '.-..': 'l',
    '--': 'm',
    '-.': 'n',
    '---': 'o',
    '.--.': 'p',
    '--.-': 'q',
    '.-.': 'r',
    '...': 's',
    '-': 't',
    '..-': 'u',
    '...-': 'v',
    '.--': 'w',
    '-..-': 'x',
    '-.--': 'y',
    '--..': 'z',
    '-----': '0',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '-....': '6',
    '--...': '7',
    '---..': '8',
    '----.': '9',
    '/': '.'
  };

  toMorse() {
    this.english = this.english.toLowerCase();
    var str = "";
    
    for (let i = 0; i < this.english.length; i++) {
      let c = this.english[i];
      // If the character has a mapping, apply the mapping.
      if (this.etom[c] !== undefined) {
        str += this.etom[c] + ' ';
      } else {
        str += c;
      }
    }

    this.morse = str;
  }

  toEnglish() {
    var str = "";
    
    this.morse.split(' ').forEach(s => {
      if (this.mtoe[s] !== undefined) {
        str += this.mtoe[s];
      } else {
        str += s;
      }
    });

    this.english = str;
  }

  constructor() { }

  ngOnInit(): void {
  }

}
