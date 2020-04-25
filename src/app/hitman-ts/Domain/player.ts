import { Info } from './domain-types';
import { PersonType, Person } from './Person';
import { Personality } from './personality';
import { Option } from './option';
import { Item } from './item';
import { Random } from './random';
import { List } from './list';
import { Std } from 'src/app/hitman-ts/Domain/std';

export class Player {
  private info: Info;
  private gender: Personality.Gender;
  private closeTarget: Option.Option<string>;
  private disguise: Option.Option<PersonType>;
  private companionName: Option.Option<string>;
  private health: number;
  private items: Item[];
  private equippedItem: Option.Option<Item>;

  constructor(info:Info, gender:Personality.Gender, target:Option.Option<string>, disguise:Option.Option<PersonType>, 
    name:Option.Option<string>, health:number, items:Item[], equippeditem:Option.Option<Item>) {
    
    this.info = info;
    this.gender = gender;
    this.closeTarget = target;
    this.disguise = disguise;
    this.companionName = name;
    this.health = health;
    this.items = items;
    this.equippedItem = equippeditem;
  }

  initPlayer(name, description, gender, items) {
    return new Player(new Info(name, description), gender, Option.makeNone(), Option.makeNone(), Option.makeNone(), 100, [], Option.makeNone())
  }

  setHealth(newHealth) {
    this.health = newHealth;
  }

  // Another person did not like your actions towards them which makes them attack you.
  applyAngryAttack() {
    let damage = 10 * Random.nextInt(1, 5);
    this.health -= damage;
    return damage;
  }

  getHealth() { return this.health; }
  addHealth(health) { this.health += health; }
  applyDamage(damage) { this.health -= damage; }

  getName() { return this.info.name; }
  setName(newName) { this.info.name = newName; }
  
  addToInventory(item) { this.items.push(item); }
  removeFromInventory(item: Item) { this.items = List.removeOne((i: Item) => i.info.name.toLowerCase() === item.info.name.toLowerCase(), this.items); }

  getCloseTarget() { return this.closeTarget; }
  setCloseTarget(target) { this.closeTarget = target; }

  setGender(newGender) { this.gender = newGender; }
  getGender() { return this.gender; }

  updateInventory(oldItem, newItem) { 
    this.removeFromInventory(oldItem);
    this.addToInventory(newItem);
  }

  tryFindItemByName(itemName: string) {
    return List.tryFind((i: Item) => i.info.name.toLowerCase() === itemName, this.items);
  }

  //Finds the item in player's inventory, making sure that it is not poisoned first.
  tryFindConsumableByName(itemName: string) : Option.Option<Item> {
    let temp = this.items.filter((x) => x.kind === "Consumable" && !x.isPoisoned);
    return List.tryFind((i: Item) => i.info.name.toLowerCase() === itemName, temp);
  }

  updateCloseTarget(personName: string) {
    if (this.closeTarget.kind === "Some") {
      if (personName.toLowerCase() === this.closeTarget.value.toLowerCase()) {
        this.closeTarget = Option.makeNone();
      }
    }
  }
    
  getCompanion() { return this.companionName; }
  setCompanion(newCompanion: Option.Option<string>) { 
    this.companionName = newCompanion; 
    if (newCompanion.kind === "Some")
      Std.writeLine(`${newCompanion.value} has joined you`)
    else
      Std.writeLine("Your companion has left you");
  }

  printStats() {
    Std.writeLine("Name: " + this.info.name);
    Std.writeLine("Description: " + this.info.description);
    Std.writeLine("Gender: " + this.gender);
    
    if (this.closeTarget.kind === "Some")
      Std.writeLine("Close Target: " + this.closeTarget.value);

    if (this.companionName.kind === "Some")
      Std.writeLine("Companion: " + this.companionName.value);

    Std.writeLine("Health: " + this.health);
  }

  getDisguise() { return this.disguise; }
  getDisguiseString() { 
    if (this.disguise.kind === "Some")
      return "(" + this.disguise.value + ")";
    else
      return "";
  }
  setDisguise(disguise: Option.Option<PersonType>) { this.disguise = disguise; }

  getEquippedItem() { return this.equippedItem; }
  equipItem(item: Item) { this.equippedItem = Option.makeSome(item); }

  removeEquippedItemCheck(item: Item) {
    if (this.equippedItem.kind === "Some" && item.info.name.toLowerCase() === this.equippedItem.value.info.name.toLowerCase())
      this.equippedItem = Option.makeNone();
  }      

}