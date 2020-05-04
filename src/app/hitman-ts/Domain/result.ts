import { Person } from './person';
import { Std } from './std';

export namespace Result {
  export interface Success<T> {
    kind: "Success";
    value: T;
  }
  
  export interface Failure {
    kind: "Failure";
    value: string;
  }
  
  export type Result<T> = Success<T> | Failure
  
  export function makeSuccess<T>(value: T) : Success<T> {
    return { kind: "Success", value: value };
  }
  
  export function makeFailure(msg: string) : Failure {
    return { kind: "Failure", value: msg };
  }


  // Error finding the specified person in the room.
  export function personFindFailure(personName) : Failure {
    return { kind: "Failure", value: `${personName} is not a valid person in this location` };
  }

  // Error finding the specified item in the player's inventory.
  export function inventoryItemFindFailure(itemName) : Failure{
    return { kind: "Failure", value: `The item ${itemName} is not in your inventory` };
  }

  // Error finding the specified item or the specified item in the player's inventory is poisoned.
  export function inventoryConsumableFindFailure(itemName) : Failure {
    return { kind: "Failure", value: `The item ${itemName} is not in your inventory or is poisoned` };
  }

  // Error finding the specified item in the room.
  export function roomItemFindFailure(itemName, roomName) : Failure {
    return { kind: "Failure", value: `The item ${itemName} does not exist in ${roomName}` };
  }

  // Error finding the specified room in the room map.
  export function roomFindFailure (roomName) : Failure {
    return { kind: "Failure", value: `${roomName} is not a nearby location` };
  }

  // Create failure based on trying to adjust a person's mood/trust/attraction.
  export function printPersonalityAdjFailureStr (person:Person, failure: Failure) {
    return `${person.getName()}'s ${failure.value}`;
  }  

}

