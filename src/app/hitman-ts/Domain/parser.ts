
import { Option } from './option';
import { CommandTypes } from './command-types';
import { Result } from './result';
import { Environment } from './environment';
import { AICall, Person } from './person';
import { Commands } from './commands';
import { Std } from './std';
import { List } from './list';
import { Item, getItems } from './item';
import { AdjacentRoom } from './room';

export namespace Parser {


  // Matches verbs for placing an object inside another object.
  function placeVerb(arg) {
    if (["place", "hide", "store", "put"].includes(arg))
      return Option.makeSome(arg);
    else
      return Option.makeNone();
  }
      
  function placePrep(arg) {
    return arg === "in" ? Option.makeSome(arg) : Option.makeNone();
  }
  

  // -- Match arguments to functions -- //

  let oneThingFinder = (thing: string) => (result: (s: string) => CommandTypes.CommandType) => cmd => (arg: string[]) : Result.Result<CommandTypes.CommandType> => {
    if (arg.length === 1)
      return Result.makeSuccess(result(arg[0]));
    else if (arg.length === 0)
      return Result.makeFailure(`Missing ${thing} argument for '${cmd}'`);
    else
      return Result.makeFailure(cmd + " expects one argument");
  }

  let onePersonFinder = oneThingFinder("person");

  let oneItemFinder = oneThingFinder("item");

  let oneRoomFinder = oneThingFinder("room");

  function amuse(s: string) : CommandTypes.CommandType { return { kind: "Amuse", personName: s } };
  let matchAmuse = onePersonFinder(amuse)("AMUSE");

  function matchApply(args: string[]) : Result.Result<CommandTypes.CommandType> {
    if (args.length === 3 && args[1] === "to")
      return Result.makeSuccess({ kind: "Apply", poisonName: args[0], targetName: args[2] });
    else if (args.length === 2 && args[1] === "to")
      return Result.makeFailure("Missing target argument for APPLY");
    else if (args.length === 0)
      return Result.makeFailure("Missing poison and target argument for APPLY");
    else
      return Result.makeFailure("APPLY expects two arguments. Usage: apply <poison name> to <item name>");
  }
      

  function approach(s: string) : CommandTypes.CommandType { return { kind: "Approach", personName: s } };
  let matchApproach = onePersonFinder(approach)("APPROACH");

  function attack(s: string) : CommandTypes.CommandType { return { kind: "Attack", personName: s } };
  let matchAttack = onePersonFinder(attack)("ATTACK");

  function capture(s: string) : CommandTypes.CommandType { return { kind: "Capture", personName: s } };
  let matchCapture = onePersonFinder(capture)("CAPTURE");

  function cheerUp(s: string) : CommandTypes.CommandType { return { kind: "CheerUp", personName: s } };
  let matchCheerUp = onePersonFinder(cheerUp)("CHEERUP");

  function chokeOut(s: string) : CommandTypes.CommandType { return { kind: "ChokeOut", personName: s } };
  let matchChokeOut = onePersonFinder(chokeOut)("CHOKEOUT");

  function aiCmd(x: string) : Option.Option<string> {
    return Commands.aiCommandList.includes(x) ? Option.makeSome(x) : Option.makeNone();
  }

  function matchCommand(args: string[]) : Result.Result<CommandTypes.CommandType> {
    function cmd3Args(cmd: string, target: string) : CommandTypes.AICommand {
      switch (cmd) {
        case "attack": return { kind: "AIAttack", personName: target };
        case "goto": return { kind: "AIGoto", roomName: target };
        case "pickup": return { kind: "AIPickup", itemName: target };
        default: throw new Error("Parser.matchCommand: Internal Match Error");
      }
    }
    function cmd2Args(cmd) : CommandTypes.AICommand {
      switch (cmd) {
        case "stop": return { kind: "AIStop" };
        case "killyourself": return { kind: "AISuicide"};
        default: throw new Error("Parser.matchCommand: Internal Match Error");
      }
    }

    if (args.length >= 2 && args.length <= 3) {
      let cmdOpt = aiCmd(args[1]);
      if (cmdOpt.kind === "None")
        return Result.makeFailure("COMMAND expects three arguments");
      else if (args.length === 3){
        return Result.makeSuccess({ kind: "Command", personName: args[0], command: cmd3Args(cmdOpt.value, args[2]) });
      } else {
        return Result.makeSuccess({ kind: "Command", personName: args[0], command: cmd2Args(cmdOpt.value) });
      }
    } else if (args.length === 1) {
      return Result.makeFailure("Missing command argument for COMMAND");
    } else {
      return Result.makeFailure("COMMAND expects three arguments");
    }
  }

  
  function compliment(s: string) : CommandTypes.CommandType { return { kind: "Compliment", personName: s } };
  let matchCompliment = onePersonFinder(compliment)("COMPLIMENT");

  function consume(s: string) : CommandTypes.CommandType { return { kind: "Consume", itemName: s } };
  let matchConsume = oneItemFinder(consume)("CONSUME");

  function matchDescribe(args: string[]) : Result.Result<CommandTypes.CommandType> {
    if (args[0] === "area" && args.length === 1)
      return Result.makeSuccess({ kind: "Describe", arg: { kind: "DescribeArea" } });
    else if (args[0] === "item" && args.length === 2)
      return Result.makeSuccess({ kind: "Describe", arg: { kind: "DescribeItem", itemName: args[1] } });
    else if (args[0] === "person" && args.length === 2)
      return Result.makeSuccess({ kind: "Describe", arg: { kind: "DescribePerson", personName: args[1] } });
    else
      return Result.makeFailure("Invalid arguments for DESCRIBE");
  }

  function disguise(s: string) : CommandTypes.CommandType { return { kind: "Disguise", personName: s } };
  let matchDisguise = onePersonFinder(disguise)("DISGUISE");

  function dishearten(s: string) : CommandTypes.CommandType { return { kind: "Dishearten", personName: s } };
  let matchDishearten = onePersonFinder(dishearten)("DISHEARTEN");

  function drop(s: string) : CommandTypes.CommandType { return { kind: "Drop", itemName: s } };
  let matchDrop = oneItemFinder(drop)("DROP");

  function escape(s: string) : CommandTypes.CommandType { return { kind: "Escape", itemName: s } };
  let matchEscape = oneItemFinder(escape)("ESCAPE");

  function equip(s: string) : CommandTypes.CommandType { return { kind: "Equip", itemName: s } };
  let matchEquip = oneItemFinder(equip)("EQUIP");

  function followMe(s: string) : CommandTypes.CommandType { return { kind: "FollowMe", personName: s } };
  let matchFollowMe = onePersonFinder(followMe)("FOLLOWME");

  function matchGive(args: string[]) : Result.Result<CommandTypes.CommandType> {
    if (args.length === 3 && args[1] === "to")
      return Result.makeSuccess({ kind: "Give", itemName: args[0], personName: args[2] });
    else if (args.length === 2 && args[1] === "to")
      return Result.makeFailure("Missing the Person argument to GIVE");
    else
      return Result.makeFailure("GIVE expects an item and a person as arguments");
    }
  
  function matchGoto(args: string[]) : Result.Result<CommandTypes.CommandType> {
    if (args.length <= 1)
      return Result.makeSuccess({ kind: "Goto", gotoArg: args.length === 1 ? Option.makeSome(args[0]) : Option.makeNone() });
    else
      return Result.makeFailure("GOTO expects one or zero arguments");
  }

  function gotoForce(s: string) : CommandTypes.CommandType { return { kind: "GotoForce", roomName: s } };
  let matchGotoForce = oneRoomFinder(gotoForce)("GOTOFORCE");

  function matchHelp(args: string[]) : Result.Result<CommandTypes.CommandType> {
    if (args.length <= 1)
      return Result.makeSuccess({ kind: "Help", helpArg: args.length === 1 ? Option.makeSome(args[0]) : Option.makeNone() });
    else
      return Result.makeFailure("HELP expects one or zero arguments");
  }

  function matchInquire(args: string[]) : Result.Result<CommandTypes.CommandType> {
    if (args.length === 0)
      return Result.makeFailure("Missing question and person argument for INQUIRE");
    else if (args.length === 1)
      return Result.makeFailure("Missing person argument for INQUIRE");
    else if (args.length === 2)
      return Result.makeSuccess({ kind: "Inquire", question: args[0], personName: args[1] });
    else
      return Result.makeFailure("INQUIRE expects two arguments");

  }

  function inspect(s: string) : CommandTypes.CommandType { return { kind: "Inspect", itemName: s } };
  let matchInspect = oneItemFinder(inspect)("INSPECT");

  function intimidate(s: string) : CommandTypes.CommandType { return { kind: "Intimidate", personName: s } };
  let matchIntimidate = onePersonFinder(intimidate)("INTIMIDATE");

  function matchLeaveMe(args: string[]) : Result.Result<CommandTypes.CommandType> {
    return args.length === 0 ? Result.makeSuccess({ kind: "LeaveMe" }) : Result.makeFailure("LEAVEME does not take any arguments");
  }
  
  function peek(s: string) : CommandTypes.CommandType { return { kind: "Peek", roomName: s } };
  let matchPeek = oneRoomFinder(peek)("PEEK");

  function pickup(s: string) : CommandTypes.CommandType { return { kind: "Pickup", itemName: s } };
  let matchPickup = oneItemFinder(pickup)("PICKUP");

  function matchPlace(args: string[]) : Result.Result<CommandTypes.CommandType> {
    if (args.length === 3 && placePrep(args[1]).kind === "Some")
      return Result.makeSuccess({ kind: "Place", itemName: args[0], containerName: args[2] });
    else if (args.length >= 1 && placePrep(args[0]).kind === "Some")
      return Result.makeFailure("Missing item argument for PLACE");
    else if (args.length === 3 && placePrep(args[1]).kind === "None")
      return Result.makeFailure("Missing target argument for PLACE");
    else
      return Result.makeFailure("Invalid arguments to PLACE");
  }


  function punch(s: string) : CommandTypes.CommandType { return { kind: "Punch", personName: s } };
  let matchPunch = onePersonFinder(punch)("PUNCH");

  function matchQuit(args) : Result.Result<CommandTypes.CommandType> { return Result.makeSuccess({ kind: "Quit" }); }

  function romance(s: string) : CommandTypes.CommandType { return { kind: "Romance", personName: s } };
  let matchRomance = onePersonFinder(romance)("ROMANCE");

  function matchSave(args) : Result.Result<CommandTypes.CommandType> { return Result.makeSuccess({ kind: "Save" }) }

  function scout(s: string) : CommandTypes.CommandType { return { kind: "Scout", roomName: s } };
  let matchScout = oneRoomFinder(scout)("SCOUT");

  function matchSearch(args: string[]) : Result.Result<CommandTypes.CommandType> {
    if (args.length === 1 && args[0] === "area" || args.length === 0)
      return Result.makeSuccess({ kind: "Search", searchArg: { kind: "SearchArea" } });
    else if (args.length === 1)
      return Result.makeSuccess({ kind: "Search", searchArg: { kind: "SearchItem", itemName: args[0] } });
    else
      return Result.makeFailure("Invalid argument(s) for SEARCH");
  }

  function seduce(s: string) : CommandTypes.CommandType { return { kind: "Seduce", personName: s } };
  let matchSeduce = onePersonFinder(seduce)("SEDUCE");

  function matchSurvey(args: string[]) : Result.Result<CommandTypes.CommandType> {
    return args.length === 0 ? Result.makeSuccess({ kind: "Survey" }) : Result.makeFailure("SURVEY does not take any arguments");
  }


  function matchTakeFrom(args: string[]) : Result.Result<CommandTypes.CommandType> {
    if (args.length === 2)
      return Result.makeSuccess({ kind: "TakeFrom", personName: args[0], itemName: args[1] });
    else if (args.length === 1)
      return Result.makeFailure("Missing target argument for TAKEFROM");
    else
      return Result.makeFailure("TAKEFROM expects an item and person as arguments");
  }

  function talk(s: string) : CommandTypes.CommandType { return { kind: "Talk", personName: s } };
  let matchTalk = onePersonFinder(talk)("TALK");

  function matchUnequip(args: string[]) : Result.Result<CommandTypes.CommandType> {
    return args.length === 0 ? Result.makeSuccess({ kind: "Unequip" }) : Result.makeFailure("UNEQUIP does not take any arguments");
  }

  function unlock(s: string) : CommandTypes.CommandType { return { kind: "Unlock", roomName: s } };
  let matchUnlock = oneRoomFinder(unlock)("UNLOCK");

/*
  export interface Inventory { kind: "Inventory" }
  export interface Time { kind: "Time" }
  export interface PlayerStats { kind: "PlayerStats" }
  export interface PersonStats { kind: "PersonStats", personName: string }
  export interface CompanionName { kind: "CompanionName" }
  export interface Objectives { kind: "Objectives" }
  export interface VisitedRooms { kind: "VisitedRooms" }
  export type ViewArg = Inventory | Time | PlayerStats | PersonStats | CompanionName | Objectives | VisitedRooms

  export interface View { kind: "View", viewArg: ViewArg }
*/

  function matchView(args: string[]) : Result.Result<CommandTypes.CommandType> {
    if (args.length === 2 && args[0] === "my" && args[1] === "stats") {
      return Result.makeSuccess({ kind: "View", viewArg: { kind: "PlayerStats" } });
    } else if (args.length === 2 && args[0] === "my" && args[1] === "companion") {
      return Result.makeSuccess({ kind: "View", viewArg: { kind: "CompanionName" } });
    } else if (args.length === 2 && args[0] === "stats") {
      return Result.makeSuccess({ kind: "View", viewArg: { kind: "PersonStats", personName: args[1] } });
    } else if (args.length === 1 && (args[0] === "items" || args[0] === "inventory")) {
      return Result.makeSuccess({ kind: "View", viewArg: { kind: "Inventory" } });
    } else if (args.length === 1 && args[0] === "time") {
      return Result.makeSuccess({ kind: "View", viewArg: { kind: "Time" } });
    } else if (args.length === 1 && args[0] === "objectives") {
      return Result.makeSuccess({ kind: "View", viewArg: { kind: "Objectives" } });
    } else if (args.length === 1 && args[0] === "visitedrooms") {
      return Result.makeSuccess({ kind: "View", viewArg: { kind: "VisitedRooms" } });
    } else if (args.length === 1 && args[0] === "stats") {
      return Result.makeFailure("Missing person argument to VIEW Stats");
    } else if (args.length === 1) {
      return Result.makeFailure(`Invalid argument for VIEW: ${args[0]}`);
    } else {
      return Result.makeFailure("Invalid arguments for VIEW");
    }
  }

  // -- Match parsed out command

  function runCommand(cmd: CommandTypes.CommandType, env: Environment) : Result.Result<AICall> {
    switch (cmd.kind) {
      case "Amuse": return Commands.amuse(cmd.personName, env);
      case "Apply": return Commands.apply(cmd.poisonName, cmd.targetName, env);
      case "Approach": return Commands.approach(cmd.personName, env);
      case "Attack": return Commands.attack(cmd.personName, env);
      case "Capture": return Commands.capture(cmd.personName, env);
      case "CheerUp": return Commands.cheerup(cmd.personName, env);
      case "ChokeOut": return Commands.chokeOut(cmd.personName, env);
      case "Command": return Commands.command(cmd.personName, cmd.command, env);
      case "Compliment": return Commands.compliment(cmd.personName, env);
      case "Consume": return Commands.consume(cmd.itemName, env);
      case "Diagnose": Std.writeLine(env.toString()); return Result.makeSuccess({ kind: "AIWait" });
      case "Disguise": return Commands.disguise(cmd.personName, env);
      case "Dishearten": return Commands.dishearten(cmd.personName, env);
      case "Drop": return Commands.drop(cmd.itemName, env);
      case "Describe": return Commands.describe(cmd.arg, env);
      case "Escape": return Commands.escape(cmd.itemName, env);
      case "Equip": return Commands.equip(cmd.itemName, env);
      case "FollowMe": return Commands.followMe(cmd.personName, env);
      case "Give": return Commands.give(cmd.itemName, cmd.personName, env);
      case "Goto": return Commands.goto(cmd.gotoArg, false, env);
      case "GotoForce": return Commands.forceGoto(Option.makeSome(cmd.roomName), env);
      case "Help": return Commands.help(cmd.helpArg);
      case "Inquire": return Commands.inquire(cmd.question, cmd.personName, env);
      case "Inspect": return Commands.inspect(cmd.itemName, env);
      case "Intimidate": return Commands.intimidate(cmd.personName, env);
      case "LeaveMe": return Commands.leaveMe(env);
      case "Peek": return Commands.peek(cmd.roomName, env);
      case "Pickup": return Commands.pickup(cmd.itemName, env);
      case "Place": return Commands.place(cmd.itemName, cmd.containerName, env);
      case "Punch": return Commands.punch(cmd.personName, env);
      case "Quit": return Commands.quit(env);
      case "Romance": return Commands.romance(cmd.personName, env);
      case "Save": return Commands.save(env);
      case "Scout": return Commands.scout(cmd.roomName, env);
      case "Search": return Commands.search(cmd.searchArg, env);
      case "Seduce": return Commands.seduce(cmd.personName, env);
      case "Survey": return Commands.survey(env);
      case "TakeFrom": return Commands.takeFrom(cmd.personName, cmd.itemName, env);
      case "Talk": return Commands.talk(cmd.personName, env);
      case "Teleport": return Commands.teleport(cmd.roomName, env);
      case "Unequip": return Commands.unequip(env);
      case "Unlock": return Commands.unlock(cmd.roomName, env);
      case "View": return Commands.view(cmd.viewArg, env);
      case "Wait": return Commands.wait(env);
      default: return Result.makeFailure(`You messed up. ${cmd} slipped through`);
    }
  }

      
  /// Parses the command line. Evaluating the argument is handled inside the function call for each command.
  function scanCommand(input: string) : Result.Result<CommandTypes.CommandType> {
    // Converts string to lowercase, removes trailing whitespace, and splits it based on spaces.
    //let splitCommands = input.ToLower().Trim().Split([|' '|], StringSplitOptions.RemoveEmptyEntries)  |> Array.toList
    let splitCommands = input.toLowerCase().trim().split(" ").filter(s => s !== "" && s !== " ");
    
    switch (splitCommands[0]) {
      case "amuse": return matchAmuse(splitCommands.slice(1))
      case "apply": return matchApply(splitCommands.slice(1))
      case "approach": return matchApproach(splitCommands.slice(1))
      case "attack": return matchAttack(splitCommands.slice(1))
      case "capture": return matchCapture(splitCommands.slice(1))
      case "cheerup": return matchCheerUp(splitCommands.slice(1))
      case "chokeout": return matchChokeOut(splitCommands.slice(1))
      case "command": return matchCommand(splitCommands.slice(1))
      case "compliment": return matchCompliment(splitCommands.slice(1))
      case "consume": return matchConsume(splitCommands.slice(1))
      case "describe": return matchDescribe(splitCommands.slice(1))
      case "diagnose": return Result.makeSuccess({ kind: "Diagnose" });
      case "disguise": return matchDisguise(splitCommands.slice(1))
      case "dishearten": return matchDishearten(splitCommands.slice(1))
      case "drop": return matchDrop(splitCommands.slice(1))
      case "escape": return matchEscape(splitCommands.slice(1))
      case "equip": return matchEquip(splitCommands.slice(1))
      case "followme": return matchFollowMe(splitCommands.slice(1))
      case "give": return matchGive(splitCommands.slice(1))
      case "goto": return matchGoto(splitCommands.slice(1))
      case "forcegoto": return matchGotoForce(splitCommands.slice(1))
      case "help": return matchHelp(splitCommands.slice(1))
      case "inquire": return matchInquire(splitCommands.slice(1))
      case "inspect": return matchInspect(splitCommands.slice(1))
      case "intimidate": return matchIntimidate(splitCommands.slice(1))
      case "leaveme": return matchLeaveMe(splitCommands.slice(1))
      case "peek": return matchPeek(splitCommands.slice(1))
      case "pickup": return matchPickup(splitCommands.slice(1))
      case "place": return matchPlace(splitCommands.slice(1))
      case "punch": return matchPunch(splitCommands.slice(1))
      case "quit": return matchQuit(splitCommands.slice(1))
      case "romance": return matchRomance(splitCommands.slice(1))
      case "save": return matchSave(splitCommands.slice(1))
      case "scout": return matchScout(splitCommands.slice(1))
      case "search": return matchSearch(splitCommands.slice(1))
      case "seduce": return matchSeduce(splitCommands.slice(1))
      case "survey": return matchSurvey(splitCommands.slice(1))
      case "takefrom": return matchTakeFrom(splitCommands.slice(1))
      case "teleport": return splitCommands.length === 2 ? Result.makeSuccess({ kind: "Teleport", roomName: splitCommands[1] }) : Result.makeFailure("Teleport expects a room argument");
      case "unequip": return matchUnequip(splitCommands.slice(1))
      case "talk": return matchTalk(splitCommands.slice(1))
      case "unlock": return matchUnlock(splitCommands.slice(1))
      case "view": return matchView(splitCommands.slice(1))
      case "wait": return Result.makeSuccess({ kind: "Wait" });
      default:
        if (splitCommands.length === 0)
          return Result.makeFailure ("");
        else {
          return Result.makeFailure(Commands.printSuggestions(splitCommands[0], 1));
        }
    }
  }
      
            
  // Scan the command to match the arguments then send to Commands.fs to run the command.
  // Then the environment is sent to AI.fs to process the AI's action.
  export function processInput(command: string, env: Environment) : Result.Result<AICall> {
    let scanResult = scanCommand(command);
    if (scanResult.kind === "Failure")
      return scanResult;
    else
      return runCommand(scanResult.value, env);
  }
  

  // ------ Key Input and Autocomplete ------ //
  let implode = (cs: string[]) => List.reduce((a, b) => a + b, cs);

  // Returns a list of suggestions. The suggestions will contain initial characters that match the pattern.
  function stringMatch(matchStrings: string[], pattern: string) : string {
    let suggestions = List.map((p: [number, string]) => p[1], Commands.getSuggestions(matchStrings, pattern, 1));
    return suggestions.length >= 1 ? List.reduce((a: string, b: string) => a + " " + b, suggestions) : "";
  }

  function personInquiry(inquiry: string) : Option.Option<string> {
    return Person.inquireInfo.includes(inquiry) ? Option.makeSome(inquiry) : Option.makeNone();
  }
  
  function matchRoomPeople(env: Environment, name: string) : string {
    return stringMatch(List.map((p: Person) => p.getName().toLowerCase(), env.getRoom().getPeople()), name);
  }

  function matchInventoryItem(env: Environment, name: string) : string {
    return stringMatch(List.map((i: Item) => i.info.name.toLowerCase(), env.getPlayer().getItems()), name);
  }

  function matchRoomItem(env: Environment, name: string) : string {
    return stringMatch(List.map((i: Item) => i.info.name.toLowerCase(), env.getRoom().getItems()), name);
  }
  
  function matchAllItems(env: Environment, name: string) : string {
    let allItems = List.map((i: Item) => i.info.name.toLowerCase(), env.getRoom().getItems()).concat(List.map((i: Item) => i.info.name.toLowerCase(), env.getPlayer().getItems()));
    return stringMatch(allItems, name);
  }

  function matchPeopleAndItems(env: Environment, name: string) : string {
    let peopleNames = List.map((p: Person) => p.getName().toLowerCase(), env.getRoom().getPeople());
    let itemNames = List.map((i: Item) => i.info.name.toLowerCase(), env.getRoom().getItems());
    return stringMatch(peopleNames.concat(itemNames), name);
  }

  function matchContainerItems(env: Environment, container: Item, itemName: string) : string {
    if (container.kind === "Container") {
      return stringMatch(List.map((i: Item) => i.info.name.toLowerCase(), container.items), itemName);
    } else {
      return "";
    }
  }

  function matchPersonItems(env: Environment, person: Person, itemName: string) : string {
    let items = person.getItems();
    return stringMatch(List.map((i: Item) => i.info.name.toLowerCase(), items), itemName);
  }

  function matchPersonOrContainerItems(env: Environment, targetName: string, itemName: string) : string {
    let personResult = env.tryFindPersonByNameLower(targetName); // Check if the target is a person.
    if (personResult.kind === "Some") { // If so, match against the person's items.
      return matchPersonItems(env, personResult.value, itemName);
    } else { // Otherwise, check if the target is a container.
      let containerResult = env.tryFindItemByName(targetName);
      if (containerResult.kind === "Some") {
        return matchContainerItems(env, containerResult.value, itemName);
      } else {
        return "";
      }
    }
  }

  function matchAdjacentRooms(env: Environment, name: string) : string {
    return stringMatch(List.map((a: AdjacentRoom) => a.name.toLowerCase(), env.getMap().adjacentRooms), name);
  }

  function matchOverlookRooms(env: Environment, name: string) : string {
    let ovl = env.getMap().overlookRooms;
    if (ovl.rooms.kind === "None")
      return "";
    else
      return stringMatch(List.map(s => s.toLowerCase(), ovl.rooms.value), name);
  }

  function holderItemSearch(targetName: string, itemName: string, env: Environment) {
    let personResult = env.tryFindPersonByName(targetName);
    if (personResult.kind === "Some") {
      return stringMatch(List.map((i: Item) => i.info.name.toLowerCase(), personResult.value.getItems()), itemName);
    } else {
      let containerResult = env.tryFindItemByName(targetName);
      if (containerResult.kind === "Some" && containerResult.value.kind === "Container") {
        return stringMatch(List.map((i: Item) => i.info.name.toLowerCase(), containerResult.value.items), itemName);
      } else {
        return "";
      }
    }
  }


  // *** Note: Route this to output if returning a list, to input if returning a single item (Wrap match function inside one that returns a special type)
  export function autoComplete(incompleteText: string, env: Environment) : [string, boolean] {

    if (incompleteText === undefined || incompleteText === "")
      return ["", false];

    let textArgs = incompleteText.toLowerCase().trim().split(" ").filter(s => s !== " " && s !== "");

    if (textArgs.length >= 1) {
      if (textArgs.length === 2 && textArgs[0] === "amuse") return ["amuse " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs[0] === "apply") {
        if (textArgs.length === 2) return [`apply ${matchInventoryItem(env, textArgs[1])} to `, true];
        else if (textArgs.length === 4 && textArgs[2] === "to") return [`apply ${textArgs[1]} to ${matchInventoryItem(env, textArgs[3])}`, true];
        else return ["apply ", true];
      }
      else if (textArgs.length === 2 && textArgs[0] === "approach") return ["approach " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "attack") return ["attack " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "capture") return ["capture " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "cheerup") return ["cheerup " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "chokeout") return ["chokeout " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs[0] === "command") {
        if (textArgs.length === 3 && textArgs[2] === "stop") return [`command ${textArgs[1]} stop`, true];
        else if (textArgs.length === 3 && textArgs[2] === "killyourself") return [`command ${textArgs[1]} killyourself`, true];
        else if (textArgs.length === 4 && textArgs[2] === "goto") return [`command ${textArgs[1]} goto ${matchAdjacentRooms(env, textArgs[3])}`, true];
        else if (textArgs.length === 4 && textArgs[2] === "pickup") return [`command ${textArgs[1]} pickup ${matchRoomItem(env, textArgs[3])}`, true];
        else if (textArgs.length === 3) return [`command ${textArgs[1]} ${stringMatch(Commands.aiCommandList, textArgs[2])} `, true];
        else if (textArgs.length === 2) return [`command ${matchRoomPeople(env, textArgs[1])} `, true];
        else return ["command ", true];
      }  
      else if (textArgs.length === 2 && textArgs[0] === "compliment") return ["compliment " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "consume") return ["consume " + matchInventoryItem(env, textArgs[1]), true];
      else if (textArgs[0] === "describe") {
        if (textArgs.length === 3 && textArgs[1] === "item") return ["describe item " + matchAllItems(env, textArgs[2]), true];
        else if (textArgs.length === 3 && textArgs[1] === "person") return ["describe person " + matchRoomPeople(env, textArgs[2]), true];
        else if (textArgs.length === 2) return [`describe ${stringMatch(["area", "item", "person"], textArgs[1])} `, true];
        else return ["describe ", true];
      }
      else if (textArgs[0] === "diagnose") return ["diagnose", true];
      else if (textArgs.length === 2 && textArgs[0] === "disguise") return ["disguise " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "dishearten") return ["dishearten " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "drop") return ["drop " + matchInventoryItem(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "escape") return ["escape " + matchRoomItem(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "equip") return ["equip " + matchInventoryItem(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "followme") return ["followme " + matchRoomPeople(env, textArgs[1]), true];

      else if (textArgs[0] === "give") {
        if (textArgs.length === 2) return [`give ${matchInventoryItem(env, textArgs[1])} to `, true];
        else if (textArgs.length === 4 && textArgs[2] === "to") return [`give ${textArgs[1]} to ${matchRoomPeople(env, textArgs[3])}`, true];
        else return ["give ", true];
      }
      else if (textArgs.length === 2 && textArgs[0] === "goto") return ["goto " + matchAdjacentRooms(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "forcegoto") return ["forcegoto " + matchAdjacentRooms(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "help") return ["help " + stringMatch(Array.from(Commands.commandList.keys()), textArgs[1]), true];

      else if (textArgs[0] === "inquire") {
        if (textArgs.length === 3 && personInquiry(textArgs[1]).kind === "Some") return [`inquire ${textArgs[1]} ${matchRoomPeople(env, textArgs[2])}`, true];
        else if (textArgs.length === 2) return [`inquire ${stringMatch(Person.inquireInfo, textArgs[1])} `, true];
        else return ["inquire ", true];
      }
      else if (textArgs.length === 2 && textArgs[0] === "inspect") return ["inspect " + matchAllItems(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "intimidate") return ["intimidate " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs.length === 1 && textArgs[0] === "leaveme") return ["leaveme ", true];
      else if (textArgs.length === 1 && textArgs[0] === "load") return ["load ", true];
      else if (textArgs.length === 2 && textArgs[0] === "peek") return ["peek " + matchAdjacentRooms(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "pickup") return ["pickup " + matchRoomItem(env, textArgs[1]), true];

      else if (textArgs[0] === "place") {
        if (textArgs.length === 2) return [`place ${matchInventoryItem(env, textArgs[1])} in `, true];
        else if (textArgs.length === 4 && textArgs[2] === "in") return [`place ${textArgs[1]} ${textArgs[2]} ${matchRoomItem(env, textArgs[3])}`, true];
        else if (textArgs.length === 2) return [`place ${textArgs[1]}`, true];
        else return ["place ", true];
      }
      else if (textArgs.length === 2 && textArgs[0] === "punch") return ["punch " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs.length === 1 && textArgs[0] === "quit") return ["quit ", true];
      else if (textArgs.length === 2 && textArgs[0] === "romance") return ["romance " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs.length === 1 && textArgs[0] === "save") return ["save ", true];
      else if (textArgs.length === 2 && textArgs[0] === "scout") return ["scout " + matchOverlookRooms(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "search") return ["search " + stringMatch(List.map((i: Item) => i.info.name.toLowerCase(), env.getRoom().getItems()).concat(["area"]), textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "seduce") return ["seduce " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs.length === 1 && textArgs[0] === "survey") return ["survey ", true];

      else if (textArgs[0] === "takefrom") {
        if (textArgs.length === 2) return [`takefrom ${matchPeopleAndItems(env, textArgs[1])} `, true];
        else if (textArgs.length === 3) return [`takefrom ${textArgs[1]} ${matchPersonOrContainerItems(env, textArgs[1], textArgs[2])}`, true];
        else return ["takefrom ", true];
      }
      else if (textArgs.length === 2 && textArgs[0] === "talk") return ["talk " + matchRoomPeople(env, textArgs[1]), true];
      else if (textArgs.length === 2 && textArgs[0] === "unequip") return ["unequip ", true];
      else if (textArgs.length === 2 && textArgs[0] === "unlock") return ["unlock " + matchAdjacentRooms(env, textArgs[1]), true];

      else if (textArgs[0] === "view") {
        if (textArgs.length === 3 && textArgs[1] === "my") return ["view my " + stringMatch(["stats", "companion"], textArgs[2]), true];
        else if (textArgs.length === 2) return [`view ${stringMatch(["items", "time", "my", "stats", "objectives", "visitedrooms"], textArgs[1])} `, true];
        else if (textArgs.length === 3 && textArgs[1] === "stats") return ["view stats " + matchRoomPeople(env, textArgs[2]), true];
        else return ["view ", true];
      }
      else if (textArgs[0] === "wait") return ["wait ", true];

      // Try and match commands with suggestions.
      else if (textArgs.length === 1) {
       
        let suggestions = stringMatch(Array.from(Commands.commandList.keys()), textArgs[0]).split(" ");

        // Set the input area if only one suggestion is found.
        if (suggestions.length === 1 && suggestions[0].trim() !== textArgs[0].trim()) {
          return [suggestions[0].trim() + " ", true];
        } else { // Otherwise, print the selections to the screen.
          Std.writeLine(suggestions);
          return [textArgs[0], false];
        }
      }
      else {
        return [textArgs[0], false];
      }
    } else {
      return [textArgs[0], false];
    }
  }

}