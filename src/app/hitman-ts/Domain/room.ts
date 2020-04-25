import { Person } from './person';
import { Info } from './domain-types';
import { Item, DoorCode } from './item';
import { Option } from './option';
import { List } from './list';
import { SpawnRoom } from './spawn-room';


export namespace RoomTypes {
  export interface Closet { kind: "Closet"; hasSecret: boolean }
  export interface Spawn { kind: "Spawn" }
  export interface Patio { kind: "Patio" }
  export interface Garden { kind: "Garden" }
  export interface Garage { kind: "Garage" }
  export interface Storage { kind: "Storage" }
  export interface Bathroom { kind: "Bathroom" }
  export interface Stairs { kind: "Stairs" }
  export interface Hallway { kind: "Hallway" }
  export interface CommonRoom { kind: "CommonRoom" }
  export interface EntranceWay { kind: "EntranceWay" }
  export interface PrivateRoom { kind: "PrivateRoom" }
  export interface MissionRoom { kind: "MissionRoom" }
  export type SpawnRoomType =
    // Outside 1-4 connections, Always unlocked.
    | Spawn // Spawn location where the player starts the game.
    | Patio // People outside, large numbers.
    | Garden // Fewer people, find items.
    | Garage // Can hold escape vehicles, add new roomType data to each room for missions and global ai actions...
    | Storage // More weapons than other rooms. Guard inside.
    // Inside
    | Bathroom // 1-2 connections.
    | Stairs // 4-6 connections.
    | Hallway // 3-6 connections.
    | CommonRoom // 2-3 connections.
    | EntranceWay // 4 connections, can expand to accomodate extra rooms.
    | PrivateRoom // 1-2 connections, closet, maybe a bathroom.
    | Closet // 1 connection, maybe secret connection to mission room or other closets.
    | MissionRoom // Black key, 2 locked connections max, 1 secret access unlocked.
}

export interface AdjacentRoom { kind: "AdjacentRoom"; name: string; lockState: LockState }
export interface OverlookRooms { kind: "OverlookRooms"; rooms: Option.Option<string[]> }

export interface RoomMap { kind: "RoomMap"; currentRoom: string; adjacentRooms: AdjacentRoom[]; overlookRooms: OverlookRooms[]}
export interface RoomConnect { kind: "RoomConnect"; room: Room; roomMap: RoomMap; spawnRoom: SpawnRoom}

export interface RoomInfo { kind: "RoomInfo"; room: Room; roomMap: RoomMap }

export interface Locked { kind: "Locked"; code: DoorCode }
export interface Secret { kind: "Secret" }
export interface Unlocked { kind: "Unlocked" }
export type LockState = Unlocked | Secret | Locked


export class Room {
  private people: Person[];
  private info: Info;
  private items: Item[];
  private roomType: RoomTypes.SpawnRoomType;

  constructor(people: Person[], info: Info, items: Item[], roomType: RoomTypes.SpawnRoomType) {
    this.people = people;
    this.info = info;
    this.items = items;
    this.roomType = roomType;
  }

  static getRoomStateStr(room: AdjacentRoom) {
    if (room.lockState.kind === "Locked")
      return `${room.name} Locked: ${room.lockState.code} key required`;
    else
      return room.name;
  }

  getPeople() { return this.people; }
  getInfo() { return this.info; }
  getName() { return this.info.name; }
  getDescription() { return this.info.description; }
  getRoomType() { return this.roomType; }
  getItems() { return this.items; }

  setItems(items) { this.items = items; }

  updateItems(f: (i: Item) => Item) {
    this.items = List.map(f, this.items);
  } 

  // Finds the item in the room by checking its name in lower case.
  tryFindItemByName(itemName) : Option.Option<Item> {
    return List.tryFind((i: Item) => i.info.name.toLowerCase() === itemName, this.items);
  }

  // Finds the person in the room by checking his/her name in lower case.
  tryFindPersonByName(personName) : Option.Option<Person> {
    return List.tryFind((p: Person) => p.getName().toLowerCase() === personName, this.people);
  }

  // Update all people in a room using the specified function.
  mapPeople(f: (p: Person) => Person) {
    this.people = List.map(f, this.people);
  }

  // Update the person with the specified name.
  updatePerson(newPerson) {
    this.people = List.map((p) => p.getName().toLowerCase() === newPerson.getName().toLowerCase() ? newPerson : p, this.people);
  }

  addPerson(person: Person) {
    this.people.push(person);
  }

  addPeople(people: Person[]) {
    people.forEach((p) => this.people.push(p));
  }

  removePerson(person: Person) {
    this.people = List.removeOne((p: Person) => p.getName().toLowerCase() === person.getName().toLowerCase(), this.people);
  }

}


