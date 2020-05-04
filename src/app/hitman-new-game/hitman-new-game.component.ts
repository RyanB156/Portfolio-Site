import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input } from '@angular/core';
import { NewGameInfo, LoadGameInfo } from '../hitman-ts/Domain/domain-types';

@Component({
  selector: 'app-hitman-new-game',
  templateUrl: './hitman-new-game.component.html',
  styleUrls: ['./hitman-new-game.component.scss']
})
export class HitmanNewGameComponent implements OnInit {
  @Output() onNewGame : EventEmitter<string[]> = new EventEmitter<string[]>();
  @Output() onLoadGame : EventEmitter<FileList> = new EventEmitter<FileList>();
  @Input() showModal: boolean;

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
  }

  newGame() {
    if (this.name === ""){
      this.nameError = true;
    }
    else {
      this.onNewGame.emit([this.name, this.gender]);
      this.closeModal();
    }
  }

  loadGame() {
    if (this.files === undefined) {
      this.fileError = true;
    }
    else {
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
