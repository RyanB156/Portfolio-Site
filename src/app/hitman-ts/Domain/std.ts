import { Room, RoomMap } from './room';
import { Result } from './result';



/*
  Used to provide a global buffer to get the standard output workflow from console programs, but is sent to the CmdComponent instead of a normal command line interface.
*/
export class Std {

  private static outputBuffer: string[] = [];


  public static writeLine(message) { this.outputBuffer.push(message); }

  public static readLine() { 
    if (this.outputBuffer.length > 0)
      return this.outputBuffer.shift();
    else
      return "";
  }

  public static hasOutputData() {
    return this.outputBuffer.length > 0;
  }

  // TODO: Add json object to store all rooms and maps. Read json object and return the room and room map on read. Write to the json object on write.

  public static readRoom(roomName: string) : Result.Result<[Room, RoomMap]> {
    return null;
  }

  public static writeRoom(room: Room, map: RoomMap) {

  }

}