import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { NewGameInfo, LoadGameInfo } from '../hitman-ts/Domain/domain-types';

@Component({
  selector: 'app-hitman-new-game',
  templateUrl: './hitman-new-game.component.html',
  styleUrls: ['./hitman-new-game.component.scss']
})
export class HitmanNewGameComponent implements OnInit {
  @Output() onNewGame : EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() onLoadGame : EventEmitter<FileList> = new EventEmitter<FileList>();

  showModal: boolean = false; // TODO: Set this back to true...
  nameError: boolean = false;
  fileError: boolean = false;
  files: FileList;
  name: string = "";
  gender: string = "male";

  constructor() { }

  ngOnInit(): void {

  }

  closeModal() {
    this.showModal = false;
    console.log("Gender: " + this.gender);
  }

  newGame() {
    if (this.name === ""){
      this.nameError = true;
    }
    else {
      console.log(`Emitting ${this.name}, ${this.gender}`);
      this.onNewGame.emit([this.name, this.gender]);
      this.closeModal();
    }
  }

  loadGame() {
    if (this.files === undefined) {
      this.fileError = true;
    }
    else {
      console.log(`Emitting ${this.files}`);
      this.onLoadGame.emit(this.files);
      this.closeModal();
    }
  }

  getFiles(evt) {
    this.files = evt.target.files;
    this.fileError = false;
  }

  onSelectionChange(entry) {
    this.gender = entry;
  }

}
