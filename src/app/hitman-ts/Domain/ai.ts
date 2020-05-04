
import { Person, AIAction, APickupItem, AICall } from './person';
import { Item, RangedWeapon } from './item';
import { List } from './list';
import { Environment } from './environment';
import { Target } from './person';
import { Std } from './std';
import { Option } from './option';
import { Result } from './result';
import { Room, AdjacentRoom } from './room';
import { RoomMap } from './room';
import { WorldLoading } from './world-loading';


export namespace AI {

  // The person attacks its target. First, find the person's weapon and use the weapon's damage. Then, apply the damage to the target.
  export function attack(ai: Person, target: Target, env: Environment) : void {
    
    let damage = Person.defaultDamage;

    if (ai.getIsHoldingWeapon()) {
      let result: Option.Option<Item> = List.tryFind((i: Item) => i.kind === "Weapon", ai.getItems());
      if (result.kind === "Some" && result.value.kind === "Weapon") {
        if (result.value.weaponType.kind === "MeleeWeapon") {
          damage = result.value.weaponType.damage;
        } else {
          let rangedWeapon: RangedWeapon = result.value.weaponType;
          // If the weapon will still have ammo left after firing, leave it in the inventory.
          if (rangedWeapon.ammoCount > 1) {
            result.value.weaponType.ammoCount--;
          } else { // Else remove the weapon.
            ai.removeFromInventory(result.value.info.name);
          }
          damage = rangedWeapon.damage;
        }
      } else {
        Std.writeLine("AI holding weapon failure " + ai.getName());
      }
    }

    // Apply damage to the ai's target.
    if (target.kind === "TPlayer") {
      Std.writeLine(`${ai.getType()} ${ai.getName()} attacked you for ${damage} damage`);
      env.getPlayer().applyDamage(damage);
      env.checkPlayer(); // Check the player's health, apply extra lives or set game status to DEAD.
      ai.setIsCommanded(false);

    } else if (target.kind === "TPerson") {
      let personResult: Option.Option<Person> = env.tryFindPersonByNameLower(target.name);
      if (personResult.kind === "Some") {
        Std.writeLine(`${ai.getType()} ${ai.getName()} attacked ${target.name} for ${damage} damage`);
        personResult.value.takeDamage(damage, Option.makeSome(10)); // HOPEFULLY THIS IS A REFERENCE THAT MODIFIES THE PERSON!!! FINGERS CROSSED!!!
        personResult.value.attackResponse({ kind: "TPerson", name: ai.getName() }); // Person responds to the ai attacking them.
        if (personResult.value.getState() === "Dead") {
          ai.setAwareness({ kind: "Aware" });
          env.checkPersonObjectives(personResult.value); // Check if the killed ai was a target objective.
        }
        ai.setIsCommanded(false);
      } else {
        Std.writeLine("Error: ai.attack TPerson with target " + target.name);
      }
    } else {
      Std.writeLine("AI targeting error for " + ai.getName());
    }
    
  }

  export function useFood(ai: Person, env: Environment) : void {
    let resultItem: Option.Option<Item> = List.tryFind((i: Item) => i.kind === "Consumable", ai.getItems());
    if (resultItem.kind === "None")
      Std.writeLine("AI consume food error for " + ai.getName());
    else {
      let food: Item = resultItem.value;
      if (food.kind === "Consumable") {
        Std.writeLine(`${ai.getName()} consumed some of ${food.info.name}`);
        Std.writeLine(`Health: ${ai.getHealth()}`);
        ai.addHealth(food.healthBonus); // Increase health by consuming something.
        if (food.isPoisoned)
          ai.setIsPoisoned(true);
        if (food.isAlcohol)
          ai.makeDrunk();
        // Use the consumable. Remove if the value is less than 1.
        food.remainingUses--;
        if (food.remainingUses <= 0) {
          Std.writeLine(`${food.info.name} was used up`);
          ai.removeFromInventory(food.info.name);
        }
        ai.setIsCommanded(false);
        
      } else { // AI cannot consume an item that is not a Consumable!
        Std.writeLine("AI consume food error for " + ai.getName());
      }
    }
  }

  export function goto(ai: Person, roomName: string, env: Environment) : void {
    
    let result: Result.Result<[Room, RoomMap]> = WorldLoading.readRoom(roomName);
    if (result.kind === "Failure")
      Std.writeLine("AI goto failure: " + result.value);
    else {
      ai.setIsCommanded(false);
      ai.setAction({ kind: "ANeutralAction" });
      let nextRoom: Room = result.value[0];
      let nextRoomMap: RoomMap = result.value[1];
      nextRoom.addPerson(ai);

      WorldLoading.writeRoom(nextRoom, nextRoomMap);

      Std.writeLine(`${ai.getName()} moved to ${nextRoom.getName()}`);
      env.getRoom().removePerson(ai);
      // Update the player's companion if necessary.
      let companionOption = env.getPlayer().getCompanion();
      if (companionOption.kind === "Some" && companionOption.value.toLowerCase() === ai.getName().toLowerCase()) {
        env.getPlayer().setCompanion(Option.makeNone());
      }


    }
  }

  export function tryWakeUp(ai: Person, env: Environment) : void {
    if (Math.random() < 0.10) {
      Std.writeLine(`${ai.getName()} regained consciousness`);
      ai.setState("SNormal");
    }
  }

  export function pickupItem(ai: Person, itemName: string, env: Environment) : void {
    let itemOption: Option.Option<Item> = env.getRoom().tryFindItemByName(itemName.toLowerCase());
    if (itemOption.kind === "None")
      Std.writeLine(`Internal Error: \"pickupItem\" for ${ai.getName()}. Cannot find item ${itemName}`);
    else {
      ai.setIsCommanded(false);
      Std.writeLine(`${ai.getName()} picked up ${itemName}`);
      env.getRoom().removeItem(itemOption.value);
      if (itemOption.value.kind === "Consumable") {
        if (!ai.getIsHoldingFood()) {
          ai.setIsHoldingFood(true);
          ai.addToInventory(itemOption.value);
        } else {
          Std.writeLine(`${ai.getName()} is already holding a consumable item`);
        }
      } else if (itemOption.value.kind === "Weapon") {
        if (!ai.getIsHoldingWeapon()) {
          ai.setIsHoldingWeapon(true);
          ai.addToInventory(itemOption.value);
        } else {
          Std.writeLine(`${ai.getName()} is already holding a weapon`);
        }
      } else {
        ai.addToInventory(itemOption.value);
      }
    }
  }

  export function commitSuicide(ai: Person, env: Environment) : void {
    Std.writeLine(`${ai.getName()} commited suicide`);
    ai.setState("Dead");
    ai.setHealth(0);
  }

  export function takeAction(env: Environment, ai: Person) {

    if (ai.getState() === "Dead")
      return;

    let action = ai.getAction();
    let actionKind = ai.getAction().kind;
    if (actionKind === "AAttack") {
      let target = null;
      let awareness = ai.getAwareness();
      if (awareness.kind === "Hostile") {
        target = awareness.target;
      } else {
        target = { kind: "NoTarget" };
      }
      attack(ai, target, env);
    } else if (actionKind === "AUseFood") {
      console.log(`${ai.getName()} using food`);
      useFood(ai, env);
    } else if (action.kind === "AGoto") {
      goto(ai, action.room, env);
    } else if (actionKind === "ATryWakeUp") {
      tryWakeUp(ai, env);
    } else if (action.kind === "APickupItem") {
      pickupItem(ai, action.item, env);
    } else if (actionKind === "ASuicide") {
      commitSuicide(ai, env);
    } 
  }

  export function decideAction(env: Environment, person: Person) : AIAction {
    if (!person.getIsCommanded()) {
      if (person.getAction().kind === "AGoto") {
        return person.getAction();
      } else {
        let state = person.getState();
        if (state === "Dead" || state === "Asleep" || state === "Unconscious") {

          // Remove the player's companion if the companion is incapacitated.
          let playerCompanionOption = env.getPlayer().getCompanion();
          if (playerCompanionOption.kind === "Some" && playerCompanionOption.value.toLowerCase() === person.getName().toLowerCase()) {
            Std.writeLine(`${person.getName()} is no longer your companion because they were incapacitated`);
            env.getPlayer().setCompanion(Option.makeNone());
          }

          if (state === "Unconscious")
            return { kind: "ATryWakeUp" };
          else
            return { kind: "ANeutralAction" };

        } else if (person.getHealth() <= 50 && person.getIsHoldingFood()) {
            return { kind: "AUseFood" };
        } else {
            let foodItemOption: Option.Option<Item> = List.tryFind((i: Item) => i.kind === "Consumable", env.getRoom().getItems());
            if (foodItemOption.kind === "Some") 
              return { kind: "APickupItem", item: foodItemOption.value.info.name };
            else {
              if (person.getAwareness().kind === "Hostile") {
                return { kind: "AAttack" };
              }
              else {
                return { kind: "ANeutralAction" };
              }
            }
          } // End Pickup check.
        } // End state check.
      }
    else {
      return person.getAction();
    }
  }
  
  
    export function aiAction(env: Environment, callType: AICall) {
      
      function aiMove(env: Environment, person: Person) {
  
        console.log(`Making ${person.getName()} move`);

        person.tryApplyPoisonDamage();
        // Dead people cannot take actions.
        if (person.getState() === "Dead") {
          env.checkPersonObjectives(person);
          return;
        }

        if (!person.getIsCommanded()) {
          let action: AIAction = decideAction(env, person);
          person.setAction(action);
        }

        takeAction(env, person); // Have the AI carry out its option.
          
      }
  
      function updateAwareness(alertPerson: Target, person: Person) {
        if (person.getState() === "SNormal") {
          let awareness = null;
          if (person.getType() === "Guard" || person.getBravery() === "BBrave") {
            awareness = { kind: "Hostile", target: alertPerson };
          }
          else if (person.getBravery() === "BFearful") {
            awareness = { kind: "Afraid"};
            person.addFear({ kind: "Up", value: 1} );
          } else {
            awareness = { kind: "Aware" };
          }
          if (person.getAwareness() !== awareness) {
            person.setAwareness(awareness);
            Std.writeLine(`${person.getName()} is ${person.getAwarenessAsString()}`);
          }
        }
      }
  
      function aiAlert(alertPerson: Target, env: Environment, person: Person) {
        
        // Cannot alert a dead person.
        if (person.getState() === "Dead")
          return;
  
        // Wake up sleeping people.
        if (person.getState() === "Asleep")
          person.setState("SNormal");

        updateAwareness(alertPerson, person);
        // Remove the player's disguise because they were detected.
        if (alertPerson.kind === "TPlayer" && env.getPlayer().getDisguise().kind === "Some")
          env.getPlayer().setDisguise(Option.makeNone());
      }
  
      function aiAlertAdjacentRooms(alertPerson: Target, env: Environment) {
  
        // Search all adjacent rooms.
        env.getMap().adjacentRooms.forEach((ar: AdjacentRoom) => {
          let readResult = WorldLoading.readRoom(ar.name); // Read all adjacent rooms to alert the people inside.
          if (readResult.kind === "Failure")
            Std.writeLine(readResult.value);
          else {
            let loadedRoom: Room = readResult.value[0];
            let loadedRoomMap: RoomMap = readResult.value[1];
            // Only show the name of the room if there are new people to alert.
            if (List.countBy((p: Person) => p.getAwareness().kind === "Unaware" || p.getAwareness().kind === "Warn", loadedRoom.getPeople()) > 0)
              Std.writeLine(`-${loadedRoom.getName()}:`);
            // Update the awareness of all people in the adjacent room.
            loadedRoom.getPeople().forEach((p: Person) => {
              updateAwareness(alertPerson, p);
            });
            WorldLoading.writeRoom(loadedRoom, loadedRoomMap);
          }
        })
      }
  
    // Decide which actions to apply based on the call type.

    console.log("Received AICall " + JSON.stringify(callType));
  
    if (callType.kind === "AIMove") { // Move the ai without alerting.
      env.getRoom().getPeople().forEach((p: Person) => aiMove(env, p));
    } else if (callType.kind === "AIAlert" || callType.kind === "AIAlertAll") { // Move the ai and alert the ones in the room and optionally all in the adjacent rooms.
      env.getRoom().getPeople().forEach((p: Person) => {
        aiAlert(callType.target, env, p);
        aiMove(env, p);
      });
      if (callType.kind === "AIAlertAll")
        aiAlertAdjacentRooms(callType.target, env);
    }
  
  }

  }