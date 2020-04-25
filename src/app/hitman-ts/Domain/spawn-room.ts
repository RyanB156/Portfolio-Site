
import { RoomTypes, RoomConnect, Room, RoomMap, LockState, AdjacentRoom,  } from './room';
import { DoorCode } from './item';
import { List } from './list';

export interface SpawnRoom { kind: "SpawnRoom"; type: RoomTypes.SpawnRoomType; connections: number; maxConnections: number}

export namespace SpawnRoom {

  let outsideRooms: RoomTypes.SpawnRoomType[] = [ { kind: "Spawn" }, { kind: "Patio" }, { kind: "Garden"}, { kind: "Garage" }];
  let bathroomLockChance = 0.25
  let stairsLockChance = 0.10
  let commonRoomLockChance = 0.10
  let closetLockChance = 0.10
  
  // export interface SpawnRoom { kind: "SpawnRoom"; type: RoomTypes.SpawnRoomType; connections: number; maxConnections: number}
  export function initSpawnRoom(roomType, connectionF) : SpawnRoom {
    return { kind: "SpawnRoom", type:roomType, connections: 0, maxConnections: connectionF(roomType) };
  }

  
  export function initRoomConnect(room, map, spawnRoom) : RoomConnect {
    return { kind: "RoomConnect", room: room, roomMap: map, spawnRoom: spawnRoom };
  }
   
  export function roomConnectToRoomInfo(room: RoomConnect) : [Room, RoomMap] { 
    return [ room.room, room.roomMap ];
  }

  export function isCloset(rc: RoomConnect) {
    return rc.spawnRoom.type.kind === "Closet";
  }
    
  export function isMissionRoom(rc: RoomConnect) {
    return rc.spawnRoom.type.kind === "MissionRoom";
  }

  // Checks if a room has reached its maximum number of connections.
  export function isMaxxedOut(rc: RoomConnect) {
    return rc.spawnRoom.connections >= rc.spawnRoom.maxConnections;
  }
    
  // Lock doors with a specific color key.
  export function getLockState(roomType: RoomTypes.SpawnRoomType) : LockState {
    function inner(choices: DoorCode[], chance: number) : LockState {
      if (Math.random() < chance)
        return { kind: "Locked", code: List.randomChoice(choices) }
      else
        return { kind: "Unlocked" };
    }


    switch(roomType.kind) {
      case "Spawn": case "Patio": case "Garden": 
        return { kind: "Unlocked" };
      case "Garage": case "Storage":
        return { kind: "Locked", code: "blue" };
      case "Bathroom":
        return inner(["white", "green"], bathroomLockChance);
      case "Stairs": 
        return inner(["white", "green", "blue"], stairsLockChance);
      case "CommonRoom":
        return inner(["white", "green", "blue"], commonRoomLockChance);
      case "EntranceWay": case "Hallway":
        return { kind: "Locked", code: "red" };
      case "PrivateRoom":
        return { kind: "Locked", code: "green" };
      case "Closet":
        return inner(["white", "green", "blue", "red"], closetLockChance);
      default:
        return { kind: "Locked", code: "black" };
    }
  }

  export function remaining(room) { room.spawnRoom.maxConnections - room.spawnRoom.connections; }

  export function areConnected(roomA: RoomConnect, roomB: RoomConnect) {
    let adjRooms = roomA.roomMap.adjacentRooms;
    let option = List.tryFind((r: AdjacentRoom) => roomB.room.getInfo.name === r.name, adjRooms);
    return option.kind === "Some";
  }

  // Connect two rooms by adding the other room to the adjacency list (for both rooms).
  export function connectRooms(roomA: RoomConnect, roomB: RoomConnect) {
    let aToBLockState = getLockState(roomB.spawnRoom.type)
    let bToALockState = getLockState(roomA.spawnRoom.type)

    let aAdjRooms = roomA.roomMap.adjacentRooms;
    aAdjRooms.push({ kind: "AdjacentRoom", name: roomB.room.getInfo().name, lockState: aToBLockState });
    roomA.spawnRoom.connections++;

    let bAdjRooms = roomB.roomMap.adjacentRooms;
    bAdjRooms.push({ kind: "AdjacentRoom", name: roomA.room.getInfo().name, lockState: bToALockState });
    roomB.spawnRoom.connections++;
  }
        
  export function connectRoomsWithLockState(roomA: RoomConnect, roomB: RoomConnect, aToBLockState: LockState, bToALockState: LockState) {
    let aAdjRooms = roomA.roomMap.adjacentRooms;
    aAdjRooms.push({ kind: "AdjacentRoom", name: roomB.room.getInfo().name, lockState: aToBLockState });
    roomA.spawnRoom.connections++;

    let bAdjRooms = roomB.roomMap.adjacentRooms;
    bAdjRooms.push({ kind: "AdjacentRoom", name: roomA.room.getInfo().name, lockState: bToALockState });
    roomB.spawnRoom.connections++;
  }

  // Filter out duplicated connections that may occur between closets and missionrooms when they are generated adjacent in the list and forced to connect.
  export function tryFilterClosetConnections(rCs: RoomConnect[]) {
    rCs.forEach((rC: RoomConnect) => {
      if ((rC.spawnRoom.type.kind === "Closet" && rC.spawnRoom.type.hasSecret) || rC.spawnRoom.type.kind === "MissionRoom")
        rC.roomMap.adjacentRooms = List.distinctBy((a) => a.name, rC.roomMap.adjacentRooms);
    });
  }

}