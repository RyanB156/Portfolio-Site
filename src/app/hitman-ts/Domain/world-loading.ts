import { Room, RoomMap } from './room';
import { Result } from './result';
import { Environment } from './environment';
import { saveAs } from 'file-saver';
import { JsonParser } from './json-parser';


export class WorldLoading {

  private static data;
  private static isReady: boolean;

  // TODO: Add json object to store all rooms and maps. Read json object and return the room and room map on read. Write to the json object on write.

  /*
    WorldLoading will maintain an object that holds all rooms in the map. Writing a room updates the room entry and reading a room retrieves a room entry.
    Writing env saves env to an object that holds the env.
    Load game -> read big file that contains env and all rooms in map -> separate into env (return to start of game) and store env and room map.
  */


  public static setRoomData(roomData: [Room, RoomMap][]) : void {
    // Create a dictionary of roomName -> [Room, RoomMap] to allow efficient storage and retrieval of rooms and their maps.

    let mappedData = {};
    roomData.forEach((pair: [Room, RoomMap]) => {
      mappedData[pair[0].getName().toLowerCase()] = pair;
    });

    WorldLoading.data = { environment: WorldLoading.data?.environment, roomData: mappedData };

  }

  // Write the save data to a file.
  public static save(env) {
    let data = WorldLoading.data;
    data.environment = env;
    var blob = new Blob([JSON.stringify(WorldLoading.data)], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "save.json");
  }

  public static getIsReady() : boolean { return WorldLoading.isReady; }

  public static startLoad() {
    WorldLoading.isReady = false;
  }

  public static load(json: string) {

    let [environment, roomData] = JsonParser.parseJSON(json);

    WorldLoading.data = { environment: environment, roomData: roomData };

    WorldLoading.isReady = true;
  }

  // Fetch the room using the specified room name.
  public static readRoom(roomName: string) : Result.Result<[Room, RoomMap]> {
    let readResult = WorldLoading.data.roomData[roomName.toLowerCase()];
    if (readResult === undefined)
      return Result.makeFailure(`Error reading room '${roomName}`);
    else
      return Result.makeSuccess(readResult);
  }

  public static writeRoom(room: Room, map: RoomMap) : void {
    WorldLoading.data.roomData[room.getName()] = [room, map];
    WorldLoading.data.roomData[room.getName().toLowerCase()] = [room, map];
  }

  public static readEnv() : Result.Result<Environment> {
    let envResult = WorldLoading.data.environment;
    if (envResult === undefined)
      return Result.makeFailure("Error reading environment");
    else
      return Result.makeSuccess(WorldLoading.data.environment);
  }

  public static writeEnv(env: Environment) {
    WorldLoading.data.environment = env;
  }

}