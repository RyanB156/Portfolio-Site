
import { Option } from './option';
import { CommandTypes } from './command-types';
import { Result } from './result';
import { Environment } from './environment';
import { AICall } from './person';
import { Commands } from './commands';
import { Std } from './std';

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
      return Result.makeFailure(`Missing ${thing} argument for ${cmd}}`);
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
      case "Diagnose": Std.writeLine(env); return Result.makeSuccess({ kind: "AIWait" });
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
          Commands.printSuggestions(splitCommands[0], 5);
        }
    }
  }
      
            

  // Scan the command to match the arguments then send to Commands.fs to run the command.
  // Then the environment is sent to AI.fs to process the AI's action.
  let processInput command env =
      match scanCommand command with
          | Failure f -> Failure f
          | Success s -> runCommand s env


  // ------ Key Input and Autocomplete ------ //

  let implode (cs:seq<char>) =
      cs |> Seq.fold (fun s t -> s + string t) ""

  let stringMatch matchStrings pattern =
      match Commands.getSuggestions matchStrings pattern with
      | x::xs -> x |> snd
      | _ -> ""

  let (|PersonInquiry|_|) inquiry = if Person.inquireInfo |> List.contains inquiry then Some inquiry else None

  let matchRoomPeople env name =
      name |> stringMatch (env.Room.People |> List.map (Person.getName >> String.toLower))

  let matchInventoryItem env name =
      name |> stringMatch (env.Player.Items |> List.map (Item.getName >> String.toLower))

  let matchRoomItem env name =
      name |> stringMatch (env.Room.Items |> List.map (Item.getName >> String.toLower))

  let matchAllItems env name =
      let allItems = (env.Room.Items |> List.map (Item.getName >> String.toLower)) @ (env.Player.Items |> List.map (Item.getName >> String.toLower))
      name |> stringMatch allItems

  let matchPeopleAndItems env name =
      let peopleNames = env.Room.People |> List.map (Person.getName >> String.toLower)
      let itemNames = env.Room.Items |> List.map (Item.getName >> String.toLower)
      let allNames = peopleNames @ itemNames
      name |> stringMatch allNames

  let matchAdjacentRooms env name =
      name |> stringMatch (env.Map |> (fun (_,adj,_) -> adj) |> List.map (fst >> String.toLower))

  let matchOverlookRooms env name =
      let (_,_,ovl) = env.Map
      match ovl with
      | None -> ""
      | Some ovlRooms -> name |> stringMatch (ovlRooms |> List.map String.toLower)

  let holderItemSearch targetName itemName env =
      match env |> Environment.tryFindPersonByName targetName with
      | Some person -> itemName |> stringMatch (person.Items |> List.map (Item.getName >> String.toLower))
      | None ->
          match env |> Environment.tryFindItemByName targetName with
          | Some item -> 
              match item with
              | Container (itemList, _) -> itemName |> stringMatch (itemList |> List.map (Item.getName >> String.toLower))
              | _ -> ""
          | None -> ""

  let autoComplete (incompleteText:string) env =
      let inner () =
          match incompleteText.ToLower().Trim().Split([|' '|], StringSplitOptions.RemoveEmptyEntries) |> Array.toList with
          | "amuse"::x::[] -> "amuse " + matchRoomPeople env x
          | "apply"::xs ->
              match xs with
              | poisonName::[] -> "apply " + matchInventoryItem env poisonName + " to "
              | poisonName::"to"::targetName::[] -> sprintf "apply %s to %s" poisonName (matchInventoryItem env targetName)
              | _ -> "apply "
          | "approach"::x::[] -> "approach " + matchRoomPeople env x
          | "attack"::x::[] -> "attack " + matchRoomPeople env x
          | "capture"::x::[] -> "capture " + matchRoomPeople env x
          | "cheerup"::x::[] -> "cheerup " + matchRoomPeople env x
          | "chokeout"::x::[] -> "chokeout " + matchRoomPeople env x
          | "command"::xs ->
              match xs with
              | personName::"stop"::[] -> sprintf "command %s stop" personName
              | personName::"killyourself"::[] -> sprintf "command %s killyourself" personName
              | personName::"attack"::targetName::[] -> sprintf "command %s attack %s" personName (matchRoomPeople env targetName)
              | personName::"goto"::targetName::[] -> sprintf "command %s goto %s" personName (matchAdjacentRooms env targetName)
              | personName::"pickup"::targetName::[] -> sprintf "command %s pickup %s" personName (matchRoomItem env targetName)
              | personName::commandName::[] -> sprintf "command %s %s " personName (commandName |> stringMatch Commands.aiCommandList)
              | personName::[] -> "command " + matchRoomPeople env personName + " "
              | _ -> "command "

          | "compliment"::x::[] -> "compliment " + matchRoomPeople env x
          | "consume"::x::[] -> "consume " + matchInventoryItem env x
          | "describe"::xs -> 
              match xs with
              | x::[] -> "describe " + (stringMatch ["area"; "item"; "person"] x) + " "
              | "item"::x::[] -> "describe item " + matchAllItems env x
              | "person"::x::[] -> "describe person " + matchRoomPeople env x
              | _ -> "describe "
          | "diagnose"::xs -> "diagnose"
          | "disguise"::x::[] -> "disguise " + matchRoomPeople env x
          | "dishearten"::x::[] -> "dishearten " + matchRoomPeople env x
          | "drop"::x::[] -> "drop " + matchInventoryItem env x
          | "escape"::x::[] -> "escape " + matchRoomItem env x
          | "equip"::x::[] -> "equip " + matchInventoryItem env x
          | "followme"::x::[] -> "followme " + matchRoomPeople env x
          | "give"::xs ->
              match xs with
              | itemName::[] -> "give " + (itemName |> matchInventoryItem env) + " to "
              | itemName::"to"::personName::[] -> sprintf "give %s to %s" itemName (personName |> matchRoomPeople env)
              | _ -> "give "
          | "goto"::x::[] -> "goto " + matchAdjacentRooms env x
          | "forcegoto"::x::[] -> "forcegoto " + matchAdjacentRooms env x
          | "help"::x::[] -> "help " + (Commands.getCmdSuggestion x 1 |> (function | None -> "" | Some cmdString -> cmdString))
          | "inquire"::xs ->
              match xs with
              | PersonInquiry inquiry::personName::[] -> sprintf "inquire %s %s" inquiry (matchRoomPeople env personName)
              | x::xs -> "inquire " + (stringMatch Person.inquireInfo x) + " "
              | _ -> "inquire "
          | "inspect"::x::[] -> "inspect " + matchAllItems env x
          | "intimidate"::x::[] -> "intimidate " + matchRoomPeople env x
          | "leaveme"::x::[] -> "leaveme "
          | "peek"::x::[] -> "peek " + matchAdjacentRooms env x
          | "pickup"::x::[] -> "pickup " + matchRoomItem env x
          | "place"::xs ->
              match xs with
              | itemName::[] -> "place " + (itemName |> matchInventoryItem env) + " in "
              | itemName::PlacePrep p::targetName::[] -> sprintf "place %s %s %s" itemName p (targetName |> matchRoomItem env)
              | x::[] -> "place " + x
              | _ -> "place "
          | "punch"::x::[] -> "punch " + matchRoomPeople env x
          | "quit"::xs -> "quit "
          | "romance"::x::[] -> "romance " + matchRoomPeople env x
          | "save"::xs -> "save "
          | "scout"::x::[] -> "scout " + matchOverlookRooms env x
          | "search"::x::[] -> "search " + (x |> stringMatch ("area"::(env.Room.Items |> List.map (Item.getName >> String.toLower))))
          | "seduce"::x::[] -> "seduce " + matchRoomPeople env x
          | "survey"::xs -> "survey"
          | "takefrom"::xs ->
              match xs with
              | targetName::[] -> "takefrom " + (matchPeopleAndItems env targetName) + " "
              | targetName::itemName::[] -> sprintf "takefrom %s %s" targetName (holderItemSearch targetName itemName env)
              | _ -> "takefrom "
          | "talk"::x::[] -> "talk " + matchRoomPeople env x
          | "unequip"::x::[] -> "unequip "
          | "unlock"::x::[] -> "unlock " + matchAdjacentRooms env x
          | "view"::xs -> 
              match xs with
              | "my"::x::[] -> "view my " + (x |> stringMatch ["stats"; "companion"])
              | x::[] -> "view " + (x |> stringMatch ["items"; "time"; "my"; "stats"; "objectives"; "visitedrooms"]) + " "
              | "stats"::y::[] -> "view stats " + (y |> matchRoomPeople env)
              | _ -> "view "
          | "wait"::xs -> "wait "
          | cmd::xs -> Commands.getCmdSuggestion cmd 1 |> (function | None -> "" | Some cmdString -> cmdString + " ")
          | [] -> ""
      inner ()

  // Console handles key input. Returns here on a tab. Parser checks for autocomplete pattern and returns the completed string to console for more input.
  let keyInputLoop (console:ConsoleExt) (env:Environment) = // Run through input and history from ConsoleExt. Then modify with context based tab autocomplete.
      
      let text = console.ReadInput()
      let rec tabCheck text =
          match text |> Seq.toList with
          | '\t'::cs -> 
              let incompleteText = cs |> implode
              console.AutoComplete(autoComplete incompleteText env) |> tabCheck
          | cs -> cs |> implode
      tabCheck text

}