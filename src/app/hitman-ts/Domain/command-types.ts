import { Option } from "./option"


export namespace CommandTypes {

  export type OptionArg = Option.Option<string>;
  export type ViewArg = "Inventory" | "Time" | "PlayerStats" | "PersonStats of PersonName" | "CompanionName" | "Objectives" | "VisitedRooms"

  export interface SearchArea { kind: "SearchArea" }
  export interface SearchItem { kind: "SearchItem", itemName: string}
  export type SearchArg = SearchArea | SearchItem

  export interface DescribeArea { kind: "DescribeArea" }
  export interface DescribeItem { kind: "DescribeItem", itemName: string }
  export interface DescribePerson { kind: "DescribePerson", personName: string }
  export type DescribeArg = DescribeArea | DescribeItem | DescribePerson


  export interface AIAttack { kind: "AIAttack", personName: string }
  export interface AIGoto { kind: "AIGoto", roomName: string }
  export interface AIPickup { kind: "AIPickup", itemName: string }
  export interface AIStop { kind: "AIStop" }
  export interface AISuicide { kind: "AISuicide" }
  export type AICommand = AIAttack | AIGoto | AIPickup | AIStop | AISuicide


  export interface Amuse { kind: "Amuse", personName: string }
  export interface Apply { kind: "Apply", itemName: string }
  export interface Approach { kind: "Approach", personName: string }
  export interface Attack { kind: "Attack", personName: string }
  export interface Capture { kind: "Capture", personName: string }
  export interface CheerUp { kind: "CheerUp", personName: string }
  export interface ChokeOut { kind: "ChokeOut", personName: string }
  export interface Command { kind: "Command", personName: string, command: AICommand }
  export interface Compliment { kind: "Compliment", personName: string }
  export interface Consume { kind: "Consume", itemName: string }
  export interface Diagnose { kind: "Diagnose" }
  export interface Describe { kind: "Describe", arg: DescribeArg }
  export interface Disguise { kind: "Disguise", personName: string }
  export interface Dishearten { kind: "Dishearten", personName: string }
  export interface Drop { kind: "Drop", itemName: string }
  export interface Escape { kind: "Escape", itemName: string }
  export interface Equip { kind: "Equip", itemName: string } 
  export interface FollowMe { kind: "FollowMe", personName: string }
  export interface Give { kind: "Give", itemName: string, personName: string }
  export interface Goto { kind: "Goto", gotoArg: OptionArg }
  export interface GotoForce { kind: "GotoForce", roomName: string }
  export interface Help { kind: "Help", helpArg: OptionArg }
  export interface Inquire { kind: "Inquire", question: string, personName: string }
  export interface Inspect { kind: "Inspect", itemName: string }
  export interface Intimidate { kind: "Intimidate", personName: string }
  export interface LeaveMe { kind: "LeaveMe" }
  export interface Peek { kind: "Peek", roomName: string }
  export interface Pickup { kind: "Pickup", itemName: string }
  export interface Place { kind: "Place", containerName: string, itemName: string } // place an item in a Container or other item with storage.
  export interface Punch { kind: "Punch", personName: string }
  export interface Quit { kind: "Quit" }
  export interface Romance { kind: "Romance", personName: string }
  export interface Save { kind: "Save" }
  export interface Scout { kind: "Scout", roomName: string }
  export interface Search { kind: "Search", searchArg:  SearchArg }
  export interface Seduce { kind: "Seduce", personName: string }
  export interface Survey { kind: "Survey"}
  export interface TakeFrom { kind: "TakeFrom", itemName: string, personName: string }
  export interface Talk { kind: "Talk", personName: string }
  export interface Teleport { kind: "Teleport", roomName: string }
  export interface Unequip { kind: "Unequip" }
  export interface Unlock { kind: "Unlock", roomName: string }
  export interface View { kind: "View", viewArg: ViewArg }
  export interface Wait { kind: "Wait" }


  export type CommandType = 
      | Amuse
      | Apply
      | Approach
      | Attack
      | Capture
      | CheerUp
      | ChokeOut
      | Command
      | Compliment
      | Consume
      | Diagnose
      | Describe
      | Disguise
      | Dishearten
      | Drop
      | Escape
      | Equip
      | FollowMe
      | Give
      | Goto
      | GotoForce
      | Help
      | Inquire
      | Inspect
      | Intimidate
      | LeaveMe
      | Peek
      | Pickup
      | Place
      | Punch
      | Quit
      | Romance
      | Save
      | Scout
      | Search
      | Seduce
      | Survey
      | TakeFrom
      | Talk
      | Teleport
      | Unequip
      | Unlock
      | View
      | Wait

}