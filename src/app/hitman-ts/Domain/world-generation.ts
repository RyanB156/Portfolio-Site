import { Environment } from './environment';
import { Room, RoomMap, RoomConnect, AdjacentRoom, RoomTypes } from './room';
import { List } from './list';
import { Random } from './random';
import { RoomData } from './room-data';
import { SpawnRoom } from './spawn-room';
import { Option } from './option';
import { Item, Init, HiddenPassageway, Clue, Weapon, WeaponType } from './item';
import { ItemData } from './item-data';
import { Person } from './person';
import { Objective } from './objective';

export namespace WorldGeneration {

  export interface SaveData {
    environment: Environment,
    roomData: Object
  }

  let secretClosetChance = 0.20

  // Check that all rooms are connected. May work, needs more testing.
  function validateRoomConnectList(roomConnects: RoomConnect[]) : boolean {
    
    // Return the list of adjacent rooms from the specified map.
    let adjRoomNames = (roomMap: RoomMap) => List.map((a: AdjacentRoom) => a.name, roomMap.adjacentRooms);

    let map = List.map((rc: RoomConnect) => rc.roomMap, roomConnects);
    let acc: RoomMap[] = [map[0]]
    let list: RoomMap[] = [map[map.length - 1]]
    let visited: RoomMap[] = [];

    while (list.length > 0) {
      let x = list.shift();
      // If the current room is connected to by at least one room in acc, then add the current room x to acc.
      if (List.countBy((rM: RoomMap) => adjRoomNames(rM).includes(x.currentRoom), acc) >= 1) {
        acc.unshift(x);
      } else {
        if (visited.includes(x)) { // If x already visited and all other rooms have been processed, then fail.
          console.log("validateRoomConnectList Failed: " + JSON.stringify(x));
          return false;
        } else { // Else move x to the end of the list and mark it as visited.
          list.push(x);
          visited.unshift(x);
        }
      }
    }


    return true;
  }


  function activateClosetChance(roomType: RoomTypes.SpawnRoomType) {
    if (roomType.kind === "Closet" && !roomType.hasSecret)
      roomType.hasSecret = Random.nextInt(0, 2) === 0;
    return roomType;
  }

      
  // Default rooms. Every setup has each of these.
  let roomSpawnBase: RoomTypes.SpawnRoomType[] = [ 
    { kind: "Spawn" }, 
    { kind: "Patio" }, 
    { kind: "Garden" }, 
    { kind: "Garage" }, 
    { kind: "Bathroom" }, 
    { kind: "Stairs" }, 
    { kind: "Hallway" }, 
    { kind: "CommonRoom" }, 
    { kind: "EntranceWay" }, 
    { kind: "PrivateRoom" }, 
    { kind: "Closet", hasSecret: true }, 
    { kind: "MissionRoom" } 
  ];

  let roomSpawnBaseCount = 12


  function getRoomSpawnData(roomCount: number) : RoomConnect[] {
    
    let randomCount = 0;
    if (roomCount > roomSpawnBaseCount) {
      randomCount = roomCount - roomSpawnBaseCount; // Find out how many random rooms to add
    }
    roomCount = Math.max(roomSpawnBaseCount, roomCount); // Always add 'roomSpawnBaseCount' rooms or more
        
    let roomTypes: RoomTypes.SpawnRoomType[] = [];

    // Create a list of room types. Add 10 to make up for elements that are removed by the distinct function.
    for (let i = 0; i < randomCount + 10; i++) {
      let roomType = List.randomChoice(RoomData.roomChanceWeights());
      roomTypes.push(roomType);
    }
    // Force a minimum amount of rooms.
    roomTypes = roomSpawnBase.concat(roomTypes);

    // Set names and descriptions for each room type and create a distinct list of them.
    let nameDescriptionPairs = List.map((t: RoomTypes.SpawnRoomType) => RoomData.spawnRoomNameDesc(t), roomTypes);
    nameDescriptionPairs = List.distinctBy((nDP) => nDP[0][0], nameDescriptionPairs);
    
    // Convert room name and description into the actual room and room map paired with the room type.
    let roomData = List.map(nDP => RoomData.getRoomFromRoomData(nDP), nameDescriptionPairs);

    // Activate closets in the map to set them as secret passageways.
    roomData = List.map(rD => [[rD[0][0], rD[0][1]], activateClosetChance(rD[1])], roomData);
    let spawnRooms: [[Room, RoomMap], SpawnRoom][] = List.map(rD => [[rD[0][0], rD[0][1]], SpawnRoom.initSpawnRoom(rD[1], RoomData.getConnectionLimit)], roomData);

    // Convert the tuple types into the equivalent RoomConnect types.
    let roomConnects: RoomConnect[] = List.map((sR: [[Room, RoomMap], SpawnRoom]) => { 
      return { kind: "RoomConnect", room: sR[0][0], roomMap: sR[0][1], spawnRoom: sR[1] }
      }, spawnRooms);

    return roomConnects.slice(0, roomCount - 1); // Take roomCount elements from the list.

  }


  // Hopefully this works... Fingers crossed...
  function connectRooms(roomList: RoomConnect[]) : RoomConnect[] {

    // Connect each room to the one next to it in the list.
    function firstPass(list: RoomConnect[]) : void {
      List.reduce((rCA: RoomConnect, rCB: RoomConnect) => {
        SpawnRoom.connectRooms(rCA, rCB);
        return rCB;
      }, list);
    }

    function finalPass(list: RoomConnect[]) : void {
      
      function findFreeRoom(room: RoomConnect, list: RoomConnect[]) : Option.Option<RoomConnect> {

        // Closets and MissionRooms will be connected later. Do not connect them here.
        if (room.spawnRoom.type.kind === "Closet") {
          list = list.filter((rC: RoomConnect) => rC.spawnRoom.type.kind !== "MissionRoom");
        } else if (room.spawnRoom.type.kind === "MissionRoom") {
          list = list.filter((rC: RoomConnect) => rC.spawnRoom.type.kind !== "Closet");
        }

        list = list.filter((rC: RoomConnect) => !SpawnRoom.areConnected(room, rC) && !SpawnRoom.isMaxedOut(rC));
        if (list.length === 0) {
          return Option.makeNone();
        } else if (list.length === 1) {
          return Option.makeSome(list[0]);
        } else {
          return Option.makeSome(List.randomChoice(list));
        }

      }

      let i = 0;
      while (i < list.length) {

        if (SpawnRoom.isMaxedOut(list[i])) { // Skip over the current room because it is done.
          i++;
        } else if (List.forAll(rC => SpawnRoom.areConnected(list[i], rC), list.slice(i + 1, list.length - 1))) { // Remove the room option if all other rooms are connected to it.
          i++; // Finish processing the current room.
        } else if (SpawnRoom.isMaxedOut(list[i])) {
          i++; // Finish processing the current room.
        } else {

          let freeRoomOpt = findFreeRoom(list[i], list.slice(i + 1, list.length - 1)); // Try to find a free room to connect the the first room in the list.
          if (freeRoomOpt.kind === "Some") {
            SpawnRoom.connectRooms(list[i], freeRoomOpt.value); // Connect the current room to the free room.
          }
          i++;
        }
      }
    }

    firstPass(roomList);
    finalPass(roomList);
    return roomList;

  }


  // Try to connect secret closets to mission rooms on the map.
  function tryLinkSecretCloset(rooms: RoomConnect[]) {

    function linkPassageways(mRoomNames: string[], closet: RoomConnect) {
      let passagewayResult = <Option.Option<HiddenPassageway>>List.tryFind((i: Item) => i.kind === "HiddenPassageway", closet.room.getItems());
      if (passagewayResult.kind === "None") { // The closet does not have an existing passageway -> add one.
        let passageway = <HiddenPassageway>ItemData.HiddenPassageway.getItem(); // Get a random passageway to add to the closet.
        passageway.rooms = mRoomNames;
        closet.room.getItems().push()
      } else { // The closet does have an existing passageway -> update it.
        passagewayResult.value.rooms = mRoomNames.concat(passagewayResult.value.rooms);
      }
    }

    function linkClosetToMissionRoom(closet, mRoom) { // closet -> mRoom = secret. mRoom -> closet = unlocked
      SpawnRoom.connectRoomsWithLockState(closet, mRoom, { kind: "Secret" }, { kind: "Unlocked" });
    }
    function linkMissionRoomToCloset(mRoom, closet) {
      SpawnRoom.connectRoomsWithLockState(closet, mRoom, { kind: "Secret" }, { kind: "Unlocked" }) ;
    }

    let secretClosets = rooms.filter((rC: RoomConnect) => rC.spawnRoom.type.kind === "Closet" && rC.spawnRoom.type.hasSecret);
    let missionRooms = rooms.filter((rC: RoomConnect) => rC.spawnRoom.type.kind === "MissionRoom");
    
    // Link closets and mission rooms.
    secretClosets.forEach(closetConnect => {
      missionRooms.forEach(missionConnect => {
        linkClosetToMissionRoom(closetConnect, missionConnect); // Connect every closet to every mission room.
        linkMissionRoomToCloset(missionConnect, closetConnect); // Connect every mission room to every closet.
      });
      linkPassageways(List.map(rC => rC.room.getName(), missionRooms), closetConnect); // Add passageways to every closet.
    });
  }

  // Find mission items (targets and intel) for use by the Environment object for the game. 
  function findMissionObjectives(roomConnects: RoomConnect[]) : Objective.Objective[] {
    function folder(rC: RoomConnect) {
      let intelList = rC.room.getItems().filter((i: Item) => i.kind === "Intel");
      let targetList = rC.room.getPeople().filter((p: Person) => p.getType() === "Target");
      let itemObjs = List.map((i: Item) => Objective.makeCollectIntel(false, i.info.name), intelList);
      let targetObjs = List.map((p: Person) => Objective.makeKill(false, p.getName(), "Alive"), targetList);
      return itemObjs.concat(targetObjs);
    }
    return List.fold((s, t) => folder(t).concat(s), [], roomConnects);
  }


  // Create clues with info about the objectives and their locations and put them in the appropriate rooms.
  function pairObjectivesWithClueRooms(objectives: Objective.Objective[], rooms: RoomConnect[]) {

    function getClue(name: string, infoString: string) {
      let clue = <Clue>ItemData.Clue.getItem();
      clue.clueInfo = name + ": " + infoString;
      return clue;
    }

    let i = 0;
    let forceClue = false;
    // Make clues for all objectives.
    while (i < objectives.length) {
      rooms.forEach(rC => {
        if (i >= objectives.length)
          return;

        if (ItemData.clueRoomTypes.includes(rC.spawnRoom.type + "")) { // Put clues in clue rooms first.
          let clue = getClue(objectives[i].name, Objective.getInfoStr(objectives[i]));
          rC.room.getItems().push(clue);
          i++;
        } else if (forceClue) { // Then put clues in any available rooms on subsequent passes.
          let clue = getClue(objectives[i].name, Objective.getInfoStr(objectives[i]));
          rC.room.getItems().push(clue);
          i++;
        }
        forceClue = true;
      });
    }
  }

  export function spawnRooms(roomCount) : [[Room, RoomMap][], Objective.Objective[]] {

    let roomInfo = getRoomSpawnData(roomCount);
    roomInfo = connectRooms(roomInfo);
    tryLinkSecretCloset(roomInfo);
    SpawnRoom.tryFilterClosetConnections(roomInfo);

    let objectives = findMissionObjectives(roomInfo);
    pairObjectivesWithClueRooms(objectives, roomInfo);
    let roomMapData = List.map(SpawnRoom.roomConnectToRoomInfo, roomInfo);

    return [roomMapData, objectives];
  }


}