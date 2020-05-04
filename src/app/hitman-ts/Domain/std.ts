
/*
  Used to provide a global buffer to get the standard output workflow from console programs, but is sent to the CmdComponent instead of a normal command line interface.
*/
export class Std {

  private static outputBuffer: string[] = [];

  public static writeLine(message) { Std.outputBuffer.push(message); }

  public static readLine() { 
    if (Std.outputBuffer.length > 0)
      return Std.outputBuffer.shift();
    else
      return "";
  }

  public static hasOutputData() {
    return Std.outputBuffer.length > 0;
  }
}