import { Person } from './person';
import { Item, DoorCode, itemToString } from './item';
import { Option } from './option';
import { List } from './list';
import { SpawnRoom } from './spawn-room';
import { Info } from './info';


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
export function adjacentRoomToString(room: AdjacentRoom) : string {
  return `adjacentRoom: { name: ${room.name}, lockState: ${lockStateToString(room.lockState)} }`;
}
export interface OverlookRooms { kind: "OverlookRooms"; rooms: Option.Option<string[]> }

export interface RoomMap { kind: "RoomMap"; currentRoom: string; adjacentRooms: AdjacentRoom[]; overlookRooms: OverlookRooms }
export interface RoomConnect { kind: "RoomConnect"; room: Room; roomMap: RoomMap; spawnRoom: SpawnRoom }

export function roomMapToString(map: RoomMap) : string {
  function overlookRoomString() {
    if (map.overlookRooms.rooms.kind === "None")
      return "";
    else
      return List.fold((s: string, t: string) => s + " " + t, "", map.overlookRooms.rooms.value);
  }
  return `roomMap: { currentRoom: ${map.currentRoom}, adjacentRooms: ${List.fold((s, r: AdjacentRoom) => s + " " + adjacentRoomToString(r), "", map.adjacentRooms)}, ` +
  `overlookRooms: ${overlookRoomString()}`;
}

export interface RoomInfo { kind: "RoomInfo"; room: Room; roomMap: RoomMap }

export interface Locked { kind: "Locked"; code: DoorCode }
export interface Secret { kind: "Secret" }
export interface Unlocked { kind: "Unlocked" }
export type LockState = Unlocked | Secret | Locked

export function lockStateToString(lockState: LockState) : string {
  if (lockState.kind === "Locked")
    return "Locked " + lockState.code;
  else
    return lockState.kind;
}


export class Room {
  private info: Info;
  private roomType: RoomTypes.SpawnRoomType;
  private people: Person[];
  private items: Item[];

  constructor(info: Info, roomType: RoomTypes.SpawnRoomType, people: Person[], items: Item[]) {
    this.info = info;
    this.roomType = roomType;
    this.people = people;
    this.items = items;
  }

  toString() : string {
    return `people: { ${List.arrayToString((p: Person) => p.toString(), this.people)}, name: ${this.info.name}, description: ${this.info.description}, ` +
    `items: { ${List.arrayToString((i: Item) => itemToString(i), this.items)} }, roomType: ${this.roomType.kind}`;
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

  removeItem(item: Item) {
    console.log("Removing " + item.info.name + " from the room " + this.info.name);
    this.items = List.removeOne((i: Item) => i.info.name.toLowerCase() === item.info.name.toLowerCase(), this.items);
  }

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


