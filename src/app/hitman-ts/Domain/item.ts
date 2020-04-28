
import { Info } from './domain-types';
import { Option } from './option';
import { List } from './list';

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
  export function initMeleeWeapon(damage, kOChance, visibility, name, description) : Item {
    return { kind: "Weapon", weaponType: { kind: "MeleeWeapon", damage: damage, visibility: visibility, koChance: kOChance, isPoisoned: false }, info: new Info(name, description) };
  }
          
  export function initRangedWeapon(damage, visibility, ammoCount, name, description) : Item {
    return { kind: "Weapon", weaponType: { kind: "RangedWeapon", damage: damage, visibility: visibility, ammoCount: ammoCount}, 
      info: new Info(name, description) };
  }
  
  export function initKey(code, name, description) : Item {
    return { kind: "Key", doorCode: code, info: new Info(name, description) };
  }
  
  export function initClue(name, description, clueInfo) : Item {
    return { kind: "Clue", info: new Info(name, description), clueInfo: clueInfo };
  }
  
  export function initHiddenPassageway(name, description, roomNames) : Item {
    return { kind: "HiddenPassageway", info: new Info(name, description), rooms: roomNames };
  }
  
  export function initConsumable(name, description, isAlcohol, healthBonus, uses) : Item {
    return { kind: "Consumable", info: new Info(name, description), isAlcohol: isAlcohol, healthBonus: healthBonus, remainingUses: uses, isPoisoned: false }
  }
  
  export function initContainer(name, description, items) : Item {
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

export function getNameWithType(item: Item) : string {
  switch (item.kind) {
    case "Weapon": 
      if (item.weaponType.kind === "MeleeWeapon")
        return `Melee Weapon V=${item.weaponType.visibility} D=${item.weaponType.damage}:` + 
          `${item.weaponType.koChance.kind === "Some" ?  `KOC:1/${item.weaponType.koChance.value}` : ""}` +
          item.weaponType.isPoisoned ? " Poisoned" : "";
      else
        return `RangedWeapon V=${item.weaponType.visibility} A=${item.weaponType.ammoCount} D=${item.weaponType.damage}`;
    case "Key": return "Key:";
    case "Clue": return "Clue:";
    case "Consumable": return `Consumable: ${item.isAlcohol ? " Alcholol" : ""} ${item.isPoisoned ? " Poisoned" : ""}`;
    case "HiddenPassageway": return "Display:";
    case "EscapeItem": return "Escape:";
    default: return item.kind + ":";
  }
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