import { Component, Input, Inject, ViewChild, ElementRef, ViewChildren, QueryList, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-cmd',
  templateUrl: './cmd.component.html',
  styleUrls: ['./cmd.component.scss']
})
export class CmdComponent implements AfterViewInit {
  @Input() prompt : string;
  @Output() onSendInput : EventEmitter<any> = new EventEmitter<any>();
  @Output() onRequestAutoComplete : EventEmitter<string> = new EventEmitter<string>();
  @ViewChild("scrollFrame") scrollFrame: ElementRef;
  @ViewChildren('line') lineElements: QueryList<any>;

  scrollContainer: any;
  outputLines = [];
  input: string = "";
  document: any;
  

  context = [ "a", "ab", "abc", "abbc", "aaaabb", "abcde" ];
  history = [];
  historyPointer = 0;

  constructor(@Inject(DOCUMENT) document) { 
    this.document = document;
  }

  ngAfterViewInit(): void {
    this.scrollContainer = this.scrollFrame.nativeElement;
  }

  enterPress(evt) {
    // Prevent history from having duplicate entries.
    this.historyPointer = this.history.length;
    if (this.historyPointer == 0 || (this.historyPointer > 0 && this.input !== this.history[this.historyPointer-1])) {
      console.log("Pushing " + this.input);
      this.history.push(this.input);
      this.historyPointer++;
    }

    this.sendInput();
    this.input = "";
    this.scrollToBottom();
    evt.preventDefault();
  }

  sendInput() {
    this.onSendInput.emit(this.input);
  }

  setOutput(output) {
    this.outputLines.push(this.prompt + " " + this.input + "\n" + output);
  }

  tabPress() {
    this.onRequestAutoComplete.emit(this.input);
  }

  scrollToBottom() {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  isNearBottom() {
    const position = this.scrollContainer.scrollTop + this.scrollContainer.offsetHeight;
    const height = this.scrollContainer.scrollHeight;
    return position == height;
  }

  // Rewind to previous command in history.
  upPress(evt) {
    console.log(this.history);
    console.log(this.historyPointer);
    if (this.historyPointer > 0) {
      this.historyPointer--;
      this.input = this.history[this.historyPointer];
    }

    if (!this.isNearBottom())
      this.scrollToBottom();
    evt.preventDefault();
  }

  // Advance to next command in history.
  downPress(evt) {
    console.log(this.history);
    console.log(this.historyPointer);
    if (this.historyPointer == this.history.length)
      this.input = "";
    else if (this.historyPointer < this.history.length) {
      this.historyPointer++;
      this.input = this.history[this.historyPointer];
    }
    if (!this.isNearBottom())
      this.scrollToBottom();
    evt.preventDefault();
  }

}
