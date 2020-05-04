import { Option } from './option';
import { List } from './list';
import { Info } from './info';

export type Visibility = "vlow" | "vmedium" | "vhigh"
export type WeaponRange = "rshort" | "rmedium" | "rlong"

export type DoorCode = "blue" | "red" | "green" | "white" | "black"

export interface MeleeWeapon { kind: "MeleeWeapon"; damage: number; visibility: Visibility; koChance: Option.Option<number>; isPoisoned: boolean; }
export interface RangedWeapon { kind: "RangedWeapon"; damage: number; visibility: Visibility; ammoCount: number; }

export interface Weapon { kind: "Weapon"; weaponType: WeaponType; info: Info }
export interface Key { kind: "Key"; doorCode: DoorCode; info: Info }
export interface Clue { kind: "Clue"; info: Info; clueInfo: string }
export interface HiddenPassageway { kind: "HiddenPassageway"; info: Info; rooms: string[] }
export interface Consumable { kind: "Consumable"; isPoisoned: boolean; isAlcohol: boolean; healthBonus: number; remainingUses: number; info: Info }
export interface Container { kind: "Container"; items: Item[]; info: Info }
export interface Display { kind: "Display"; info: Info }
export interface Furniture { kind: "Furniture"; info: Info }
export interface LargeDisplay { kind: "LargeDisplay"; info: Info }
export interface EscapeItem { kind: "EscapeItem"; info: Info }
export interface Intel { kind: "Intel"; info: Info }
export interface Poison { kind: "Poison"; info: Info }

export type WeaponType = MeleeWeapon | RangedWeapon

export type Item = Weapon | Key | Clue | HiddenPassageway | Consumable | Container | Display | Furniture | LargeDisplay | EscapeItem | Intel | Poison

export namespace Init {
  export function initMeleeWeapon(name, description, damage, kOChance: Option.Option<number>, visibility: Visibility, isPoisoned: boolean) : Item {
    return { kind: "Weapon", weaponType: { kind: "MeleeWeapon", damage: damage, visibility: visibility, koChance: kOChance, isPoisoned: isPoisoned }, 
      info: new Info(name, description) };
  }
          
  export function initRangedWeapon(name, description, damage: number, visibility: Visibility, ammoCount: number) : Item {
    return { kind: "Weapon", weaponType: { kind: "RangedWeapon", damage: damage, visibility: visibility, ammoCount: ammoCount}, 
      info: new Info(name, description) };
  }
  
  export function initKey(name: string, description: string, code: DoorCode) : Item {
    return { kind: "Key", doorCode: code, info: new Info(name, description) };
  }
  
  export function initClue(name, description, clueInfo) : Item {
    return { kind: "Clue", info: new Info(name, description), clueInfo: clueInfo };
  }
  
  export function initHiddenPassageway(name, description, roomNames: string[]) : Item {
    return { kind: "HiddenPassageway", info: new Info(name, description), rooms: roomNames };
  }
  
  export function initConsumable(name, description, isAlcohol: boolean, healthBonus: number, uses: number) : Item {
    return { kind: "Consumable", info: new Info(name, description), isAlcohol: isAlcohol, healthBonus: healthBonus, remainingUses: uses, isPoisoned: false }
  }
  
  export function initContainer(name, description, items: Item[]) : Item {
    return { kind: "Container", info: new Info(name, description), items: items };
  }
  
  export function initDisplay(name, description) : Item {
    return { kind: "Display", info: new Info(name, description) };
  }
  
  export function initEscape(name, description) : Item {
    return { kind: "EscapeItem", info: new Info(name, description) };
  }
  
  export function initLargeDisplay(name, description) : Item {
    return { kind: "LargeDisplay", info: new Info(name, description) };
  }
      
  export function initFurniture(name, description) : Item {
    return { kind: "Furniture", info: new Info(name, description) };
  }
  
  export function initIntel(name, description) : Item {
    return { kind: "Intel", info: new Info(name, description) };
  }
  
  export function initPoison(name, description) : Item {
    return { kind: "Poison", info: new Info(name, description) };
  }
}



    
export function isClue(item) {
  return item.kind === "Clue";
}

export function getAmmoCount(item: Item) : Option.Option<number> {
  if (item.kind === "Weapon") {
    if (item.weaponType.kind === "RangedWeapon") {
      return ({ kind: "Some", value: item.weaponType.ammoCount });
    }
  }
  return { kind: "None" };
}

export function getWeaponDamage(item: Item) : number {
  if (item.kind === "Weapon")
    return item.weaponType.damage;
  else
    return 0;
}

export function getWeaponDamageWithUse(item: Item) : Option.Option<number> {
  if (item.kind === "Weapon") {
    if (item.weaponType.kind === "MeleeWeapon" || (item.weaponType.kind === "RangedWeapon" && item.weaponType.ammoCount > 0)) {
      return Option.makeSome(item.weaponType.damage);
    } else
      return Option.makeNone();
  }
}

// Return a string to display the item and its stats to the screen. Used when the 'search' command is run.
export function getNameWithType(item: Item) : string {
  switch (item.kind) {
    case "Weapon": 
      if (item.weaponType.kind === "MeleeWeapon") {
        let koString = item.weaponType.koChance.kind === "Some" ? ` KOC:1/${item.weaponType.koChance.value}` : "";
        let poisonString = item.weaponType.isPoisoned ? " Poisoned" : "";
        return `${item.info.name} - Melee Weapon V=${item.weaponType.visibility} D=${item.weaponType.damage}:` + koString + poisonString;
      } else {
        return `${item.info.name} - RangedWeapon V=${item.weaponType.visibility} A=${item.weaponType.ammoCount} D=${item.weaponType.damage}`;
      }
    case "Key": return `${item.info.name} - Key`;
    case "Clue": return `${item.info.name} - Clue`;
    case "Consumable": return `${item.info.name} - Consumable: ${item.isAlcohol ? " Alcholol" : ""} ${item.isPoisoned ? " Poisoned" : ""}`;
    case "HiddenPassageway": return `${item.info.name} - Display`;
    case "EscapeItem": return `${item.info.name} - Escape`;
    default: return item.info.name + " - " + item.kind + ":";
  }
}

export function itemToString(item: Item) : string {
  return getNameWithType(item);
}

export function isHeavy(item: Item) : boolean {
  switch (item.kind) {
    case "Container": 
    case "LargeDisplay":
    case "EscapeItem":
    case "Furniture":
      return true;
    default: return false;
  }
}

export function getItems(item: Item) : Option.Option<Item[]> {
  if (item.kind === "Container")
    return Option.makeSome(item.items);
  else
    return Option.makeNone();
}

export function removeItem(item: Item, target: Item) {
  if (item.kind === "Container") {
    item.items = List.removeOne((i: Item) => i.info.name.toLowerCase() === target.info.name.toLowerCase(), item.items);
  }
}