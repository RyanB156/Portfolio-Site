import { Player } from './player'
import { Room, RoomMap, AdjacentRoom } from './room';
import { GameStatus, Accolades } from './domain-types';
import { Time } from './time';
import { Objective } from './objective';
import { Person, RespawnData } from './person';
import { Item } from './item';
import { List } from './list';
import { Std } from 'src/app/hitman-ts/Domain/std';


export class Environment {

  private player: Player;
  private room: Room;
  private roomMap: RoomMap;
  private time: Time;
  private gameStatus: GameStatus;
  private extraLives: RespawnData[];
  private updatePeople: Person[];
  private objectives: Objective.Objective[];
  private accolades: Accolades;
  private moveCount: number;
  private visitedRooms: string[];

  constructor(player, room, map, time, gameStatus, extraLives, updatePeople, objectives, accolades, moveCount, visitedRooms) {
    this.player = player;
    this.room = room;
    this.roomMap = map;
    this.time = time;
    this.gameStatus = gameStatus;
    this.extraLives = extraLives;
    this.updatePeople = updatePeople;
    this.objectives = objectives;
    this.accolades = accolades;
    this.moveCount = moveCount;
    this.visitedRooms = visitedRooms;
  }

  getPlayer() { return this.player; }
  getRoom() { return this.room; }
  getTime() { return this.time; }
  getMap() { return this.roomMap; }
  getObjectives() { return this.objectives; }
  getVisitedRooms() { return this.visitedRooms; }
  getAccolades() { return this.accolades; }
  getMoveCount() { return this.moveCount; }
  getStatus() { return this.gameStatus; }
  setStatus(status: GameStatus) { this.gameStatus = status; }

  getUpdatePeople() { return this.updatePeople; }
  setUpdatePeople(people) { this.updatePeople = people; }

  setRoom(room: Room) { this.room = room; }
  setMap(map: RoomMap) { this.roomMap = map; }
  
  // Update the player and check PlayerDead condition.
  checkPlayer() {
    if (this.player.getHealth() <= 0) {
      this.player.setHealth(0);
      if (this.extraLives.length > 0) {
        let nextLife = this.extraLives.shift();
        Std.writeLine(`You have been reincarnated as ${nextLife.name}, ${nextLife.gender}`);
        this.player.setHealth(100);
        this.player.setName(nextLife.name);
        this.player.setGender(nextLife.gender);
      }
      else
        this.gameStatus = "PlayerDead";  
    }
  }
  

  // Update a person in the room.
  updatePerson(newPerson: Person) {
    this.room.updatePerson(newPerson);
  }

  // Bad action from the player affects any people that are aware.
  applyBadActionToAll() {
    this.room.getPeople().forEach(p => {
      if (p.getAwareness().kind !== "Unaware" && p.getState() === "SNormal")
        p.badActionResponse();
    });
  }

  // Apply status effects to people that are no longer in the room. Only poison effects for right now.
  updatePeopleStatus() {
    this.updatePeople.forEach(p => { p.tryApplyPoisonDamage(); });
  }

  // Add a new life for the player.
  addLife(newLife: RespawnData) { this.extraLives.push(newLife); }

  // Update the room.
  updateRoom(newRoom) { this.room = newRoom; }
  
  // Find a person in the room.
  tryFindPersonByName(personName) { return this.room.tryFindPersonByName(personName); }

  tryFindPersonByNameLower(personName) { return this.tryFindPersonByName(personName.toLowerCase()); }

  // Find an item in the room.
  tryFindItemByName(itemName) { return this.room.tryFindItemByName(itemName); }

  addMove() { this.moveCount++; }
  addVisited(roomName) { 
    if (!this.visitedRooms.includes(roomName))
      this.visitedRooms.push(roomName);
  }

  // Updates the map to reveal hidden passageways. World Generation ensures that all connected secret rooms are in the passageway list, so reveal all of them.
  revealPassageways() {
    this.roomMap.adjacentRooms = List.map((d: AdjacentRoom) => {
      if (d.lockState.kind === "Secret") {
        d.lockState = { kind: "Unlocked" };
      }
      return d;
    }, this.roomMap.adjacentRooms);
  }

  // Check if the player has picked up a mission item (intel).
  checkItemObjectives(item: Item) {
    this.objectives = List.map((o: Objective.Objective) => {
      if (o.kind === "CollectIntel" && o.name === item.info.name) {
        Std.writeLine(`You completed an Objective: CollectIntel-${o.name}`);
        return { kind: "CollectIntel", completed: true, name: o.name };
      }
      else
        return o;
    }, this.objectives);
  }


  // Check if the player has eliminated a mission target (person).
  checkPersonObjectives(killedPerson: Person) {
    this.objectives = List.map((o: Objective.Objective) => {
      if (o.kind === "Kill" && o.name === killedPerson.getName()) {
        Std.writeLine(`You completed an Objective: Kill-${o.name}`);
        return { kind: "Kill", completed: true, name: o.name, targetState: "Eliminated" };
      }
      else
        return o;
    }, this.objectives);
  }

}

