import { Component, OnInit, ElementRef, AfterContentInit, AfterViewInit, Inject, ViewChild, ɵSWITCH_COMPILE_NGMODULE__POST_R3__ } from '@angular/core';
import { CmdComponent } from '../cmd/cmd.component';

import { Std } from './Domain/std';
import { HitmanNewGameComponent } from '../hitman-new-game/hitman-new-game.component';
import { Parser } from './Domain/parser';
import { Environment } from './Domain/environment';
import { Player } from './Domain/player';
import { Option } from './Domain/option';
import { Init } from './Domain/item';
import { Time } from './Domain/time';
import { AICall, Person } from './Domain/person';
import { Result } from './Domain/result';
import { AI } from './Domain/ai';
import { WorldGeneration } from './Domain/world-generation';
import { Personality } from './Domain/personality';
import { Info } from './Domain/info';
import { WorldLoading } from './Domain/world-loading';

/*
  TODO
    
    Test game

    Set number of objectives from start menu.

    Maybe allow multiple commands separated by semicolons. 
      The next commands should only be run if the previous ones succeed.
      The autocomplete system will only try to complete the elements at the end. Will need to track entire input but only modify end of input.

    Make cheerup, compliment, and seduce commands increase trust. Failed seduce will reduce trust as well.
*/

@Component({
  selector: 'app-hitman-ts',
  templateUrl: './hitman-ts.component.html',
  styleUrls: ['./hitman-ts.component.scss']
})
export class HitmanTSComponent implements AfterViewInit {
  @ViewChild(CmdComponent) cmdPrompt: CmdComponent;
  @ViewChild(HitmanNewGameComponent) newGame: HitmanNewGameComponent;
  document: any;
  cmd: any;

  showModal: boolean = true;

  env: Environment;
  isRunning: boolean = true;
  promptString: string;

  constructor() { 
    //this.makeNewGame(["Ryan", "male"]);
  }


  ngAfterViewInit(): void {
    this.cmd = this.cmdPrompt;
    this.cmdPrompt.onSendInput.subscribe(this.process);
    this.cmdPrompt.onRequestAutoComplete.subscribe(this.autoComplete);

    this.newGame.onLoadGame.subscribe(this.loadGame);
    this.newGame.onNewGame.subscribe(this.makeNewGame);
  }

  getFiles(evt) {
    let files = evt.target.files;
    if (files === undefined)
      alert("You must select a save file");
    else
      this.loadGame(evt.target.files);
  }
  
  private loadGame = (files: FileList) => {

    let check = () => {
      if (WorldLoading.getIsReady()) {
        let envResult = WorldLoading.readEnv();
        if (envResult.kind === "Failure") {
          this.isRunning = false;
        } else {
          this.env = envResult.value;
          this.promptString = this.makePrompt();
        }
        return;
      }
      window.setTimeout(check, 1000);
    }

    WorldLoading.startLoad();
    check();

    let saveFile = files[0];

    let reader = new FileReader();
    reader.onload = (e) => { 
      var contents = <string>e.target.result;
      WorldLoading.load(contents);   
    }
    reader.readAsText(saveFile);    
  }

  private makeNewGame = (data: string[]) => {

    let [generatedData, objectives] = WorldGeneration.spawnRooms(20);    

    WorldLoading.setRoomData(generatedData);

    let pistol = Init.initRangedWeapon("pistol", "a good pistol", 50, "vlow", 15);

    let name = data[0];
    let gender: Personality.Gender = (data[1] === "male") ? "Male" : ((data[1] === "female") ? "Female" : "Other");

    let player: Player = new Player(new Info(name, "An awesome programmer"), gender, Option.makeNone(), 
      Option.makeNone(), Option.makeNone(), 100, [pistol], Option.makeSome(pistol));

    let person: Person = new Person(new Info("Alyss", "A girl"), "Maid", "Female", "Straight", "BNeutral", "EChaotic", "MRed", 1.0);

    let forcePeople = [person];

    //Std.save(null);

    let room = WorldLoading.readRoom("spawn");
    if (room.kind === "Failure") {
    } else {
      room.value[0].addPeople(forcePeople);
      this.env = new Environment(player, room.value[0], room.value[1], new Time(0, 0), "Continue", [], [], objectives, { kills: 0 }, 0, ["spawn"]);

      this.promptString = this.makePrompt();
    }

  }


  private sendPrompt(str: string) {
    this.cmdPrompt.setPrompt(str);
  }

  private makePrompt() {
    // Create a custom prompt for the user based on equipped items, disguise, gender, health, and room name.
    let equippedString = "";
    let equippedOpt = this.env.getPlayer().getEquippedItem();
    if (equippedOpt.kind === "Some" && equippedOpt.value.kind === "Weapon") {
      if (equippedOpt.value.weaponType.kind === "MeleeWeapon")
        equippedString = `${equippedOpt.value.info.name}`;
      else
        equippedString = `${equippedOpt.value.info.name}: ${equippedOpt.value.weaponType.ammoCount}`;
    }

    // Set values in the prompt based on the current state of the player's disguise and their gender.
    let disguiseString = this.env.getPlayer().getDisguiseString();
    let playerGender = this.env.getPlayer().getGender();
    let gender = playerGender[0];

    let prompt = `${this.env.getPlayer().getName()} ${gender} ${disguiseString} ${this.env.getPlayer().getHealth()} ${equippedString} ${this.env.getRoom().getName()} $`;
    return prompt;      
    // End custom prompt.
  }

  // The player entered a command. Parse it, execute, and display any messages that come up on the screen.
  // Also check game status to see if the game should continue after each move.
  private process = (input: string) => {

    input = input.trim();

    if (input === "clear" || input === "cls") {
      this.cmdPrompt.clear();
      return;
    }

    if (this.isRunning) {

      // Run the game.
      // Process the command and run it in the game.
      let commandResult = Parser.processInput(input, this.env);
      let aiResult = this.processAI(commandResult);
      let statusResult = this.applyStatus(aiResult);

      if (statusResult.kind === "Success") {

        if (this.env.getStatus() === "PlayerDead") {
          Std.writeLine("--You Died. Game Over.--");
          this.isRunning = false;
        } else if (this.env.getStatus() === "Win") {
          Std.writeLine(`--You Win!--\nYou made ${this.env.getMoveCount()+1} commands`);
          this.isRunning = false;
        } else if (this.env.getStatus() === "PartialWin") {
          Std.writeLine(`--I guess you accomplished SOMETHING anyway--\nYou made ${this.env.getMoveCount()+1} commands`);
          this.isRunning = false;
        } else if (this.env.getStatus() === "Continue") {
          this.env.addMove();
        } else if (this.env.getStatus() === "Exit") {
          Std.writeLine(`--Thank you for playing!--`);
          this.isRunning = false;
        }
      } else {
        Std.writeLine(statusResult.value);
      }
    }

    // Read all text from the write buffer to the screen.
    let msg = "";
    while (Std.hasOutputData()) {
      msg += Std.readLine() + "\n";
    }
    this.cmdPrompt.setOutput(msg);

    // Set the prompt after processing the command.
    this.promptString = this.makePrompt();
    this.sendPrompt(this.promptString);
  }

  private autoComplete = (input: string) => {
    if (input !== undefined && input !== "") {
      let [res, isUpdated] = Parser.autoComplete(input, this.env);
      if (res.trim() !== "") {
        if (Std.hasOutputData()) {
          this.cmdPrompt.setAutocompletePrompt("Did you mean?" + " " + Std.readLine());
        }
      }
      if (isUpdated && res !== "" && res !== " ") {
        this.cmdPrompt.setInput(res);
      }
    }
  }

  processAI(result: Result.Result<AICall>) : Result.Result<boolean> {
    if (result.kind === "Failure")
      return result;
    else if (result.value.kind === "AIWait")
      return Result.makeSuccess(true);
    else {
      AI.aiAction(this.env, result.value);
      return Result.makeSuccess(true);
    }  
  }

  applyStatus(result: Result.Result<boolean>) : Result.Result<boolean> {
    if (result.kind === "Failure")
      return result;
    else {
      this.env.updatePeopleStatus();
      return Result.makeSuccess(true);
    }
  }

}
/*
            
    let chest = Init.initContainer("Chest", "A large chest", []);

    let poison = Init.initPoison("Venom", "A potent venom");

    let knife = Init.initMeleeWeapon("Knife", "A trusty knife", 50, Option.makeSome(1), "vlow", false);

    let pistol = Init.initRangedWeapon("pistol", "a good pistol", 50, "vlow", 15);

    let burger = Init.initConsumable("Burger", "A juicy burger", false, 50, 1);

    let beer = Init.initConsumable("Coors", "A beer", true, 20, 5);

    let intel = Init.initIntel("Paper", "A fancy paper");

    let car = Init.initEscape("Car", "A normal car");

    let player: Player = new Player(new Info("Ryan", "An awesome programmer"), "Male", Option.makeNone(), 
      Option.makeNone(), Option.makeNone(), 100, [knife, pistol, poison, burger, beer], Option.makeSome(pistol));

    let person: Person = new Person("Alyss", "A girl", "Maid", "Female", "Straight", "BNeutral", "EChaotic", "MRed", 1.0);

    let m4 = Init.initRangedWeapon("M4", "An assault rifle", 30, "vhigh", 50);
    let guard: Person = new Person("Guard", "A guard", "Guard", "Male", "Straight", "BBrave", "ELawful", "MBlue", 0.5);
    guard.setAwareness({ kind: "Warn" });
    guard.setIsHoldingWeapon(true);
    guard.addToInventory(m4);

    // Spawn unlocked, B locked blue, A unlocked
    // Spawn overlooks A

    let spawn: Room = new Room(new Info("Spawn", "The spawn room"), { kind: "Spawn" }, [person], [
      Init.initKey("bluekey", "A blue key", "blue"),
      intel,
      car,
      chest
    ]);
    let spawnMap: RoomMap = { kind: "RoomMap", currentRoom: "Spawn", adjacentRooms: [
      { kind: "AdjacentRoom", name: "A", lockState: { kind: "Unlocked" } },
      { kind: "AdjacentRoom", name: "B", lockState: {kind: "Locked", code: "blue" } }
    ], overlookRooms: { kind: "OverlookRooms", rooms: Option.makeSome(["A"])} };

    let room2: Room = new Room(new Info("A", "The 'A' room"), { kind: "Garden" }, [guard], []);
    let room2Map: RoomMap = { kind: "RoomMap", currentRoom: "A", adjacentRooms: [
      { kind: "AdjacentRoom", name: "Spawn", lockState: { kind: "Unlocked" } },
      { kind: "AdjacentRoom", name: "B", lockState: {kind: "Locked", code: "blue" } }
    ], overlookRooms: { kind: "OverlookRooms", rooms: Option.makeNone()} };

    let room3: Room = new Room(new Info("B", "The 'B' room"), { kind: "Patio" }, [], []);
    let room3Map: RoomMap = { kind: "RoomMap", currentRoom: "B", adjacentRooms: [
      { kind: "AdjacentRoom", name: "A", lockState: { kind: "Unlocked" } },
      { kind: "AdjacentRoom", name: "Spawn", lockState: {kind: "Unlocked" } }
    ], overlookRooms: { kind: "OverlookRooms", rooms: Option.makeNone()} }

    let killObjective: Objective.Objective = { kind: "Kill", completed: false, name: "Alyss", targetState: "Alive" };
    let itemObjective: Objective.Objective = { kind: "CollectIntel", completed: false, name: "Paper" };

    this.env = new Environment(player, spawn, spawnMap, new Time(), "Continue", [], [], [itemObjective], { kills: 0 }, 0, []);

    let roomData: [Room, RoomMap][] = [[spawn, spawnMap], [room2, room2Map], [room3, room3Map]];  

*/