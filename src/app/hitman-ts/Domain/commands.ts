import { List } from './list';
import { Std } from './std';
import { Result } from './result';
import { Option } from './option';
import { Person, AICall, RespawnData } from './person';
import { Random } from './random';
import { Personality } from './personality';
import { Environment } from './environment';
import { Item, getNameWithType, isHeavy, removeItem } from './item';
import { CommandTypes } from './command-types';
import { AdjacentRoom, Room, RoomMap, lockStateToString } from './room';
import { Objective } from './objective';
import { PeopleData } from './people-data';
import { WorldLoading } from './world-loading';

export namespace Commands {

  export const commandList = new Map<string, string>([
    ["amuse", "amuse <person> - tell a joke to lift a person's spirits, it may backfire"],
    ["apply", "apply <poisonName> to <itemName> - poison a weapon or consumable item"],
    ["approach", "approach <person> - get in close quarters to a person, giving them a chance to react. Required for melee attacks"],
    ["attack", "attack <person> - attack a person with the equipped weapon"],
    ["capture", "capture <person> - capture a terrified person to get an extra life. Only \"Fearful\" people can be made terrified."],
    ["cheerup", "cheerup <person> - increase a person's happiness"],
    ["chokeout", "chokeout <person> - render a person unconscious"],
    ["command", "command <person> <pickup/goto/attack/stop/killyourself> <target> - command an ai to take an action"],
    ["compliment", "complement <person> - give a complement to increase happiness and attraction"],
    ["consume", "consume <item> - eat or drink an item to regain health"],
    ["describe", "describe <area/item/person> <_/itemName/personName> - display the description for <area/item/person>"],
    ["disguise", "disguise <person> - disguise yourself as a worker by taking their clothes"],
    ["dishearten", "dishearten <person> - decrease a person's happiness"],
    ["drop", "drop <item> - drop the specified item"],
    ["escape", "escape <item> - make your escape after completing all of the objectives"],
    ["equip", "equip <item> - make a weapon ready to use"],
    ["followme", "followme <person> - ask a person to follow you. Only works if they trust you"],
    ["give", "give <item> to <person> - give an item to a person"],
    ["goto", "goto <room> - move to the specified room if possible"],
    ["forcegoto", "forcegoto <room> - force your way into a room. Ignores locked doors but alerts the guards in the next room."],
    ["help", "help <command> - display information on the command <arg> or lists commands if <arg> is empty"],
    ["inquire", "inquire <personStat/personInfo/items> person"],
    ["inspect", "inspect <clue> - reveal information about a clue"],
    ["intimidate", "intimidate <person> - Intimidate a person to make them afraid of you. Lower there resistance to your influence."],
    ["leaveme", "leaveme <person> - Causes a person to stop following you"],
    ["load", "load<> - load a saved game"],
    ["peek", "peek <room> - reveal items and people in an adjacent room"],
    ["pickup", "pickup <item> - add item in the area to inventory"],
    ["place", "place <item> in <item> - place an item into another item if possible"],
    ["punch", "punch <person> - hit a person with your fists"],
    ["quit", "quit <> - exit the game"],
    ["romance", "romance <person> - romance a person and generate a new life. Other person must have full attraction."],
    ["save", "save <> - save the game"],
    ["scout", "scout <room> - investigate a location that the current room overlooks"],
    ["search", "search <area> - reveal items and people in a room"],
    ["seduce", "seduce <person> - increase attraction by a lot. hance to fail based on morality."],
    ["survey", "survey <> - reveal buildings in an area"],
    ["talk", "talk <person> - have a conversation with a person. gives a piece of information and raises their trust."],
    ["takefrom", "takefrom <person/container> <item> - take an item from a person"],
    ["unequip", "unequip <item> - hide a weapon"],
    ["unlock", "unlock <door> - unlock a door if you have the right key"],
    ["view", "view <items/time/stats personName/my stats/my companion/objectives/visited rooms> - display <inventory/time/stats for a person>"],
    ["wait", "wait - Do nothing and allow the ai to take a turn"],
  ]);

  export let aiCommandList = [ "pickup", "attack", "goto", "stop", "killyourself" ];

  // Creates a list of the elements in a list that match a given pattern in ascending order.
  export function getSuggestions(matchStrings: string[], pattern: string, minVal: number) : [number, string][] {
    let matchedPairs: [number, string][] = [];
    matchStrings.forEach((s: string) => {
      matchedPairs.push([List.stringDiff(s, pattern), s]);
    });
    matchedPairs = matchedPairs.sort((a, b) => {
      if (a > b) return -1;
      else if (a < b) return 1;
      else return 0;
    }).filter(p => p[0] >= minVal);

    if (matchedPairs.length > 0) {
      let highestMatch = matchedPairs[0][0];
      return matchedPairs.filter(p => p[0] === highestMatch);
    } else {
      return [];
    }
  }

  // Get a list of suggestions for the specified command.
  export function getCmdSuggestions(command: string, minVal: number) {
    // Use the list of commands from the help dictionary as the list of available commands.
    let suggestions = getSuggestions(Array.from(commandList.keys()), command, 1);
    return suggestions.filter(pair => pair[0] >= minVal);
  }

  // Print suggestions for a command to the screen.
  export function printSuggestions(str: string, minVal: number) : string {
    let suggestions = getCmdSuggestions(str, minVal);
    let suggestionString = "";
    if (suggestions.length > 0) {
      str = "Did you mean... :" + str;
      suggestions.forEach(e => str + " " + (e[1].toUpperCase()));
    }
    return suggestionString;
  }

// Tell a joke to lift a person's spirits.
export function amuse(personName, env) : Result.Result<AICall> {
  let personResult: Option.Option<Person> = env.tryFindPersonByNameLower(personName);
  if (personResult.kind === "None")
    return Result.personFindFailure(personName);
  else {
    if (personResult.value.getState() === "Dead")
      return Result.makeFailure(`${personResult.value.getName()} is dead`);
    else {
      let [adjStr, adj]: [string, Personality.Adjustment] = Random.nextInt(0, 4) === 0 ? ["lowered", { kind: "Down", value: 4 }] : ["raised", { kind: "Up", value: 2}];
      
      if (Math.random() < personResult.value.getResponsiveness()) {
        Std.writeLine(`That ${adjStr} ${personResult.value.getName()}'s spirits`);
        let adjustResult = Personality.adjustMood(adj, personResult.value.getMood());
        if (adjustResult.kind === "Failure")
          return Result.makeFailure(Result.printPersonalityAdjFailureStr(personResult.value, adjustResult));
        else {
          personResult.value.setMood(adjustResult.value);
          personResult.value.trySetAwareness({ kind: "Aware" });
          return Result.makeSuccess({ kind: "AIMove" });
        }
      } else {
        Std.writeLine(`${personResult.value.getName()} did not respond`);
        return Result.makeSuccess({ kind: "AIMove" });
      }
    }
  }
}

  // Poison a weapon or consumable item.
  export function apply(poisonName: string, targetName: string , env: Environment) : Result.Result<AICall> {
    function tryPoisonItem(item: Item) {
      if (item.kind === "Consumable") {
        if (!item.isPoisoned) {
          item.isPoisoned = true;
          return Result.makeSuccess(null);
        }
        else
          return Result.makeFailure(`${item.info.name} is already poisoned`);
      } else if (item.kind === "Weapon" && item.weaponType.kind === "MeleeWeapon") {
        if (!item.weaponType.isPoisoned) {
          item.weaponType.isPoisoned = true;
          return Result.makeSuccess(null);
        }
        else
          return Result.makeFailure(`${item.info.name} is already poisoned`);
      }
      else {
        return Result.makeFailure(`${item.info.name} is not a poisonable item`);
      }
    }

    let poisonResult: Option.Option<Item> = env.getPlayer().tryFindItemByName(poisonName);
    if (poisonResult.kind === "None")
      return Result.inventoryItemFindFailure(poisonName);
    else if (poisonResult.kind === "Some" && poisonResult.value.kind === "Poison") {
      let inventoryItemResult = env.getPlayer().tryFindItemByName(targetName);
      if (inventoryItemResult.kind === "None")
        return Result.roomItemFindFailure(targetName, env.getRoom().getInfo());
      else {
        let tryPoisonResult = tryPoisonItem(inventoryItemResult.value);
        if (tryPoisonResult.kind === "Failure")
          return tryPoisonResult;
        else {
          Std.writeLine(`You applied poison ${poisonName} to ${inventoryItemResult.value.info.name}`);
          env.getPlayer().removeFromInventory(poisonResult.value);
          // Hopefully the player's equipped item is updated and displayed accordingly...
          return Result.makeSuccess({ kind: "AIMove" });
        }
      }
    } else {
      return Result.makeFailure(`${poisonName} is not a poison. It cannot be applied to an item`);
    }

  }


  // Get in close quarters to a person for melee attacks.
  export function approach(personName: string, env: Environment) : Result.Result<AICall> {
    let personResult = env.tryFindPersonByNameLower(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else {
      Std.writeLine(`You approached ${personResult.value.getName()}`);
      env.getPlayer().setCloseTarget(Option.makeSome(personResult.value.getName().toLowerCase()));
      return Result.makeSuccess({ kind: "AIMove" });
    }
  }

  // Attack the specified person with the equipped weapon.
  export function attack(personName: string, env: Environment) {
    let personResult = env.tryFindPersonByNameLower(personName);
    if (personResult.kind === "None") {
      return Result.personFindFailure(personName);
    } else if (personResult.value.getState() === "Dead") {
      return Result.makeFailure(`You cannot attack ${personResult.value.getName()}. ${personResult.value.getGenderPronounString()} is already dead`);
    }
    else {
      let equippedItemResult = env.getPlayer().getEquippedItem();
      if (equippedItemResult.kind === "None")
        return Result.makeFailure("You do not have a weapon equipped");
      else {
        if (equippedItemResult.value.kind === "Weapon" && equippedItemResult.value.weaponType.kind === "MeleeWeapon") {
          let closeTargetOption: Option.Option<string> = env.getPlayer().getCloseTarget();
          if (closeTargetOption.kind === "None" || (closeTargetOption.kind === "Some" && closeTargetOption.value.toLowerCase() !== personName.toLowerCase())) {
            return Result.makeFailure(`You are not close enough to ${personResult.value.getName()} for a melee attack`);
          } else {

            if (personResult.kind === "Some") { // Should not be necessary but the TypeScript compiler complains otherwise...
              let mWeapon = equippedItemResult.value.weaponType;
              personResult.value.applyAttack(mWeapon.damage, mWeapon.koChance, mWeapon.isPoisoned);
              Std.writeLine(`You melee attacked ${personResult.value.getName()} with ${equippedItemResult.value.info.name} for ${mWeapon.damage} damage`);
              Std.writeLine(`${personResult.value.getName()}:\nHealth: ${personResult.value.getHealth()}, State: ${personResult.value.getState()}, Awareness: ${personResult.value.getAwarenessAsString()}`);
              env.applyBadActionToAll(); // Modify mood and trust values of people in the room.
              if (personResult.value.getState() === "Dead") {
                env.checkPersonObjectives(personResult.value); // Check if the killed person was a target.
                env.getPlayer().updateCloseTarget(personResult.value.getName()); // Check if the close target has died. If so, remove it.
              }

              let aiCall: AICall = null;
              switch (mWeapon.visibility) {
                case "vlow": aiCall = { kind: "AIMove" }
                case "vmedium": aiCall = { kind: "AIAlert", target: { kind: "TPlayer" } };
                default: aiCall = { kind: "AIAlert", target: { kind: "TPlayer" } };
              }
              return Result.makeSuccess(aiCall);
            }
          }
        } else if (equippedItemResult.value.kind === "Weapon" && equippedItemResult.value.weaponType.kind === "RangedWeapon") {
          let rWeapon = equippedItemResult.value.weaponType;

          if (rWeapon.ammoCount <= 0)
            return Result.makeFailure(`${equippedItemResult.value.info.name} is out of ammo`);
          else {
            personResult.value.applyAttack(rWeapon.damage, Option.makeNone(), false);
            Std.writeLine(`You shot ${personResult.value.getName()} with ${equippedItemResult.value.info.name} for ${rWeapon.damage} damage`);
            Std.writeLine(`${personResult.value.getName()}:\nHealth: ${personResult.value.getHealth()}, State: ${personResult.value.getState()}, Awareness: ${personResult.value.getAwarenessAsString()}`);
            rWeapon.ammoCount--;
            env.applyBadActionToAll();
            if (personResult.value.getState() === "Dead") {
              env.checkPersonObjectives(personResult.value);
            }

            let aiCall: AICall = null;
              switch (rWeapon.visibility) {
                case "vlow": aiCall = { kind: "AIMove" }
                case "vmedium": aiCall = { kind: "AIAlert", target: { kind: "TPlayer" } };
                default: aiCall = { kind: "AIAlert", target: { kind: "TPlayer" } };
              }
              return Result.makeSuccess(aiCall);
          }
        } else {
          return Result.makeFailure(`${getNameWithType(equippedItemResult.value)} cannot be used as a weapon`);
        }
      }
    }
  }


  // Recruit a scared person to gain an extra life.
  export function capture(personName: string, env: Environment) : Result.Result<AICall> {
    // Remove the companion when you capture them.
    let companionOption = env.getPlayer().getCompanion();
    if (companionOption.kind === "Some")
      if (companionOption.value.toLowerCase() === personName.toLowerCase())
        env.getPlayer().setCompanion(Option.makeNone());

    let personResult = env.tryFindPersonByName(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else {
      if (personResult.value.getFear().class === "FTerrified") {
        Std.writeLine(`You captured ${personResult.value.getName()} for an extra life`);
        env.getRoom().removePerson(personResult.value); // Remove the person from the room. You can no longer interact with them.
        env.addLife(personResult.value.getRespawnData());
        env.applyBadActionToAll();
        return Result.makeSuccess({ kind: "AIMove" });
      } else {
        return Result.makeFailure(`${personResult.value.getName()} is not afraid enough to be captured and brainwashed into an assasin`);
      }
    }

  }


  // Increase a person's happiness
  export function cheerup(personName: string, env: Environment) : Result.Result<AICall> {
    let personResult = env.tryFindPersonByName(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else {
      if (personResult.value.getState() !== "Dead") {
        if (Math.random() < personResult.value.getResponsiveness()) {
          let moodResult = Personality.adjustMood({ kind: "Up", value: 2 }, personResult.value.getMood());
          if (moodResult.kind === "Failure")
            return Result.makeFailure(Result.printPersonalityAdjFailureStr(personResult.value, moodResult));
          else {
            Std.writeLine(`You lifted ${personResult.value.getName()}'s spirits`);
            personResult.value.setMood(moodResult.value);
            personResult.value.trySetAwareness({ kind: "Aware" });
            return Result.makeSuccess({ kind: "AIMove" });
          }
        } else {
          Std.writeLine(`${personResult.value.getName()} did not respond`);
          return Result.makeSuccess({ kind: "AIMove" });
        }
      } else {
        return Result.makeFailure(`${personResult.value.getName()} is dead`);
      }
    }
  }

  // Chokeout a person to render them unconscious.
  export function chokeOut(personName: string, env: Environment) : Result.Result<AICall> {
    let personResult = env.tryFindPersonByName(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else {
      if (personResult.value.getState() === "Unconscious")
        return Result.makeFailure(`${personResult.value.getName()} is already unconscious`);
      else if (personResult.value.getState() === "Dead")
        return Result.makeFailure(`${personResult.value.getName()} is dead`);
      else {
        if (personResult.value.getAwareness().kind === "Unaware" || Math.random() < Person.awareKnockoutChance) {
          Std.writeLine(`You knocked ${personResult.value.getName()} unconscious`);
          personResult.value.setState("Unconscious");
          personResult.value.trySetAwareness({ kind: "Aware" });
          if (Math.random() < 0.25)
            return Result.makeSuccess({ kind: "AIAlert", target: { kind: "TPlayer" } });
          else
            return Result.makeSuccess({ kind: "AIMove" });
        } else {
          Std.writeLine(`${personResult.value.getName()} resisted your attempts to knock ${personResult.value.getGenderObjectiveString()} unconscious`);
          return Result.makeSuccess({ kind: "AIMove" });
        }
      }
    }
  }

  // Command an ai to take an action. Sets the ai's "Action" for them to carry out.
  export function command(personName: string, command: CommandTypes.AICommand, env: Environment) : Result.Result<AICall> {
    let personResult = env.tryFindPersonByName(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else {
      if (!personResult.value.isCompliant()) {
        Std.writeLine(`${personResult.value.getName()} will not take orders from you`);
        return Result.makeSuccess({ kind: "AIMove" });
      } else if (personResult.value.getState() === "Dead") {
        Std.writeLine(`${personResult.value.getName()} is dead`);
        return Result.makeSuccess({ kind: "AIMove" });
      } else {
        switch (command.kind) {
          case "AIAttack":
            let targetResult = env.tryFindPersonByName(personName);
            if (targetResult.kind === "None")
              return Result.makeFailure(`${command.personName} is not a valid person for ${personResult.value.getName()} to attack`);
            else {
              personResult.value.setAwareness({ kind: "Hostile", target: { kind: "TPerson", name: command.personName } });
              personResult.value.setAction({ kind: "AAttack" });
              personResult.value.setIsCommanded(true);
              return Result.makeSuccess({ kind: "AIMove" });
            }
          case "AIGoto":
            let roomResult = List.tryFind((adj: AdjacentRoom) => adj.name.toLowerCase() === command.roomName.toLowerCase(), env.getMap().adjacentRooms);
            if (roomResult.kind === "None")
              return Result.makeFailure(`${command.roomName} is not a valid location for ${personResult.value.getName()} to move to`);
            else
            {
              personResult.value.setAction({ kind: "AGoto", room: command.roomName });
              personResult.value.setIsCommanded(true);
              return Result.makeSuccess({ kind: "AIMove" });
            }
          case "AIPickup":
            let itemResult = env.getRoom().tryFindItemByName(command.itemName);
            if (itemResult.kind === "None")
              return Result.makeFailure(`${command.itemName} is not a valid item for ${personResult.value.getName()} to pick up`);
            else {
              personResult.value.setAction({ kind: "APickupItem", item: command.itemName });
              personResult.value.setIsCommanded(true);
              return Result.makeSuccess({ kind: "AIMove" });
            }
          case "AIStop":
            personResult.value.setAction({ kind: "ANeutralAction" });
            personResult.value.setIsCommanded(true);
            personResult.value.setAwareness({ kind: "Aware" });
            return Result.makeSuccess({ kind: "AIMove" });
          default:
            if (personResult.value.getMood().class === "MDepressed") {
              Std.writeLine(`${personResult.value.getName()} has lost the will to live`);
              personResult.value.setAction({ kind: "ASuicide" });
              personResult.value.setIsCommanded(true);
              return Result.makeSuccess({ kind: "AIMove" });
            } else {
              return Result.makeFailure(`${personResult.value.getName()} is not sad enough to kill themselves`);
            }
        }
      }
    }
  }

  // Give a compliment to increase happiness and attraction.
  export function compliment(personName: string, env: Environment) : Result.Result<AICall> {
    let personResult = env.tryFindPersonByName(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else if (personResult.value.getState() === "Dead") {
      return Result.makeFailure(`${personResult.value.getName()} is dead`);
    } else {
      if (Math.random() < personResult.value.getResponsiveness()) {

        // Try to increase the person's attraction towards the player.
        if (personResult.value.isCompatableWith(env.getPlayer().getGender())) {
          let attractionResult: Result.Result<Personality.AttractionP> = Personality.adjustAttraction({ kind: "Up", value: 2 }, personResult.value.getAttraction());
          if (attractionResult.kind === "Failure")
            Std.writeLine(Result.printPersonalityAdjFailureStr(personResult.value, attractionResult));
          else {
            Std.writeLine(`You increased ${personResult.value.getName()}'s attraction towards you`)
            personResult.value.setAttraction(attractionResult.value);
            return Result.makeSuccess({ kind: "AIMove" });
          }
        } else {
          Std.writeLine(`${personResult.value.getName()} does not swing your way`);
          return Result.makeSuccess({ kind: "AIMove" });
        }

        // Try to increase the person's mood.
        let moodResult: Result.Result<Personality.MoodP> = Personality.adjustMood({ kind: "Up", value: 2 }, personResult.value.getMood());
        if (moodResult.kind === "Failure")
          return Result.makeFailure(Result.printPersonalityAdjFailureStr(personResult.value, moodResult));
        else {
          Std.writeLine(`You lifted ${personResult.value.getName()}'s spirits`);
          personResult.value.setMood(moodResult.value);
          return Result.makeSuccess({ kind: "AIMove" });
        }
      } else {
        Std.writeLine(`${personResult.value.getName()} did not respond to your compliment`);
        return Result.makeSuccess({ kind: "AIMove" });
      }
    }
  }


  // Eat or drink an item if it is a consumable.
  export function consume(itemName: string, env: Environment) : Result.Result<AICall> {
    let itemResult = env.getPlayer().tryFindConsumableByName(itemName);
    if (itemResult.kind === "None")
      return Result.inventoryItemFindFailure(itemName);
    else {
      if (itemResult.value.kind === "Consumable") {
        if (itemResult.value.isPoisoned)
          return Result.makeFailure(`Item ${itemResult.value.info.name} is poisoned. You cannot consume it.`);
        else {
          Std.writeLine(`You consumed ${itemResult.value.info.name} for ${itemResult.value.healthBonus} health`);
          env.getPlayer().addHealth(itemResult.value.healthBonus);
          itemResult.value.remainingUses--;
          if (itemResult.value.remainingUses <= 0) {
            Std.writeLine(`${itemResult.value.info.name} was used up`);
            env.getPlayer().removeFromInventory(itemResult.value);
          }
          return Result.makeSuccess({ kind: "AIMove" });
        }
      } else {
        return Result.makeFailure(`Error in Commands.consume. Player.tryFindConsumableByName returned a non consumable`);
      }
    }
  }

  // Display the description for items in the player's inventory or in the room.
  export function describe(describeArg: CommandTypes.DescribeArg, env: Environment) : Result.Result<AICall> {
    function getDescribeString() {
      if (describeArg.kind === "DescribeArea")
        return Result.makeSuccess(env.getRoom().getDescription());

      else if (describeArg.kind === "DescribeItem") {
        let playerItemResult = env.getPlayer().tryFindItemByName(describeArg.itemName);
        if (playerItemResult.kind === "Some") {
          return Result.makeSuccess(playerItemResult.value.info.description);
        } else {
          let roomItemResult = env.getRoom().tryFindItemByName(describeArg.itemName);
          if (roomItemResult.kind === "Some") {
            return Result.makeSuccess(roomItemResult.value.info.description);
          } else {
            return Result.makeFailure(`${describeArg.itemName} is not a valid item to get a description of`);
          }
        }
      } else { // "DescribePerson"
        let roomPersonResult = env.getRoom().tryFindPersonByName(describeArg.personName);
        if (roomPersonResult.kind === "Some")
          return Result.makeSuccess(roomPersonResult.value.getDescription());
        else
          return Result.makeFailure(`${describeArg.personName} is not a describable person`);
      }
    }
    let stringResult = getDescribeString();
    if (stringResult.kind === "Failure")
      return stringResult;
    else {
      Std.writeLine(`Description: ${stringResult.value}`);
      return Result.makeSuccess({ kind: "AIWait" });
    }
  }

  // Disguise yourself as a worker.
  export function disguise(personName: string, env: Environment) : Result.Result<AICall> {
    let personResult = env.tryFindPersonByName(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else {
      if (personResult.value.getState() === "SNormal")
        Std.writeLine(`${personResult.value.getName()} is not in a condition where you can take ${personResult.value.getPossiveGenderString()} clothes`);
      else {
        let clothesResult = personResult.value.getJobClothes();
        if (clothesResult.kind === "Failure")
          return clothesResult;
        else {
          Std.writeLine("You are now disguised as a " + clothesResult.value);
          env.getPlayer().setDisguise(Option.makeSome(clothesResult.value));
          return Result.makeSuccess({ kind: "AIMove" });
        }
      }
    }
  }

  // Decrease a person's happiness.
  export function dishearten(personName: string, env: Environment) : Result.Result<AICall> {
    let personResult = env.tryFindPersonByName(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else {
      if (personResult.value.getState() === "Dead")
        return Result.makeFailure(`${personResult.value.getName()} is dead`);
      else {
        let moodResult: Result.Result<Personality.MoodP> = Personality.adjustMood({ kind: "Down", value: 2 }, personResult.value.getMood());
        if (moodResult.kind === "Failure")
          return moodResult;
        else {
          Std.writeLine(`You lowered ${personResult.value.getName()}'s spirits`);
          personResult.value.setMood(moodResult.value);
          personResult.value.setAwareness({ kind: "Aware" });
          env.applyBadActionToAll();
          return Result.makeSuccess({ kind: "AIMove" });
        }
      }
    }
  }

  // Drop the specified item.
  export function drop(itemName: string, env: Environment) : Result.Result<AICall> {
    let itemResult = env.getPlayer().tryFindItemByName(itemName);
    if (itemResult.kind === "None")
      return Result.inventoryItemFindFailure(itemName);
    else {
      Std.writeLine(`You dropped ${itemResult.value.info.name}`);
      env.getPlayer().removeFromInventory(itemResult.value);
      env.getPlayer().removeEquippedItemCheck(itemResult.value);
      env.getRoom().getItems().push(itemResult.value);
      return Result.makeSuccess({ kind: "AIMove" });
    }
  }

  // Make your escape after completing the objectives.
  export function escape(itemName: string, env: Environment) : Result.Result<AICall> {
    let itemResult = env.tryFindItemByName(itemName);
    if (itemResult.kind === "None")
      return Result.roomItemFindFailure(itemName, env.getRoom().getName());
    else {
      if (itemResult.value.kind === "EscapeItem") {
        let totalObjs = env.getObjectives().length;
        let finishedObjs = env.getObjectives().filter((o: Objective.Objective) => o.completed).length;
        if (totalObjs === finishedObjs) {
          env.setStatus("Win");
          Std.writeLine(`You have completed all objectives and escaped using ${itemResult.value.info.name}`);
          return Result.makeSuccess({ kind: "AIWait" });
        } else {
          env.setStatus("PartialWin");
          Std.writeLine(`You have completed only ${finishedObjs}/${totalObjs}`);
          return Result.makeSuccess({ kind: "AIWait" });
        }
      } else {
        return Result.makeFailure(`${itemResult.value.info.name} is not an escape route`);
      }
    }
  }

  // Equip the specified weapon.
  export function equip(itemName: string, env: Environment) : Result.Result<AICall> {
    let itemResult = env.getPlayer().tryFindItemByName(itemName);
    if (itemResult.kind === "None")
      return Result.inventoryItemFindFailure(itemName);
    else if (itemResult.value.kind === "Weapon") {
      Std.writeLine("You equipped " + itemResult.value.info.name);
      env.getPlayer().equipItem(itemResult.value);
      return Result.makeSuccess({ kind: "AIMove" });
    } else {
      return Result.makeFailure(`${itemResult.value.info.name} is not a weapon`);
    }
  }

  // Ask a person to follow you.
  export function followMe(personName: string, env: Environment) : Result.Result<AICall> {
    let personResult = env.tryFindPersonByName(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else if (personResult.value.getState() === "Dead")
      return Result.makeFailure(`${personResult.value.getName()} is dead`);
    else if (personResult.value.getType() === "Guard") 
      return Result.makeFailure(`${personResult.value.getName()} will not be your companion`);
    else {
      if (personResult.value.queryTrust() >= 8) {
        Std.writeLine(`${personResult.value.getName()} is your new companion`);
        env.getPlayer().setCompanion(Option.makeSome(personName));
        personResult.value.trySetAwareness({ kind: "Aware" });
        return Result.makeSuccess({ kind: "AIMove" });
      } else {
        return Result.makeFailure(`${personResult.value.getName()} does not trust you enough to follow you`);
      }
    }

  }

  // Give an item to a person.
  export function give(itemName: string, personName: string, env: Environment) : Result.Result<AICall> {
    function tryGiveItem(person: Person, item: Item) : boolean {
      person.setAwareness({ kind: "Aware" });
      if (item.kind === "Consumable") {
        if (!person.getIsHoldingFood()) {
          Std.writeLine(`You increased ${person.getName()}'s trust in you`);
          person.setIsHoldingFood(true);
          person.addItem(item);
          person.addTrust({ kind: "Up", value: 4 });
          person.setAction({ kind: "AUseFood" });
          person.setIsCommanded(true);
          return true;
        } else {
          Std.writeLine(`${person.getName()} is already holding a consumable item`);
          return false;
        }
      } else if (item.kind === "Weapon") {
        if (!person.getIsHoldingWeapon()) {
          person.setIsHoldingWeapon(true);
          person.addItem(item);
          return true;
        } else {
          Std.writeLine(`${person.getName()} is already holding a weapon`);
          return false;
        }
      } else {
        person.addItem(item);
        return true;
      }
    }

    let itemResult = env.getPlayer().tryFindItemByName(itemName);
    if (itemResult.kind === "None")
      return Result.inventoryItemFindFailure(itemName);
    else {
      let personResult = env.tryFindPersonByNameLower(personName);
      if (personResult.kind === "None")
        return Result.personFindFailure(personName);
      else {
        if (personResult.value.queryTrust() > 2) {
          if (tryGiveItem(personResult.value, itemResult.value)) {
            Std.writeLine(`You gave ${itemName} to ${personName}`);
            env.getPlayer().removeFromInventory(itemResult.value);
          }
          return Result.makeSuccess({ kind: "AIMove" });
        } else {
          Std.writeLine(`${personResult.value.getName()} does not trust you enough to accept item ${itemName}.\n${personResult.value.getName()} has alerted the guards`);
          return Result.makeSuccess({ kind: "AIAlert", target: { kind: "TPlayer" } });
        }
      }
    }
  }
  

  export function goto(arg: CommandTypes.OptionArg, force: boolean, env: Environment) : Result.Result<AICall> {

    // Process moving into the room with a companion.
    function travelToRoom(loadedRoom: Room, roomName: string, map: RoomMap, alertGuards: boolean) : Result.Result<AICall> {

      function takeCompanion(tempEnv: Environment) {
        let companionOption = tempEnv.getPlayer().getCompanion();
        if (companionOption.kind === "None") {
          WorldLoading.writeRoom(tempEnv.getRoom(), tempEnv.getMap());
          Std.writeLine(`Moved to ${roomName}`);
          tempEnv.setRoom(loadedRoom);
          tempEnv.setMap(map);
        }
        else {
          let personResult = tempEnv.tryFindPersonByName(companionOption.value);
          if (personResult.kind === "None")
            Std.writeLine(`Error finding companion ${companionOption.value} in the room. Commands.goto.travelToRoom`);
          else if (personResult.value.getState() === "SNormal") {
            Std.writeLine(`Moved to ${roomName} with ${personResult.value.getName()}`);
            let newPrevRoom = tempEnv.getRoom();
            newPrevRoom.removePerson(personResult.value);
            WorldLoading.writeRoom(newPrevRoom, tempEnv.getMap());
            loadedRoom.addPerson(personResult.value);
            tempEnv.setRoom(loadedRoom);
            tempEnv.setMap(map);
          } else {
            tempEnv.getPlayer().setCompanion(Option.makeNone());
            takeCompanion(tempEnv);
          }
        }
      }

      // Remove stored status people upon entering the new room.
      function removeOldStatusPeople(env: Environment) {
        let peopleNames = List.map((p: Person) => p.getName().toLowerCase(), loadedRoom.getPeople());
        env.setUpdatePeople(env.getUpdatePeople().filter(p => {
          return peopleNames.includes(p.getName().toLowerCase());
        }));
      }
      
      // Add new stored status people from the old room (env.Room)
      function addNewStatusPeople(env: Environment) {
        env.setUpdatePeople(env.getUpdatePeople().concat(env.getRoom().getPeople().filter(p => p.hasStatusEffect())));
      }
      
      // Add status effected people to env.UpdatePeople from env.Room.People. Replace people in newRoom.People with people in env.UpdatePeople.
      function applyUpdateStatus(env: Environment) {
        let room = env.getRoom();
        env.getUpdatePeople().forEach(p => room.updatePerson(p));
      }

      addNewStatusPeople(env);
      takeCompanion(env);
      applyUpdateStatus(env);
      removeOldStatusPeople(env);
      env.addVisited(roomName);


      if (alertGuards || force)
        return Result.makeSuccess({ kind: "AIAlert", target: {kind: "TPlayer" } });
      else
        return Result.makeSuccess({ kind: "AIMove" });

    }

    let adjacentRooms = env.getMap().adjacentRooms;
    
    // No option -> display nearby rooms.
    if (arg.kind === "None") {
      // Only display rooms that are not secret.
      adjacentRooms.filter(a => a.lockState.kind !== "Secret").sort((a, b) => {
        if (!a.lockState && b.lockState) return -1;
        else if (a.lockState && !b.lockState) return 1;
        else return 0;
      }).forEach(a => Std.writeLine(`${a.name} - ${lockStateToString(a.lockState)}`));
      return Result.makeSuccess({ kind: "AIWait" }); // Viewing nearby rooms does not trigger the ai.
    } else { // Option -> Try to move to the specified room.

      let roomName = arg.value;
      if (arg.value === env.getRoom().getName().toLowerCase())
        return Result.makeFailure("You are already there");
      else {
        let roomOpt = List.tryFind((a: AdjacentRoom) => a.name.toLowerCase() === arg.value, adjacentRooms);

        function successF() : Result.Result<AICall> {
          let roomResult = WorldLoading.readRoom(roomName);
          if (roomResult.kind === "Failure")
            return roomResult;
          else {
            let [loadedRoom, map] = roomResult.value;
            let warningGuardsOpt = List.tryFind((p: Person) => p.getAwareness().kind === "Warn", loadedRoom.getPeople());
            if (warningGuardsOpt.kind === "Some" && env.getPlayer().getDisguise().kind === "None")
              return travelToRoom(loadedRoom, roomName, map, true);
            else
              return travelToRoom(loadedRoom, roomName, map, false);

          }
        }

        if (roomOpt.kind === "None")
          return Result.makeFailure(`${roomName} is not a nearby location`);
        else {
          if (roomOpt.value.lockState.kind === "Locked" && force)
            Std.writeLine(`You broke into ${roomName}. The guards have been alerted.`);
          else if (roomOpt.value.lockState.kind === "Locked")
            return Result.makeFailure(`${roomName} is locked. ${roomOpt.value.lockState.code} key required`);
          return successF();
        }
      }
    }
  }

  // Force your way into a room. Uses "goto arg (true) env".
  export function forceGoto(arg: CommandTypes.OptionArg, env: Environment) {
    return goto(arg, true, env);
  }
          
  // Display list of possible commands.
  export function help(arg: CommandTypes.OptionArg) : Result.Result<AICall> {
    if (arg.kind === "None") {
      let str = "";
      commandList.forEach((v, k, m) => str += k + ": " + v + "\n");
      Std.writeLine(str);
      return Result.makeSuccess({ kind: "AIWait" });
    } else {
      let cmdDescription = commandList.get(arg.value);
      if (cmdDescription === undefined || cmdDescription === null) {
        return Result.makeFailure(`The command ${arg.value} is not listed under HELP\n` + printSuggestions(arg.value, 4));
      } else {
        Std.writeLine(cmdDescription);
        return Result.makeSuccess({ kind: "AIWait" });
      }
    }
  }

  // Get information from/about nearby people.
  export function inquire(question: string, personName: string, env: Environment) : Result.Result<AICall> {
    let personResult = env.tryFindPersonByName(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else if (personResult.value.getState() === "Dead")
      return Result.makeFailure(`${personResult.value.getName()} is dead`);
    else {
      if (personResult.value.queryTrust() <= 2)
        return Result.makeFailure(`${personResult.value.getName()} does not trust you enough to disclose their ${question}`);
      else {
        let dataStringResult = personResult.value.stringToDataString(question);
        if (dataStringResult.kind === "Failure")
          return dataStringResult;
        else {
          Std.writeLine(`Response: \n${dataStringResult.value}`);
          personResult.value.trySetAwareness({ kind: "Aware" });
          return Result.makeSuccess({ kind: "AIMove" });
        }
      }
    }

  }


  // Reveal information about clues.
  export function inspect(itemName: string, env: Environment) : Result.Result<AICall> {
    let items = env.getPlayer().getItems().concat(env.getRoom().getItems()).filter((i: Item) => i.kind === "Clue" || i.kind === "HiddenPassageway");
    let itemResult = List.tryFind((i: Item) => i.info.name.toLowerCase() === itemName, items);
    if (itemResult.kind === "None") {
      return Result.roomItemFindFailure(itemName, env.getRoom().getName());
    } else if (itemResult.value.kind === "Clue") {
      Std.writeLine(`Clue - ${itemResult.value.info.name}:\n${itemResult.value.clueInfo}`)
      return Result.makeSuccess({ kind: "AIWait" })
    } else if (itemResult.value.kind === "HiddenPassageway") {
      Std.writeLine("Hidden Passage way revealed: \n");
      itemResult.value.rooms.forEach(s => Std.writeLine(s));
      env.revealPassageways();
      return Result.makeSuccess({ kind: "AIWait" })
    } else {
      return Result.makeFailure(`${itemName} is not a clue`);
    }
  }

  // Intimidate a person to make them afraid of you. Lower there resistance to your influence.
  export function intimidate(personName: string, env: Environment) : Result.Result<AICall> {
    function getFearIncrease(person: Person) : [number, boolean] {
      switch (person.getBravery()) {
        case "BNeutral": return [3, true];
        case "BNeutral": return [1, true];
        default: return [0, false];
      }      
    }

    let personResult: Option.Option<Person> = env.tryFindPersonByNameLower(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else if (personResult.value.getState() === "Dead")
      return Result.makeFailure(`${personResult.value.getName()} is dead`);
    else {
      let fearIncrease = getFearIncrease(personResult.value);
      if (!fearIncrease[1]) {
        Std.writeLine(`${personResult.value.getName()} wil not be intimidated by you`);
        return Result.makeSuccess({ kind: "AIMove" });
      } else {
        let adjustResult = Personality.adjustFear({ kind: "Up", value: fearIncrease[0] }, personResult.value.getFear());
        if (adjustResult.kind === "Failure")
          return adjustResult;
        else {
          if (Random.nextInt(0, fearIncrease[0]) === 0) {
            Std.writeLine("The guards have beeen alerted");
            let damage = env.getPlayer().applyAngryAttack();
            Std.writeLine(`${personResult.value.getName()} resisted your attempts to intimidate ${personResult.value.getGenderObjectiveString()}. ${personResult.value.getGenderPronounString()} attacked you for ${damage}`);
            env.applyBadActionToAll();
            return Result.makeSuccess({ kind: "AIAlert", target: { kind: "TPlayer" } });
          } else {
            let name = personResult.value.getName();
            Std.writeLine(`You increased ${name}'s fear of you. ${name} is now ${adjustResult.value.class}`);
            personResult.value.setFear(adjustResult.value);
            personResult.value.trySetAwareness({ kind: "Aware" });
            env.applyBadActionToAll();
            return Result.makeSuccess({ kind: "AIMove" });
          }
        }
      }
    }
  }

  // Tell a person to stop following you.
  export function leaveMe(env: Environment) : Result.Result<AICall> {
    let companionOpt = env.getPlayer().getCompanion();
    if (companionOpt.kind === "None")
      return Result.makeFailure("You do not have a companion");
    else {
      env.getPlayer().setCompanion(Option.makeNone());
      return Result.makeSuccess({ kind: "AIMove" });
    }
  }

  // View people and items in the next room.
  export function peek(arg: string, env: Environment) : Result.Result<AICall> {
    let adjRooms = env.getMap().adjacentRooms;
    let adjRoomNames = List.map((a: AdjacentRoom) => a.name.toLowerCase(), adjRooms);
    if (adjRoomNames.includes(arg)) {
      let roomResult = WorldLoading.readRoom(arg);
      if (roomResult.kind === "Success") {
        Std.writeLine("Items:");
        roomResult.value[0].getItems().forEach(i => Std.writeLine(getNameWithType(i)));
        Std.writeLine("People:");
        roomResult.value[0].getPeople().forEach(p => Std.writeLine(p.getFullInfoStr()));
        return Result.makeSuccess({ kind: "AIMove" });
      } else {
        return roomResult;
      }
    } else {
      return Result.makeFailure(`${arg} is not an adjacent area`);
    }
  }

  // Add item from the environment to inventory.
  export function pickup(itemName: string, env: Environment) : Result.Result<AICall> {
    let itemResult = env.getRoom().tryFindItemByName(itemName);
    if (itemResult.kind === "None") {
      return Result.roomItemFindFailure(itemName, env.getRoom().getName());
    } else if (isHeavy(itemResult.value)) {
      return Result.makeFailure(`The item ${itemName} is too heavy to pick up`);
    } else {
      Std.writeLine("You picked up " + itemName);
      env.getRoom().removeItem(itemResult.value);
      env.getPlayer().addToInventory(itemResult.value);
      env.checkItemObjectives(itemResult.value);
      return Result.makeSuccess({ kind: "AIMove" });
    }
  }

  // Place an item in a container.
  export function place(itemName: string, targetName: string, env: Environment) : Result.Result<AICall> {
    let targetResult = env.getRoom().tryFindItemByName(targetName);
    if (targetResult.kind === "None")
      return Result.roomItemFindFailure(targetName, env.getRoom().getName());
    else {
      let itemResult = env.getPlayer().tryFindItemByName(itemName);
      if (itemResult.kind === "None")
        return Result.inventoryItemFindFailure(itemName);
      else if (targetResult.value.kind === "Container" ){
        Std.writeLine(`You put ${itemName} in ${targetName}`);
        targetResult.value.items.push(itemResult.value);
        env.getPlayer().removeFromInventory(itemResult.value);
        env.getPlayer().removeEquippedItemCheck(itemResult.value);
        return Result.makeSuccess({ kind: "AIMove" });
      } else {
        return Result.makeFailure(`The item ${targetName} cannot store items`);
      }
    }
  }

  // Hit a person with your fists. Does not require ammo. Never misses. Small amount of damage. Must be close to the person.
  export function punch(personName: string, env: Environment) : Result.Result<AICall> {
    let personResult: Option.Option<Person> = env.tryFindPersonByNameLower(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
      else {
        let closeTargetOpt = env.getPlayer().getCloseTarget();
        if (closeTargetOpt.kind === "Some" && closeTargetOpt.value.toLowerCase() === personName) {
          let damage = 10;
          personResult.value.applyAttack(damage, Option.makeSome(8), false);
          Std.writeLine(`You punched ${personResult.value.getName()}`)
          Std.writeLine(`${personResult.value.getName()}:\nHealth: ${personResult.value.getHealth()}, State: ${personResult.value.getState()}, Awareness: ${personResult.value.getAwarenessAsString()}`);
          if (personResult.value.getState() === "Dead") {
            Std.writeLine(personResult.value.getName() + " is dead");
            env.checkPersonObjectives(personResult.value);
            env.applyBadActionToAll();
            return Result.makeSuccess({ kind: "AIMove" });
          } else {
            return Result.makeSuccess({ kind: "AIMove" });
          }
        } else {
          return Result.makeFailure(personName + " is not in range for melee attacks");
        }
      }
  }

  // Exit the game.
  export function quit(env: Environment) : Result.Result<AICall> {
    env.setStatus("Exit");
    return Result.makeSuccess({ kind: "AIWait" });
  }
  
  // Romance a person and generate a new life.
  export function romance(personName: string, env: Environment) : Result.Result<AICall> {

    function getNewLife() : RespawnData {
      return { name: List.randomChoice(PeopleData.names), gender: PeopleData.getGenderByChance() };
    }
    function getResultStr(gA: Personality.Gender, gB: Personality.Gender) { return gA === gB ? "adopted" : "birthed"};
    

    let personResult: Option.Option<Person> = env.tryFindPersonByNameLower(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else {
      if (personResult.value.getCreatedNewLife())
        return Result.makeFailure("You have already created a new life with " + personResult.value.getName());
      else {
        if (env.getRoom().getPeople().filter(p => p.getState() === "SNormal").length > 1)
          return Result.makeFailure("There are too many people around to do that");
        else {
          if (personResult.value.getAttraction().class === "Love") {
            let newLife = getNewLife();
            Std.writeLine(`You and ${personResult.value.getName()} ${getResultStr(env.getPlayer().getGender(), personResult.value.getGender())}`);
            Std.writeLine(`new life added: ${newLife.name}, ${newLife.gender}`);
            personResult.value.setCreatedNewLife(true);
            env.addLife(newLife);
            return Result.makeSuccess({ kind: "AIMove" });
          } else {
            if (personResult.value.getState() === "Dead")
              return Result.makeFailure(`You perve, ${personResult.value.getName()} is dead!`);
            else if (personResult.value.getState() === "SNormal") {
              let damage = env.getPlayer().applyAngryAttack();
              Std.writeLine(`${personResult.value.getName()} did not take kindly to that. ${personResult.value.getGenderPronounString} attacked you for ${damage} damage`);
              personResult.value.setAttraction({ kind: "AttractionP", class: "Hate", value: 0 });
              personResult.value.setCreatedNewLife(true);
              env.applyBadActionToAll();
              return Result.makeSuccess({ kind: "AIAlert", target: { kind: "TPlayer" } });
            } else { // The person is asleep/unconscious/drunk so they do not resist. Affects nearby people though.
              if (personResult.value.isCompatableWith(env.getPlayer().getGender())) {
                let newLife = getNewLife();
                Std.writeLine(`new life added: ${newLife.name}, ${newLife.gender}`);
                personResult.value.setCreatedNewLife(true);
                env.addLife(newLife);
                env.applyBadActionToAll();
                return Result.makeSuccess({ kind: "AIMove" });
              }
            }
          }
        }
      }
    }

  }

  // Save the game.
  export function save(env: Environment) : Result.Result<AICall> {
    Std.writeLine("You saved the game");
    //WorldLoading.writeEnv(env);
    //WorldLoading.writeRoom(env.getRoom(), env.getMap());
    WorldLoading.save(env);
    env.setStatus("Continue");
    return Result.makeSuccess({ kind: "AIWait" });
  }
  
  // Scout a distant area.
  export function scout(roomName: string, env: Environment) : Result.Result<AICall> {
    let oRoomsOpt = env.getMap().overlookRooms;
    if (oRoomsOpt.rooms.kind === "None")
      return Result.makeFailure("The current location does not have any scoutable locations");
    else {
      let roomNameOpt = List.tryFind(rN => rN.toLowerCase() === roomName, oRoomsOpt.rooms.value);
      if (roomNameOpt.kind === "None")
        return Result.makeFailure(roomName + " is not a scoutable location");
      else {
        let roomResult = WorldLoading.readRoom(roomName);
        if (roomResult.kind === "Failure")
          return roomResult;
        else {
          Std.writeLine("Scout:");
          roomResult.value[0].getPeople().forEach(p => Std.writeLine(p.getName()));
          return Result.makeSuccess({ kind: "AIWait" });
        }
      }
    }
  }

  // Search for items and people in a location.
  export function search(arg: CommandTypes.SearchArg, env: Environment) : Result.Result<AICall> {
    if (arg.kind === "SearchArea") {
      Std.writeLine("Items:");
      env.getRoom().getItems().forEach((i: Item) => Std.writeLine(getNameWithType(i)));
      Std.writeLine("People:");
      env.getRoom().getPeople().sort((a: Person, b: Person) => {
        if (a.getState() === "SNormal" && b.getState() !== "SNormal") return -1;
        else if (a.getState() !== "SNormal" && b.getState() === "SNormal") return 1;
        else return 0;
    }).forEach(p => Std.writeLine(p.getFullInfoStr()));
    return Result.makeSuccess({ kind: "AIWait" });
  } else {
    let itemResult = env.getRoom().tryFindItemByName(arg.itemName);
    if (itemResult.kind === "None")
      return Result.roomFindFailure(arg.itemName);
    else {
      if (itemResult.value.kind !== "Container") {
        return Result.makeFailure(`The item ${arg.itemName} does not contain any items`);
      } else if (itemResult.value.items.length === 0) {
        Std.writeLine(arg.itemName + " is empty");
        return Result.makeSuccess({ kind: "AIWait" });
      } else {
        Std.writeLine(arg.itemName + " Items:");
        itemResult.value.items.forEach((i: Item) => Std.writeLine(getNameWithType(i)));
        return Result.makeSuccess({ kind: "AIWait" });
      }
    }
  }
}

  // Seduce a person. Large increase to attraction. Chance for failure.
  export function seduce(personName: string, env: Environment) : Result.Result<AICall> {
    let personResult: Option.Option<Person> = env.tryFindPersonByNameLower(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else {
      if (!personResult.value.getMoralityBasedChance()) {
        Std.writeLine(`${personResult.value.getName()} did not take kindly to your advances. You lost all of ${personResult.value.getPossiveGenderString()} attraction and trust.`);
        let damage = env.getPlayer().applyAngryAttack();
        Std.writeLine(`${personResult.value.getName()} attacked you for ${damage} damage`);
        personResult.value.setAttraction({ kind: "AttractionP", class: "Hate", value: 0 });
        personResult.value.setTrust({ kind: "TrustP", class: "TMistrust", value: 0 });
        personResult.value.trySetAwareness({ kind: "Aware" });
        return Result.makeSuccess({ kind: "AIMove" });
      } else {
        if (!personResult.value.isCompatableWith(env.getPlayer().getGender())) {
          Std.writeLine(personResult.value.getName() + " does not swing your way");
        } else {
          Std.writeLine(personResult.value.getName() + " accepted your advances");
          if (personResult.value.queryAttraction() === 10) 
            Std.writeLine(`${personResult.value.getName()}'s attraction is already maxed out`);
          else {
            Std.writeLine(`You maxed out ${personResult.value.getName()}'s attraction and trust in you`);
            personResult.value.setAttraction({ kind: "AttractionP", class: "Love", value: 10 });
            personResult.value.setTrust({ kind: "TrustP", class: "TFull", value: 10 });
          }
          return Result.makeSuccess({ kind: "AIMove" });
        }
        personResult.value.setAwareness({ kind: "Aware" });
        return Result.makeSuccess({ kind: "AIMove" });
      }
    }
  }

  // View buildings in the area and nearby locations by checking the World Map
  export function survey(env: Environment) : Result.Result<AICall> {
    let [currentRoom, adjacentRooms, overlookRooms] = [env.getMap().currentRoom, env.getMap().adjacentRooms, env.getMap().overlookRooms];
    Std.writeLine("Current Room: " + currentRoom);
    Std.writeLine("Adjacent Rooms:");
    adjacentRooms.forEach((a: AdjacentRoom) => Std.writeLine(Room.getRoomStateStr(a)));
    if (overlookRooms.rooms.kind === "Some") {
      Std.writeLine("Overlook Rooms:");
      overlookRooms.rooms.value.forEach(s => Std.writeLine(s));
    }
    return Result.makeSuccess({ kind: "AIWait" });
  }

  // Take an item from a person or container.
  export function takeFrom(targetName: string, itemName: string, env: Environment) : Result.Result<AICall> {
    function takeItem(item: Item, person: Person) {
      if (item.kind === "Consumable")
        person.setIsHoldingFood(false);
      else if (item.kind === "Weapon")
        person.setIsHoldingWeapon(false);
      person.removeFromInventory(item.info.name);
      env.getPlayer().addToInventory(item);
      Std.writeLine(`You took item ${item.info.name} from ${person.getName()}`);
    }

    let personResult = env.tryFindPersonByName(targetName);
    if (personResult.kind === "Some") { // Target is a person.
      let itemResult = personResult.value.tryFindItemByName(itemName);
      if (itemResult.kind === "None")
        return Result.makeFailure(`${targetName} does not have the item ${itemName}`);
      else {
        if (personResult.value.getState() !== "SNormal" || personResult.value.queryTrust() > 2) {
          takeItem(itemResult.value, personResult.value);
          return Result.makeSuccess({ kind: "AIMove" });
        } else if (personResult.value.getType() === "Guard") {
          return Result.makeFailure("You cannot take items from guards when they are conscious");
        } else {
          return Result.makeFailure(`${targetName} does not trust you enough to give you ${itemName}`);
        }
      }
    } else {
      let containerResult = env.getRoom().tryFindItemByName(targetName);
      if (containerResult.kind === "None")
        return Result.makeFailure(`${targetName} is not a valid person or container to take items from`);
      else if (containerResult.value.kind !== "Container")
        return Result.makeFailure(`The item ${targetName} cannot store any items`);
      else {
        let itemOpt: Option.Option<Item> = List.tryFind((i: Item) => i.info.name.toLowerCase() === itemName, containerResult.value.items);
        if (itemOpt.kind === "None")
          return Result.makeFailure(`The item ${targetName} does not contain ${itemName}`);
        else {
          Std.writeLine(`You took ${itemName} from ${targetName}`);
          env.getPlayer().addToInventory(itemOpt.value);
          removeItem(containerResult.value, itemOpt.value);
          return Result.makeSuccess({ kind: "AIMove" });
        }
      }
    }

  }

  // Talk to a person to get information and increase trust.
  export function talk(personName: string, env: Environment) : Result.Result<AICall> {
    let personResult: Option.Option<Person> = env.tryFindPersonByNameLower(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
    else {
      if (personResult.value.queryTrust() <= 2) {
        Std.writeLine(personResult.value.getName() + " does not trust you enough to talk to you");
        return Result.makeSuccess({ kind: "AIMove" });
      } else {
        let inquireResult = personResult.value.stringToDataString(List.randomChoice(Person.inquireInfo));
        if (inquireResult.kind === "Failure")
          return inquireResult;
        else {
          Std.writeLine(`${personResult.value.getName()} gave you some information:`);
          Std.writeLine(inquireResult.value);
          if (Math.random() < personResult.value.getResponsiveness()) {
            let adjResult = Personality.adjustTrust({ kind: "Up", value: 1 }, personResult.value.getTrust());
            if (adjResult.kind === "Failure")
              return Result.makeFailure(`${personResult.value.getName()}'s ${adjResult.value}`);
            else {
              Std.writeLine(`You increased ${personResult.value.getName()}'s trust in you`);
              personResult.value.setTrust(adjResult.value);
              personResult.value.setAwareness({ kind: "Aware" });
              return Result.makeSuccess({ kind: "AIMove" });
            }
          } else {
            return Result.makeSuccess({ kind: "AIMove" });
          }
        }
      }
    }
  }
  
  // Teleport to a room. Will throw an exception if the room is not found in a file. Only used for debugging purposes.
  export function teleport(roomName: string, env: Environment) : Result.Result<AICall> {
    let roomResult = WorldLoading.readRoom(roomName);
    if (roomResult.kind === "Failure")
      return Result.makeFailure("Error " + roomResult.value);
    else {
      WorldLoading.writeRoom(env.getRoom(), env.getMap());
      env.setRoom(roomResult.value[0]);
      env.setMap(roomResult.value[1]);
      env.addVisited(roomName);
      return Result.makeSuccess({ kind: "AIWait" });
    }
  }
  
  // Unequip a weapon and hides it from other people.
  export function unequip(env: Environment) : Result.Result<AICall> {
    let item = env.getPlayer().getEquippedItem();
    if (item.kind === "None")
      return Result.makeFailure("You do not have a weapon equipped");
    else {
      Std.writeLine("You unequipped " + item.value.info.name);
      env.getPlayer().unequipItem();
      return Result.makeSuccess({ kind: "AIMove" });
    }
  }


  // Unlock an adjacent room if the player has the right key.
  export function unlock(roomName: string, env: Environment) : Result.Result<AICall> {
    let adjRooms = env.getMap().adjacentRooms;
    let roomResult = List.tryFind((a: AdjacentRoom) => a.name.toLowerCase() === roomName, adjRooms);
    if (roomResult.kind === "None")
      return Result.roomFindFailure(roomName);
    else {
      if (roomResult.value.lockState.kind === "Unlocked" || roomResult.value.lockState.kind === "Secret") {
        return Result.makeFailure(`The door to ${roomName} is not locked`);
      } else {

        function changeLockState(roomName: string, roomInfo: [Room, RoomMap]) : [Room, RoomMap] {
          let [room, map] = roomInfo;
          let newAdjRoom: AdjacentRoom = { kind: "AdjacentRoom", name: roomName, lockState: { kind: "Unlocked" } };
          let newAdjRooms = List.replaceByWith((p: AdjacentRoom) => p.name.toLowerCase() === roomName.toLowerCase(), newAdjRoom, map.adjacentRooms);
          return [room, { kind: "RoomMap", currentRoom: map.currentRoom, adjacentRooms: newAdjRooms, overlookRooms: map.overlookRooms }];
        }

        // Check that the player has the correct key.
        let code = roomResult.value.lockState.code;
        if (List.countBy((i: Item) => i.kind === "Key" && i.doorCode === code, env.getPlayer().getItems()) >= 1) {
          // Load the next room.
          let loadedRoomResult = WorldLoading.readRoom(roomName);
          if (loadedRoomResult.kind === "Failure")
            return loadedRoomResult;
          else {
            // Unlock the access for all other rooms that lead to this room.
            let otherRoomNames = List.map((a: AdjacentRoom) => a.name.toLowerCase(), loadedRoomResult.value[1].adjacentRooms).filter(s => s !== roomName);
            otherRoomNames.forEach(name => {
              let nameRoomResult = WorldLoading.readRoom(name);
              if (nameRoomResult.kind === "Failure") {
                Std.writeLine(nameRoomResult.value)
              } else {
                let newRInfo = changeLockState(roomName, nameRoomResult.value);
                WorldLoading.writeRoom(newRInfo[0], newRInfo[1]);
              }
            })
            
            Std.writeLine(`You unlocked ${roomName}`);
            let map = changeLockState(roomName, [env.getRoom(), env.getMap()]);
            env.setMap(map[1]);
            return Result.makeSuccess({ kind: "AIMove" });
          }
        } else {
          return Result.makeFailure(`The door could not be unlocked. You do not have a ${code} key`);
        }
      }
    }
  }

  // View player's status and inventory.
  export function view(arg: CommandTypes.ViewArg, env: Environment) : Result.Result<AICall> {
    switch (arg.kind) {
      case "Inventory": 
        Std.writeLine("Items:"); 
        List.map((i: Item) => getNameWithType(i), env.getPlayer().getItems()).forEach(s => Std.writeLine(s)); 
        return Result.makeSuccess({ kind: "AIWait" });
      case "Time": 
        Std.writeLine(`Time: ${env.getTime().asString()}`);
        return Result.makeSuccess({ kind: "AIWait" });
      case "PersonStats":
        let personResult: Option.Option<Person> = env.tryFindPersonByNameLower(arg.personName);
        if (personResult.kind === "None")
          return Result.personFindFailure(arg.personName);
        else {
          personResult.value.printStats()
          return Result.makeSuccess({ kind: "AIWait" });
        }

      case "PlayerStats":
        env.getPlayer().printStats();
        return Result.makeSuccess({ kind: "AIWait" });
      case "CompanionName":
        let companion = env.getPlayer().getCompanion();
        if (companion.kind === "None")
          return Result.makeFailure("You do not have a companion");
        else {
          Std.writeLine("Companion: " + companion.value);
          return Result.makeSuccess({ kind: "AIWait" });
        }

      case "Objectives":
        Std.writeLine("Objectives:");
        List.map((o: Objective.Objective) => Std.writeLine(Objective.toString(o)), env.getObjectives());
        return Result.makeSuccess({ kind: "AIWait" });

      case "VisitedRooms":
        Std.writeLine("VisitedRooms: ");
        env.getVisitedRooms().forEach(r => Std.writeLine(r));
        return Result.makeSuccess({ kind: "AIWait" });
    }
  }

  // Wait and allow the ai to take a turn.
  export function wait(env: Environment) : Result.Result<AICall> {
    Std.writeLine("You let the AI take a turn");
    return Result.makeSuccess({ kind: "AIMove" });
  }
} 