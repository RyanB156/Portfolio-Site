import { RoomTypes, RoomMap, Room } from './room'
import { List } from './list';
import { Random } from './random';
import { Option } from './option';
import { PeopleData } from './people-data';
import { Info } from './domain-types';
import { ItemData } from './item-data';

export namespace RoomData {
  


  // Weight w 1-5 for each room type. Create a list where each type is repeated w times, then a random choice 
  // from the entire list will take each weight into account by simple probability.
  function roomChanceWeights() : RoomTypes.SpawnRoomType[] {
    let roomWeights: [RoomTypes.SpawnRoomType, number][] = [
      [ { kind: "Patio" } , 2],
      [{ kind: "Garden" }, 3], 
      [{ kind: "Garage" }, 2], 
      [{ kind: "Storage" }, 1],
      [{ kind: "Bathroom" }, 2],
      [{ kind: "Stairs" }, 2], 
      [{ kind: "Hallway" }, 3],
      [{ kind: "CommonRoom" }, 5],
      [{ kind: "EntranceWay" }, 2],
      [{ kind: "PrivateRoom" }, 2], 
      [{ kind: "Closet", hasSecret: false }, 2],
      [{ kind: "Closet", hasSecret: true }, 1],
      [{ kind: "MissionRoom" }, 1],
      ]

    let weights: RoomTypes.SpawnRoomType[] = [];
    roomWeights.forEach(w => List.transformWeights(w[1], w[0]).forEach(l => weights.push(l)));
    return weights;

  }
  
  function getConnectionLimit(roomType: RoomTypes.SpawnRoomType) : number {
    switch(roomType.kind) {
      // Outide
      case "Spawn": return Random.nextInt(2, 4) // 2-3 connections.
      case "Patio": case "Garden": case "Garage": case "Storage":  return Random.nextInt(3, 6) // Outside rooms have 3-5 connections.
      // Inside
      case "Bathroom": return Random.nextInt(2, 4) // 2-3 connections.
      case "Stairs": return Random.nextInt(4, 7) // 4-6 connections.
      case "Hallway": return Random.nextInt(3, 7) // 3-6 connections.
      case "CommonRoom": return Random.nextInt(2, 4) // 2-3 connections.
      case "EntranceWay": return 4
      case "PrivateRoom": return 2
      case "Closet": return 1 // 1 connection, maybe secret connection to mission room or other closets. Secret closets connected first.
      case "MissionRoom": return Random.nextInt(2, 4) // Black key, 1-2 locked connections max, 1 secret access unlocked.
    }
  }

  function initMap(currentRoom, adjacentRooms, overLookRooms: string[]) : RoomMap {
    let or: Option.Option<string[]> = overLookRooms.length > 0 ? Option.makeSome(overLookRooms) : Option.makeNone();
    return { kind: "RoomMap", currentRoom: currentRoom, adjacentRooms: adjacentRooms, overlookRooms: { kind: "OverlookRooms", rooms: or } };
  }



  export namespace Spawn {
    export let roomOptionsList = [["Spawn", "The Spawn Room"]]
  }

  export namespace Patio {
    export let roomOptionsList = [
      ["NorthPatio", "The North Patio"],
      ["SouthPatio", "The South Patio"],
      ["EastPatio", "The East Patio"],
      ["WestPatio", "The West Patio"],
      ["NortheastPatio", "The Northeast Patio"],
      ["SoutheastPatio", "The Southeast Patio"],
      ["SouthwestPatio", "The Southwest Patio"],
      ["NorthwestPatio", "The Northwest Patio"],
      ["DiningPatio", "The Dining Patio"],
      ]
    }

  export namespace Garage {
    export let roomOptionsList = [
      ["NorthGarage", "The North Garage"],
      ["SouthGarage", "The South Garage"],
      ["EastGarage", "The East Garage"],
      ["WestGarage", "The West Garage"],
      ["BlueGarage", "A Blue Garage"],
      ["GreenGarage", "A Green Garage"],
      ["HorseStable", "Fancy living quarters for horses"],
      ]
    }

  export namespace Garden {
    export let roomOptionsList = [
      ["NorthGarden", "The North Garden"],
      ["SouthGarden", "The South Garden"],
      ["EastGarden", "The East Garden"],
      ["WestGarden", "The West Garden"],
      ["FlowerGarden", "A garden full of brilliantly colored flowers"],
      ["HerGarden", "A garden full of rose bushes in full bloom"],
      ["GreenHouse", "A large glass structure. There are many tables covered with plants."],
      ]
    }

  export namespace Storage {
    export let roomOptionsList = [
      ["Workshop", "A workshop full of tools"],
      ["Workshed", "A shed for doing carpentry work"],
      ]
    }
      
  export namespace Bathroom {
    export let roomOptionsList = [
      ["LargeBathroom", "A Large Bathroom"],
      ["SonsBathroom", "The Sons Bathroom"],
      ["DaughterBathroom", "The Daughters Bathroom"],
      ["CenterBathroom", "The Central Bathroom"],
      ["UpperBathroom", "The Upper Bathroom"],
      ["NorthBathroom", "The North Bathroom"],
      ["SouthBathroom", "The South Bathroom"],
      ["EastBathroom", "The East Bathroom"],
      ["WestBathroom", "The West Bathroom"],
     ]
  }

  export namespace Stairs {
    export let roomOptionsList = [
      ["MainStairs", "The main staircase"],
      ["CentralStairs", "The central staircase"],
      ["ServiceStairs", "The service staircase"],

    ]
  }

  export namespace Hallway {
    export let roomOptionsList = [
      ["DiningHallway", "The dining hallway"],
      ["FamilyHallway", "The family hallway"],
      ["ServiceHallway", "The service hallway"],
      ["NorthHallway", "The North Hallway"],
      ["SouthHallway", "The South Hallway"],
      ["EastHallway", "The East Hallway"],
      ["WestHallway", "The West Hallway"],
      ]
    }

  export namespace CommonRoom {
    export let roomOptionsList = [
      ["LivingRoom", "The living room"],
      ["WhiteParlor", "A parlor. The walls are covered in a white decorative wallpaper"],
      ["GreenParlor", "A parlor. The walls are covered in a green decorative wallpaper"],
      ["Library", "A large library full of books"],
      ["DiningRoom", "A dining room"],
      ["DiningHall", "A large room for eating. The ceiling is very tall and decorated with paintings."],
      ["GreatHall", "A large hall"],
      ["GameRoom", "A hangout spot for playing games."],
      ["Cinema", "A room for watching movies. The back wall is lined with comfy chairs."],
      ["MusicRoom", "A room full of musical instruments. There is a small concert space in the center"],
      ["LargeKitchen", "A large kitchen with stations for several cooks"],
      ["SmallKitchen", "A quaint kitchen"],

    ]
  }

  export namespace EntranceWay {
    export let roomOptionsList = [
      ["NorthFoyer", "The north entrance to the house"],
      ["SouthFoyer", "The south entrance to the house"],
      ["EastFoyer", "The east entrance to the house"],
      ["WestFoyer", "The west entrance to the house"],
      ["GrandFoyer", "A large entrance to the house. The walls are lined with regal paintings of the family's ancestors."],

    ]
  }

  export namespace PrivateRoom {  //Family's individual rooms always have a bathroom attached.
    export let roomOptionsList = [
      ["ParentsRoom", "The parent's room"],
      ["SonsRoom", "The son's room"],
      ["DaughtersRoom", "The daughter's room"],
      ["Tower", "A secluded tower"],
      ["FathersStudy", "The father's study"],
      ["Observatory", "Windows all around give a great view of the forest and mountains nearby"],
      ["WineCellar", "A dark room underground for aging wine"],
      ["GuestBedroom", "A simple bedroom for anyone staying at the house"],
      ["GrandGuestBedroom", "A large bedroom for guests. There is a large bearskin rug in the center."],
    ]
  }

  export namespace Closet {
    export let roomOptionsList = [
      ["ParentsCloset", "The parent's closet"],
      ["SonsCloset", "The son's closet"],
      ["DaughtersCloset", "The daughter's closet"],
      ["ServiceCloset", "A closet for the servants"],
      ["SmallCloset", "A small closet for keeping odds and ends"],
      ["Pantry", "A small room for storing food"],

    ]
  }

  export namespace MissionRoom { // Spawn intel here.
    export let roomOptionsList = [
      ["TechLab", "A large room full of high tech machinery, gadgets, and computers"],
      ["Cellar", "A large cellar. Smuggled goods and people are stored here."],
      ["OperationsRoom", "The fathers room for planning illegal operations"],
      ["ControlRoom", "A room for controlling the house's security systems"],
    ]
  }
      
  // Use to prioritize Consumable items in certain rooms.
  let foodRooms = [
      "Pantry", "LargeKitchen", "WineCellar", "SmallKitchen", "DiningRoom", "DiningHall"
      ]

  // Generate all of the information for each room. Calls for the creation of all people and items to be put in a room.
  function spawnRoomNameDesc(spawnRoomType: RoomTypes.SpawnRoomType) : [[string, string], RoomTypes.SpawnRoomType] {
    function roomChoice() {
      switch (spawnRoomType.kind) {
        case "Spawn": return Spawn.roomOptionsList
        case "Patio": return Patio.roomOptionsList
        case "Garden": return Garden.roomOptionsList
        case "Garage": return Garage.roomOptionsList
        case "Storage": return Storage.roomOptionsList
        // Inside
        case "Bathroom": return Bathroom.roomOptionsList
        case "Stairs": return Stairs.roomOptionsList
        case "Hallway": return Hallway.roomOptionsList
        case "CommonRoom": return CommonRoom.roomOptionsList
        case "EntranceWay": return EntranceWay.roomOptionsList
        case "PrivateRoom": return PrivateRoom.roomOptionsList
        case "Closet": return Closet.roomOptionsList
        case "MissionRoom": return MissionRoom.roomOptionsList
      }
    }

    let [name, desc] = List.randomChoice(roomChoice());
    return [[name, desc], spawnRoomType];

  }

  // Create the room using the randomly chosen name and description plus randomly generated people and items by roomType.
  export function getRoomFromRoomData(roomInfo: [[string, string], RoomTypes.SpawnRoomType]) : [[Room, RoomMap], RoomTypes.SpawnRoomType] {
    let [[name, desc], roomType] = roomInfo;
    let people = PeopleData.spawnPeople(roomType);
    let info = new Info(name, desc);
    let prioritizeFood = foodRooms.includes(name);
    let items = ItemData.spawnItems(roomType, prioritizeFood);

    let room = new Room(people, info, items, roomType);
    return [[room, initMap(name, [], [])], roomType];
  }
  
}