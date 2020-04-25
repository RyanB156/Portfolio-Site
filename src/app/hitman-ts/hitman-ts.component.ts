import { Component, OnInit, ElementRef, AfterContentInit, AfterViewInit, Inject, ViewChild, ɵSWITCH_COMPILE_NGMODULE__POST_R3__ } from '@angular/core';
import { CmdComponent } from '../cmd/cmd.component';
import { DOCUMENT } from '@angular/common';

import { Std } from './Domain/std';
import { List } from './Domain/list';
import { HitmanNewGameComponent } from '../hitman-new-game/hitman-new-game.component';
import { Commands } from './Domain/commands';


@Component({
  selector: 'app-hitman-ts',
  templateUrl: './hitman-ts.component.html',
  styleUrls: ['./hitman-ts.component.scss']
})
export class HitmanTSComponent implements AfterViewInit, AfterContentInit {
  @ViewChild(CmdComponent) cmdPrompt: CmdComponent;
  @ViewChild(HitmanNewGameComponent) newGame: HitmanNewGameComponent;
  document: any;
  cmd: any;
  showConfirmation: boolean = true;

  constructor(@Inject(DOCUMENT) document) { 
    this.document = document;

  }

  /*
    Use Std.writeLine(msg), and Std.readLine() for command line IO.
  */

  ngAfterViewInit(): void {
    this.cmd = this.cmdPrompt;
    this.cmdPrompt.onSendInput.subscribe(this.process);
    this.cmdPrompt.onRequestAutoComplete.subscribe(this.autoComplete);

    // TODO Create newgame and loadgame events on new game component and use these to set up the environment.
    // TODO listen for the two events from new game component.
  }

  ngAfterContentInit() : void {
    
  }

  private process = (input: string) => {

    console.log("Processing " + input);
    var output = "Processing " + input;
    this.cmdPrompt.setOutput(output);

    while (Std.hasOutputData()) {
      let msg = Std.readLine();
      this.cmdPrompt.setOutput("Buffer: " + msg);
    }
  }

  private autoComplete = (input: string) => {
    
  }

}
