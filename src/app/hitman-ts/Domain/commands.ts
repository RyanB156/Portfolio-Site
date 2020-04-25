import { List } from './list';
import { Std } from './std';
import { Result } from './result';
import { Option } from './option';
import { Person, AICall } from './person';
import { Random } from './random';
import { Personality } from './personality';
import { Environment } from './environment';
import { Item, getNameWithType, fire } from './item';
import { CommandTypes } from './command-types';
import { AdjacentRoom, Room } from './room';
import { Objective } from './objective';
import { stringify } from 'querystring';

export namespace Commands {

  const commandList = new Map<string, string>([
    ["amuse", "amuse <person> - tell a joke to lift a person's spirits, it may backfire"],
    ["apply", "apply <poisonName> to <itemName> - poison a weapon or consumable item"],
    ["approach", "approach <person> - get in close quarters to a person, giving them a chance to react. Required for melee attacks"],
    ["attack", "attack <person> - attack a person with the equipped weapon"],
    ["capture", "capture <person> - capture a terrified person to get an extra life. Only \"Fearful\" people can be made terrified."],
    ["cheerup", "cheerup <person> - increase a person's happiness"],
    ["chokeout", "chokeout <person> - render a person unconscious"],
    ["command", "command <person> <pickup/goto/attack/stop> <target> - command an ai to take an action"],
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

  let aiCommandList = [ "pickup", "attack", "goto", "stop", "killyourself" ];

  // Creates a list of the elements in a list that match a given pattern in ascending order.
  function getSuggestions(matchStrings: string[], pattern: string) : [number, string][] {
    let matchedPairs: [number, string][] = [];
    matchStrings.forEach((s: string) => {
      matchedPairs.push([List.stringDiff(s, pattern), s]);
    });
    return matchedPairs.sort((a, b) => {
      if (a > b) return -1;
      else if (a < b) return 1;
      else return 0;
    });
  }

  export function getCmdSuggestions(str: string, minVal: number) {
    let suggestions = getSuggestions(Array.from(commandList.keys()), str);
    return suggestions.filter(pair => pair[0] >= minVal);
  }

  export function printSuggestion(str: string, minVal: number) {
    let suggestions = getCmdSuggestions(str, minVal);
    if (suggestions.length > 0) {
      Std.writeLine("Did you mean... :");
      suggestions.forEach(e => Std.writeLine(e[1].toUpperCase()));
    }
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
        Std.writeLine(`You ${adjStr} ${personResult.value.getName()}'s spirits`);
        let adjustResult = Personality.adjustMood(adj, personResult.value.getMood());
        if (adjustResult.kind === "Failure")
          return Result.makeFailure(Result.printPersonalityAdjFailureStr(personResult.value, adjustResult.value));
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
      env.getPlayer().setCloseTarget(personResult.value);
      return Result.makeSuccess({ kind: "AIMove" });
    }
  }

  // Attack the specified person with the equipped weapon.
  export function attack(personName: string, env: Environment) {
    let personResult = env.tryFindPersonByNameLower(personName);
    if (personResult.kind === "None")
      return Result.personFindFailure(personName);
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
              Std.writeLine(`${personResult.value.getName()}:\nHealth: ${personResult.value.getHealth()}, State: ${personResult.value.getState()}, Awareness: ${personResult.value.getAwareness()}`);
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
            Std.writeLine(`${personResult.value.getName()}:\nHealth: ${personResult.value.getHealth()}, State: ${personResult.value.getState()}, Awareness: ${personResult.value.getAwareness()}`);
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
  export function capture(personName: string, env: Environment) {
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
            return Result.makeFailure(Result.printPersonalityAdjFailureStr(personResult.value, moodResult.value));
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
      if (!personResult.value.isCompliant() || personResult.value.getState() === "Dead") {
        Std.writeLine(`${personResult.value.getName()} will not take orders from you`);
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
            Result.printPersonalityAdjFailure(personResult.value, attractionResult);
          else {
            Std.writeLine(`You increased ${personResult.value.getName()}'s attraction towards you`)
            personResult.value.setAttraction(attractionResult.value);
          }
        } else {
          Std.writeLine(`${personResult.value.getName()} does not swing your way`);
        }
        // Try to increase the person's mood.
        let moodResult: Result.Result<Personality.MoodP> = Personality.adjustMood({ kind: "Up", value: 2 }, personResult.value.getMood());
        if (moodResult.kind === "Failure")
          Result.printPersonalityAdjFailure(personResult.value, moodResult);
        else {
          Std.writeLine(`You lifted ${personResult.value.getName()}'s spirits`);
          personResult.value.setMood(moodResult.value);
        }
      } else {
        Std.writeLine(`${personResult.value.getName()} did not respond to your compliment`);
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
        } else {
          env.setStatus("PartialWin");
          Std.writeLine(`You have completed only ${finishedObjs}/${totalObjs}`);
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
  

  /*
  // Move to the specified location, if possible.
  export function goto(arg: CommandTypes.OptionArg, force: boolean, env: Environment) : Result.Result<AICall> {

    // Process moving into the room with a companion and alerting any guards if the area is restricted.
    function travelToRoom(loadedRoom: Room, roomName: string, alertGuards: boolean) {
      
    }

    //let travelToRoom loadedRoom roomName map alertGuards =
      let rec takeCompanion tempEnv = 
          match tempEnv.Player.CompanionName with
          | None ->
              RoomIO.writeToFile (tempEnv.Room, env.Map)  // Save old room information to a file.
              printfn "Moved to %s" roomName; 
              // Apply status updates if the player has been in this room already and then returns.
              {tempEnv with Room = loadedRoom; Map = map}
          | Some companionName ->                                    // Player's companion follows them to the next room.
              match tempEnv |> Environment.tryFindPersonByName companionName with
              | None -> failwithf "Error finding companion %s in the room. Commands.goto.travelToRoom" companionName
              | Some companion when companion.State = SNormal ->
                  printfn "Moved to %s with %s" roomName companionName
                  let newPrevRoom = {tempEnv.Room with People = tempEnv.Room.People |> List.removeOne companion} // Take the companion out of the current room,
                  RoomIO.writeToFile (newPrevRoom, tempEnv.Map)                                                 
                      
                  let newLoadedRoom = {loadedRoom with People = companion::loadedRoom.People} // and add it to the loaded room. 
                  {tempEnv with Room = newLoadedRoom; Map = map}  // Return updated environment.
              | _ -> 
                  let newPlayer = {tempEnv.Player with CompanionName = None}
                  let newEnvironment = tempEnv |> Environment.updatePlayer newPlayer
                  takeCompanion newEnvironment

      // Remove stored status people upon entering the new room.
      let removeOldStatusPeople env =                             // Person not updated when returning to the room. Dead from poison -> still alive...
      {env with UpdatePeople = env.UpdatePeople 
              |> List.filter (fun p -> loadedRoom.People |> List.map Person.getName |> List.contains (p.Info.Name) |> not)}
      // Add new stored status people from the old room (env.Room)
      let addNewStatusPeople env =                                // This one works though...
          {env with UpdatePeople = env.UpdatePeople @ (env.Room.People |> List.filter Person.hasStatusEffect)}
      // Add status effected people to env.UpdatePeople from env.Room.People. Replace people in newRoom.People with people in env.UpdatePeople.
      let applyUpdateStatus (env:Environment) = 
          {env with Room = env.UpdatePeople |> List.fold (fun room p -> room |> Room.updatePerson p) env.Room}

      let newEnvironment = env |> addNewStatusPeople |> takeCompanion |> applyUpdateStatus |> removeOldStatusPeople |> Environment.addVisited roomName

      if alertGuards || force then Success (newEnvironment, AIAlert TPlayer)
      else Success (newEnvironment, AIMove)

      

  }

  //let goto arg force env = 

      
          

      let (_, adjacentRooms, _) = env.Map
      match arg with
      | Empty -> 
          adjacentRooms |> List.filter (fun (n,l) -> match l with | Secret -> false | _ -> true) 
              |> List.sortBy (fun (n,l) -> match l with | Unlocked -> 0 | _ -> 10)
              |> List.iter (fun (name, lockState) -> printfn "%s - %A" name lockState)
          Success (env, AIWait) // Viewing nearby rooms does not trigger the ai.
      | Arg roomName -> 
          if roomName = (env.Room |> Room.getName |> String.toLower) then Failure ("You are already there") else
          let roomOpt = adjacentRooms |> List.tryFind (fst >> String.toLower >> (=) roomName) // Gets the CamelCase version of the name by searching the adjacent rooms list.

          let successF =
              match RoomIO.readFromFile roomName with // Load new room information from a file using name from List.tryFind.
              | Failure s -> Failure s // Internal matching error.
              | Success (loadedRoom, map) ->      // New room loaded from file.
                  match loadedRoom.People |> List.tryFind (Person.getAwareness >> (=) Warn) with
                  | Some guard when env.Player.Disguise.IsSome |> not -> 
                      printfn "%s: You are not allowed to be here" guard.Info.Name // Guards can patrol certain restricted areas. They will become hostile on entering.
                          travelToRoom loadedRoom roomName map true
                  | _ -> travelToRoom loadedRoom roomName map false
          match roomOpt with
          | None -> Failure (sprintf "%s is not a nearby location" roomName) // Not listed in nearby locations.
          | Some (_,Unlocked) | Some (_,Secret) -> successF   // Is nearby and accessible.
          | Some (_,(Locked code)) when force -> 
              // Forcing the room open, ignore locked doors, alerts guards in next room.
              printfn "You broke into %s. The guards have been alerted." roomName; successF 
              
          | Some (_,Locked code) -> Failure (sprintf "%s is locked. %A key required" roomName code) // Is locked.

  // Force your way into a room. Uses "goto arg (true) env".
  export function forceGoto(arg: CommandTypes.OptionArg, env: Environment) {
    return goto(arg, true, env);
  }

*/


/*
          
  /// Display list of possible commands.
  let help arg env =
      match arg with
      | Empty -> commandList |> List.iter (snd >> printfn "%s"); Success (env, AIWait)
      | Arg c ->
          match List.tryFind (fst >> (=) c) commandList with
          | None -> Failure (sprintf "The command %s is not listed under HELP\n" c + printSuggestion c)
          | Some (name,info) -> printfn "%s" info; Success (env, AIWait)

  /// Get information from/about nearby people.
  let inquire question personName env =
      match env |> Environment.tryFindPersonByName personName with
      | None -> Failure.personFindFailure personName
      | Some person when person.State <> Dead -> 
          if Person.queryTrust person <= 2 then Failure (sprintf "%s does not trust you enough to disclose their %s" personName question) else
          match Person.stringToDataString question person with
          | Failure f -> Failure f
          | Success response -> 
              printfn "Response: \n%s" response
              let newPerson = person |> Person.trySetAwareness Aware
              let newEnvironment = env |> Environment.updatePerson newPerson
              Success (newEnvironment, AIMove)
      | Some person -> Failure (sprintf "%s is dead" person.Info.Name)

  /// Reveal information about clues.
  let inspect itemName env =
      let findItem () =
          match env.Player |> Player.tryFindItemByName itemName with
          | Some item -> Some item
          | None ->
              match env.Room |> Room.tryFindItemByName itemName with
              | Some item -> Some item
              | None -> None
      match findItem () with
      | None -> Failure.roomItemFindFailure itemName env.Room.Info.Name
      | Some (Clue (info, clueInfo)) ->
          printfn "Clue - %s:\n%s" itemName clueInfo
          Success (env, AIWait)
      | Some (HiddenPassageway (info, roomNames)) -> 
          printfn "Hidden Passageway revealed: \n"; roomNames |> List.iter (printfn "%s")
          let newEnvironment = env |> Environment.revealPassageways
          Success (newEnvironment, AIWait)
      | _ -> Failure (sprintf "%s is not a clue" itemName)

  /// Intimidate a person to make them afraid of you. Lower there resistance to your influence.
  let intimidate personName env =
      let getFearIncrease person =
          match person.Personality.Bravery with
          | BFearful -> 3, true
          | BNeutral -> 1, true
          | BBrave -> 0, false
      match env |> Environment.tryFindPersonByName personName with
      | None -> Failure.personFindFailure personName
      | Some person when person.State <> Dead ->
          match getFearIncrease person with
          | _, false -> printfn "%s will not be intimidated by you" person.Info.Name; Success (env, AIMove)
          | x, true ->
              match person.Personality.Fear |> Personality.adjustFear (Up x) with
              | Failure f -> Failure f
              | Success newFear ->
                  if env.Rng.Next(0, x+1) = 0 then    // Random chance for the person to attack based on their bravery stat.
                      
                      printfn "The guards have been alerted"
                      let (newPlayer,damage) = env.Player |> Player.applyAngryAttack env.Rng
                      printfn "%s resisted your attempts to intimidate %s. %s attacked you for %d damage" 
                          person.Info.Name (person |> Person.getGenderObjectiveString) (person |> Person.getGenderPronounString) damage
                      let newEnvironment = env |> Environment.updatePlayer newPlayer |> Environment.applyBadActionToAll
                      Success (newEnvironment, AIAlert TPlayer)   // Alert guards on a failed "intimidate" command.
                  else
                      let name = person.Info.Name
                      printfn "You increased %s's fear of you. %s is now %s" name name (newFear |> fst |> Personality.getFearAsString)
                      let newPerson = person |> Person.setFear newFear |> Person.trySetAwareness Aware
                      let newEnvironment = env |> Environment.updatePerson newPerson |> Environment.applyBadActionToAll
                      Success (newEnvironment, AIMove)
      | Some person -> Failure (sprintf "%s is dead" person.Info.Name)

  /// Tell a person to stop following you.
  let leaveMe env =
      match env.Player.CompanionName with
      | None -> Failure ("You do not have a companion")
      | Some companionName ->
          printfn "You have left your companion: %s" companionName
          let newPlayer = {env.Player with CompanionName = None}
          let newEnvironment = env |> Environment.updatePlayer newPlayer
          Success (newEnvironment, AIMove)
          

  /// View people and items in the next room.
  let peek arg env =
      let _, adjRooms, _ = env.Map
      let adjRoomNames = adjRooms |> List.map (fst >> String.toLower)
      if List.contains arg adjRoomNames then
          match RoomIO.readFromFile arg with
          | Failure f -> Failure f
          | Success (adjRoom, _) ->
              printfn "Items:"
              adjRoom.Items |> List.iter (Item.getNameWithType >> printfn "%s")
              printfn "People:"
              adjRoom.People |> List.iter (Person.getFullInfoStr >> printfn "%s")
              Success (env, AIMove)
      else Failure (sprintf "%s is not an adjacent area" arg)


  /// Add item from the environment to inventory.
  let pickup itemName env =
      let intelCheck item env =
          match item with
          | Intel _ -> Environment.checkItemObjectives item env
          | _ -> env
      match Room.tryFindItemByName itemName env.Room with
      | None -> Failure.roomItemFindFailure itemName env.Room.Info.Name
      | Some item -> 
          if item |> Item.isHeavy then Failure (sprintf "The item %s is too heavy to pick up" itemName) else
          printfn "You picked up %s" itemName
          let player = env.Player
          let newPlayer = {player with Items = item::player.Items}
          let newEnvironment = 
              env
              |> Environment.updateItems (List.removeOne item)
              |> Environment.updatePlayer newPlayer
              |> intelCheck item
          Success (newEnvironment, AIMove)

  /// Place an item in a container.
  let place itemName targetName env =
      match Room.tryFindItemByName targetName env.Room with
      | None -> Failure.roomItemFindFailure itemName env.Room.Info.Name
      | Some (Container (items,info)) -> 
          match Player.tryFindItemByName itemName env.Player with
          | None -> Failure.inventoryItemFindFailure itemName
          | Some playerItem -> 
              printfn "You put %s in %s" itemName targetName
              let newPlayer =
                  {env.Player with Items = env.Player.Items |> List.removeOne playerItem}
                  |> Player.removeEquippedItemCheck playerItem
              let newContainer = Container (playerItem::items, info)
              let newEnvironment =
                  env
                  |> Environment.updateItems (List.replaceByWith (Item.getName >> String.toLower >> (=) targetName) newContainer)
                  |> Environment.updatePlayer newPlayer
              Success (newEnvironment, AIMove)
      | Some _ -> Failure (sprintf "The item %s cannot store any items" targetName)

  /// Hit a person with your fists. Does not require ammo. Never misses. Small amount of damage. Must be close to the person.
  let punch personName env =
      match env |> Environment.tryFindPersonByName personName with
      | None -> Failure.personFindFailure personName
      | Some person ->
          match env.Player.CloseTarget with
          | Some cTarget when cTarget |> String.toLower = personName ->
              let attackDamage = 10
              match person |> Person.applyAttack attackDamage env.Rng (Some 8) false with
              | Failure f -> Failure f
              | Success newPerson ->
                  printfn "You punched %s for %d damage" cTarget attackDamage
                  printfn "%s:\nHealth: %d, State: %s, Awareness: %s" personName newPerson.Health (newPerson |> Person.getStateAsString) (newPerson.Awareness |> Person.getAwarenessAsString)
                  
                  let newPlayer = env.Player |> Player.updateCloseTarget newPerson
                  let newEnvironment = env |> Environment.updatePerson newPerson |> Environment.updatePlayer newPlayer
                  let personIsDead = if newPerson.State = Dead then printfn "%s is dead" (person |> Person.getName); true else false
                  let newEnvironment =
                      match personIsDead with
                      | true -> newEnvironment |> Environment.checkPersonObjectives newPerson // Check if the dead person fills a mission objective.
                      | false -> newEnvironment
                  Success (newEnvironment |> Environment.applyBadActionToAll , AIMove)
          | _ -> Failure (sprintf "%s is not in range for melee attacks" personName)

  /// Exit the game.
  let quit env = Success ({env with GameStatus = Exit}, AIWait)

  /// Romance a person and generate a new life.
  let romance personName env =

      let getNewLife =    // Get a randomly selected name and gender from the WorldGeneration file PeopleData.fs
          let name = PeopleData.names |> List.randomChoice env.Rng
          let gender = PeopleData.getGenderByChance env.Rng
          name, gender
      let getResultStr genderA genderB =
          if genderA = genderB then "adopted" else "birthed"
      let gCheck person env =
          let newLife = getNewLife
          if Person.getCompatability env.Player.Gender person then printfn "New life added: %A" newLife; env |> Environment.addLife newLife
          else env

      match env |> Environment.tryFindPersonByName personName with
      | None -> Failure.personFindFailure personName
      | Some person ->
          if person.CreatedNewLife then Failure (sprintf "You have already created a new life with %s" person.Info.Name) else
          if env.Room.People 
              |> List.filter (fun p -> match p.State with | SNormal -> true | _ -> false) 
              |> List.length > 1 then Failure ("There are too many people around to do that") else
          match person |> Person.getAttraction |> fst with
          | Love ->
              let newLife = getNewLife
              printfn "You and %s %s a new person" person.Info.Name (getResultStr env.Player.Gender person.Gender)
              printfn "New life added: %A" newLife
              let newPerson = person |> Person.setCreatedNewLife true
              let newEnvironment = env |> Environment.addLife newLife |> Environment.updatePerson newPerson
              Success (newEnvironment, AIMove)
          | _ ->
              match person.State with
              | Dead -> Failure (sprintf "You perve, %s is dead!" person.Info.Name)
              | SNormal ->
                  printf "%s does not like you enough for romance. Are you sure? (y/n): " person.Info.Name
                  match System.Console.ReadLine() with    // Give the player the option to commit rape or not.
                  | "y" | "Y" ->
                      let (newPlayer, damage) = env.Player |> Player.applyAngryAttack env.Rng
                      printfn "%s did not take kindly to that. %s attacked you for %d damage" person.Info.Name (person |> Person.getGenderPronounString) damage
                      let newPerson = person |> Person.setAttraction (Hate, 0) |> Person.setCreatedNewLife true
                      let newEnvironment = 
                          env |> Environment.updatePlayer newPlayer 
                          |> Environment.updatePerson newPerson |> gCheck person
                          |> Environment.applyBadActionToAll 
                      Success (newEnvironment, AIAlert TPlayer)
                  | _ -> Success (env, AIMove)
              | _ ->  // The person is asleep/unconscious/drunk so they do not resist. Affects nearby people though.
                  let newPerson = person |> Person.setCreatedNewLife true
                  let newEnvironment = env |> Environment.updatePerson newPerson |> gCheck person |> Environment.applyBadActionToAll 
                  Success (newEnvironment, AIMove)
              

  /// Save the game.
  let save env = 
      printfn "You saved the game"
      EnvironmentIO.writeToFile env
      RoomIO.writeToFile (env.Room, env.Map)
      Success ({env with GameStatus = Continue}, AIWait)

  /// Scout a distant area.
  let scout roomName env =
      let (_,_,oRoomsOpt) = env.Map
      match oRoomsOpt with
      | None -> Failure "The current location does not have any scoutable locations"
      | Some oRooms ->
          match oRooms |> List.tryFind (String.toLower >> (=) roomName) with
          | None -> Failure (sprintf "%s is not a scoutable location" roomName)
          | Some roomStr ->
              match RoomIO.readFromFile roomStr with
              | Failure f -> Failure f
              | Success (room,_) ->
                  printfn "Scout:"
                  room.People |> List.iter (Person.getName >> printfn "%s")
                  Success (env, AIWait)


  /// Search for items and people in a location.
  let search arg env = 
      match arg with
      | SearchArea -> 
          printfn "Items:"
          env.Room.Items |> List.iter (Item.getNameWithType >> printfn "%s")
          printfn "People:"
          env.Room.People |> List.sortBy (fun p -> match p.State with | SNormal -> 0 | _ -> 10) |> List.iter (Person.getFullInfoStr >> printfn "%s")
          Success (env, AIWait)
      | SearchItem itemName ->
          match Room.tryFindItemByName itemName env.Room with
          | None -> Failure.roomItemFindFailure itemName env.Room.Info.Name
          | Some s -> 
              match Item.getItems s with
              | None -> Failure (sprintf "The item %s does not contain any items" itemName)
              | Some [] -> printfn "%s is empty" itemName; Success (env, AIWait)
              | Some items -> 
                  printfn "%s Items:" itemName
                  items |> List.iter (Item.getNameWithType >> printfn "%s")
                  Success (env, AIWait)

  /// Seduce a person. Large increase to attraction. Chance for failure.
  let seduce personName env =
      let trySetFullAttraction person =
          match person |> Person.getCompatability env.Player.Gender with
          | false -> printfn "%s does not swing your way" (person.Info.Name); person
          | true ->
              printfn "%s accepted your advances" person.Info.Name
              if Person.queryAttraction person = 10 then printfn "%s's attraction is already maxed out" person.Info.Name; person
              else printfn "You maxed out %s's attraction and trust to you" person.Info.Name; 
                      person |> Person.setAttraction (Love, 10) |> Person.setTrust (TFull, 10)

      match env |> Environment.tryFindPersonByName personName with
      | None -> Failure.personFindFailure personName
      | Some person ->
          match person |> Person.getMoralityBasedChance env.Rng with
          | false ->
              printfn "%s did not take kindly to your advances. You lost all of %s attraction and trust." person.Info.Name (Person.getPossessiveGenderString person)
              let (newPlayer, damage) = env.Player |> Player.applyAngryAttack env.Rng
              printfn "%s attacked you for %d damage" person.Info.Name damage
              let newPerson = person |> Person.setAttraction (Hate, 0) |> Person.setTrust (TMistrust, 0)
              let newEnvironment = env |> Environment.updatePerson newPerson |> Environment.updatePlayer newPlayer
              Success (newEnvironment, AIMove)
          | true ->
              let newPerson = person |> trySetFullAttraction |> Person.trySetAwareness Aware
              let newEnvironment = env |> Environment.updatePerson newPerson
              Success (newEnvironment, AIMove)

  /// View buildings in the area and nearby locations by checking the World Map
  let survey env = 
      let (currentRoom, adjacentRooms, overlookRooms) = env.Map
      printfn "Current Room: %s" currentRoom
      printfn "Adjacent Rooms:"
      adjacentRooms |> List.filter (fun (name, lockState) -> lockState <> Secret) |> List.iter (AdjacentRoom.getRoomStateStr >> printfn "%s")
      overlookRooms |> function Some rs -> printfn "Overlook Rooms:"; rs |> List.iter (printfn "%s") | None -> ()
      Success (env, AIWait)


  /// Take an item from a person or container.
  let takeFrom targetName itemName env =
      let tryTakeSpecialItem item person = // 1 food, and 1 weapon are special cases for the person. Change the "IsHolding_" flags accordingly.
          match item with
          | Consumable _ -> {person with IsHoldingFood = false}
          | Weapon _ -> {person with IsHoldingWeapon = false}
          | _ -> person
      match env.Room |> Room.tryFindPersonByName targetName with
      | Some person ->
          let takeItem item =
              let newPerson = {person with Items = person.Items |> List.removeOne item} |> tryTakeSpecialItem item
              let newPlayer = {env.Player with Items = item::env.Player.Items}
              printfn "You took item %s from %s" (item |> Item.getName) (person.Info.Name)
              env |> Environment.updatePerson newPerson |> Environment.updatePlayer newPlayer

          match person |> Person.tryFindItemByName itemName with
          | None -> Failure (sprintf "%s does not have the item %s" targetName itemName)
          | Some item when person.State <> SNormal -> Success (takeItem item, AIMove)
          | Some _ when person.Type = Guard -> Failure ("You cannot take items from guards when they are conscious")
          | Some item when Person.queryTrust person > 2 -> Success (takeItem item, AIMove)
          | Some _ -> Failure (sprintf "%s does not trust you enough to give you %s" targetName itemName)
      | None -> 
          match Room.tryFindItemByName targetName env.Room with
          | None -> Failure (sprintf "%s is not a valid person or container to take items from" targetName)
          | Some (Container (items,info)) ->
              match items |> List.tryFind (Item.getName >> String.toLower >> (=) itemName) with
              | None -> Failure (sprintf "The item %s does not contain %s" targetName itemName)
              | Some containerItem -> 
                  printfn "You took %s from %s" itemName targetName
                  let newPlayer = {env.Player with Items = containerItem::env.Player.Items} // Add item to player inventory.
                  let newContainer = Container (items |> List.removeOne containerItem, info) // Remove item from targetItem's inventory.
                  let newEnvironment =
                      env
                      |> Environment.updateItems (List.replaceByWith (Item.getName >> String.toLower >> (=) targetName) newContainer)
                      |> Environment.updatePlayer newPlayer
                  Success (newEnvironment, AIMove)
          | Some _ -> Failure (sprintf "The item %s cannot store any items" targetName)

  /// Talk to a person to get information and increase trust.
  let talk personName env =
      match env |> Environment.tryFindPersonByName personName with
      | None -> Failure.personFindFailure personName
      | Some person ->
          if person |> Person.queryTrust <= 2 then
              printfn "%s does not trust you enough to talk to you" person.Info.Name
              Success (env, AIMove)
          else
              match Person.stringToDataString Person.inquireInfo.[env.Rng.Next(0, (Person.inquireInfo |> List.length) - 1)] person with
              | Failure f -> failwith f
              | Success infoString ->
                  printfn "%s gave you some information:" person.Info.Name
                  printfn "%s" infoString
                  if env.Rng.NextDouble() < person.Responsiveness then    // Each person has a parameter to limit the effects of "talking" with them.
                      match person.Personality.Trust |> Personality.adjustTrust (Up 1) with
                      | Failure f -> Failure (sprintf "%s" (person.Info.Name) + "'s " + f)
                      | Success newTrust ->
                          printfn "You increased %s's trust in you" person.Info.Name
                          let newPerson = person |> Person.setTrust newTrust |> Person.trySetAwareness Aware
                          let newEnvironment = env |> Environment.updatePerson newPerson
                          Success (newEnvironment, AIMove)
                  else Success (env, AIMove)

  /// Teleport to a room. Will throw an exception if the room is not found in a file. Only used for debugging purposes.
  let teleport roomName env =
      let result = RoomIO.readFromFile roomName
      match result with
      | Failure f -> failwithf "%s" f
      | Success (room,roomMap) ->
          RoomIO.writeToFile (env.Room, env.Map)
          let newEnvironment = {env with Room = room; Map = roomMap} |> Environment.addVisited roomName
          Success (newEnvironment, AIWait)


  /// Unequip a weapon and hides it from other people.
  let unequip env =
      match env.Player.EquippedItem with
      | None -> Failure ("You do not have a weapon equipped")
      | Some item ->
          printfn "You unequipped %s" (item |> Item.getName)
          let newPlayer = {env.Player with EquippedItem = None}
          Success ({env with Player = newPlayer}, AIMove)
      

  /// Unlock an adjacent room if the player has the right key.
  let unlock roomName env =
      let (_,adjRooms,_) = env.Map
      match adjRooms |> List.tryFind (fst >> String.toLower >> (=) roomName) with
      | None -> Failure.roomFindFailure roomName
      | Some (name,lockState) ->
          match lockState with
          | Unlocked | Secret -> Failure (sprintf "The door to %s is not locked" roomName)
          | Locked code ->
              let changeLockState roomName roomInfo : RoomInfo =
                  let (room,map) = roomInfo
                  let (cRoom,adjRooms,oRooms) = map
                  let newAdjRoom = (roomName, Unlocked)
                  let newAdjRooms = adjRooms |> List.replaceByWith (fst >> String.toLower >> (=) roomName) newAdjRoom
                  room, (cRoom,newAdjRooms,oRooms)

              // Unlock the target room for all rooms attached to the target room.
              match RoomIO.readFromFile roomName with     // Worked first try!!!
              | Failure f -> printfn "%s" f
              | Success (loadedRoom,loadedRoomMap) ->
                  let (cRoom,adjRooms,oRooms) = loadedRoomMap
                  let otherRoomNames = adjRooms |> List.map fst |> List.filter ((<>) env.Room.Info.Name)
                  otherRoomNames |> List.iter (fun n ->   // Loop through all other rooms connected to the target room and change the lock state.
                      match RoomIO.readFromFile n with
                      | Failure f -> printfn "%s" f
                      | Success rInfo ->
                          let newRInfo = changeLockState roomName rInfo
                          RoomIO.writeToFile newRInfo)

              if env.Player.Items |> List.containsBy (function | Key (keyCode,_) when code = keyCode -> true | _ -> false) then
                  printfn "You unlocked %s" roomName
                  let (_,map) = changeLockState roomName (env.Room,env.Map)
                  Success ({env with Map = map}, AIMove)
              else
                  Failure (sprintf "The door could not be unlocked. You do not have a %O key" code)

  /// View player's status and inventory.
  let view arg env =
      match arg with
      | Inventory -> printfn "Items:"; env.Player.Items |> List.map Item.getNameWithType |> List.iter (printfn "%s"); Success (env, AIWait)
      | Time -> printfn "Time: %s" (env.Time |> Time.asString); Success (env, AIWait)
      | PersonStats personName ->
          match env |> Environment.tryFindPersonByNameLower personName with
          | None -> Failure (sprintf "%s is not a valid person in this room" personName)
          | Some person ->
              person |> Person.printStats
              Success (env, AIWait)
      | PlayerStats ->
          env.Player |> Player.printStats
          Success (env, AIWait)
      | CompanionName ->
          match env.Player.CompanionName with
          | None -> Failure ("You do not have a companion")
          | Some companionName -> printfn "Companion: %s" companionName; Success (env, AIWait)
      | Objectives ->
          env.Objectives |> List.map Objective.toString |> List.iter (printfn "%s"); Success (env, AIWait)
      | VisitedRooms ->
          env.VisitedRooms |> List.iter (printfn "%s"); Success (env, AIWait)
              

  /// Wait and allow the ai to take a turn.
  let wait env =
      printfn "You let the AI take a turn"
      Success (env, AIMove)
    
*/
}

