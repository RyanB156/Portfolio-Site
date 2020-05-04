
export namespace Objective {

  export type TargetState = "Alive" | "Eliminated" | "Escaped"
  export interface Kill { kind: "Kill"; completed: boolean; name: string; targetState: TargetState }
  export interface CollectIntel { kind: "CollectIntel"; completed: boolean; name: string }
  export type Objective = Kill | CollectIntel

  export function makeKill(completed: boolean, name: string, targetState: TargetState) {
    return { kind: "Kill", completed: completed, name: name, targetState: targetState };
  }

  export function makeCollectIntel(completed: boolean, name: string) {
    return { kind: "CollectIntel", completed: completed, name: name };
  }


  export function getInfoStr(obj: Objective) {
    if (obj.kind === "Kill")
      return "Kill " + obj.name;
    else
      return "Intel " + obj.name;
  }
  
  export function isCompleted(obj: Objective) {
    return obj.completed;
  }

  export function toString(obj: Objective) : string {
    if (obj.kind === "Kill")
      return `Kill: ${obj.name} ${obj.targetState}`;
    else
      return `CollectIntel: ${obj.name} ${obj.completed ? " Completed" : ""}`;
  }

}

