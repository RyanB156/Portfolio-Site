import { Info } from './domain-types';
import { Option } from './option';
import { Item, getNameWithType } from './item';
import { Personality } from './personality';
import { List } from './list';
import { Random } from './random';
import { Result } from './result';
import { Std } from 'src/app/hitman-ts/Domain/std';


export type PersonType = "Player" | "Barkeep" | "Chef" | "Groundskeeper" | "Janitor" | "Maid" | "Civilian" | "Guard" | "Target"
export type RespawnData = { name: string, gender: Personality.Gender }

export type State = "SNormal" | "Asleep" | "Unconscious" | "Dead" | "Drunk"

export interface Hostile { kind: "Hostile"; target: Target }
export interface Unaware { kind: "Unaware" }
export interface Aware { kind: "Aware" }
export interface Afraid { kind: "Afraid" }
export interface Warn { kind: "Warn" }

export type Awareness = Unaware | Aware | Afraid | Hostile | Warn

export interface APickupItem { kind: "APickupItem"; item: string }
export interface AGoto { kind: "AGoto"; room: string }
export interface AAttack { kind: "AAttack" }
export interface ASuicide { kind: "ASuicide" }
export interface AUseFood { kind: "AUseFood" }
export interface ATryWakeUp { kind: "ATryWakeUp" }
export interface ANeutralAction { kind: "ANeutralAction" }
export type AIAction = AAttack | ASuicide | AUseFood | APickupItem | AGoto | ATryWakeUp | ANeutralAction

export interface TPerson { kind: "TPerson"; name: string }
export interface TPlayer { kind: "TPlayer" }
export interface NoTarget { kind: "NoTarget" }
export type Target = TPerson | TPlayer | NoTarget

// Wait: AI is not triggered. Move: AI is triggered. Alert: AI is triggered and alerted to the player's presence. 
// AlertAll: AI is triggered and all people in the room and adjacent rooms are alerted to the player's presence.
export interface AIAlertAll { kind: "AIAlertAll"; target: Target }
export interface AIAlert { kind: "AIAlert"; target: Target }
export interface AIWait { kind: "AIWait" }
export interface AIMove { kind: "AIMove" }
export type AICall = AIWait | AIMove | AIAlert | AIAlertAll

export class Person {

  static fearWeight = 3;
  static moodWeight = 2;
  static trustWeight = 5;
  static attractionWeight = 5;
  static defaultDamage = 10;
  static awareKnockoutChance = 20.0
  static defaultPoisonDamage = 10
  static inquireInfo = ["name", "description", "type", "gender", "sexuality", "attraction", 
  "trust", "mood", "ethics", "morality", "bravery", "health", "clue", "items"];

  private info: Info;
  private clueInfo: string;
  private type: PersonType;
  private gender: Personality.Gender;
  private sexuality: Personality.Sexuality;
  private state: State;
  private health: number;
  private awareness: Awareness;
  private personality: Personality.Personality;
  private items: Item[];
  private isHoldingWeapon: boolean;
  private isHoldingFood: boolean;
  private isPoisoned: boolean;
  private action: AIAction;
  private isCommanded: boolean;
  private attackDamage: number;
  private createdNewLife: boolean;
  private responsiveness: number;

  constructor(name, description, personType, gender, sexuality, bravery, ethics, morality, responsivenes) {
    
    this.info = new Info(name, description);
    this.clueInfo = "";
    this.type = personType;
    this.gender = gender;
    this.sexuality = sexuality;
    this.state = "SNormal";
    this.health = 100;
    this.awareness = { kind: "Unaware" };
    this.personality = Personality.makePersonality(5, 5, 5, 5, ethics, morality, bravery);
    this.items = [];
    this.isHoldingWeapon = false;
    this.isHoldingFood = false;
    this.isPoisoned = false;
    this.action = { kind: "ANeutralAction" };
    this.isCommanded = false;
    this.attackDamage = 10;
    this.createdNewLife = false;
    this.responsiveness = responsivenes;
  }

  addClue(clue) { this.clueInfo = clue; }

  initStandingGuard() { this.awareness = { kind: "Warn" }; }
  
  setTrust(newTrust: Personality.TrustP) { this.personality.trust = newTrust; }

  setAttraction(newAttraction: Personality.AttractionP) { this.personality.attraction = newAttraction; }

  setMood(newMood: Personality.MoodP) { this.personality.mood = newMood; }

  setFear(newFear: Personality.FearP) { this.personality.fear = newFear; }

  setAwareness(newAwareness: Awareness) { this.awareness = newAwareness; }

  setDescription(newDescription) { this.info.description = newDescription; }

  getCreatedNewLife() { return this.createdNewLife; }
  setCreatedNewLife(b) { this.createdNewLife = b; }

  getGender() { return this.gender; }


  getIsHoldingWeapon() { return this.isHoldingWeapon; }
  setIsHoldingFood(b) { this.isHoldingFood = b; }

  getIsHoldingFood() { return this.isHoldingFood; }
  setIsHoldingWeapon(b) { this.isHoldingWeapon = b; }

  getItems() { return this.items; }
  addItem(item: Item) { this.items.push(item); }

  getType() { return this.type; }

  getRespawnData() : RespawnData { return { name: this.info.name, gender: this.gender }; }

  trySetAwareness(newAwareness: Awareness) {
    if (this.awareness.kind === "Unaware")
      this.awareness = newAwareness;
  }

  getIsCommanded() { return this.isCommanded; }
  setIsCommanded(b) { this.isCommanded = b; }

  getIsPoisoned() { return this.isPoisoned; }
  setIsPoisoned(b) { this.isPoisoned = b; }  

  getBravery() { return this.personality.bravery; }

  getResponsiveness() { return this.responsiveness; }

  hasStatusEffect() { return this.isPoisoned; }

  // Once a person consumes alcohol, they become drunk which gives a boost to their responsiveness.
  makeDrunk() {
    Std.writeLine(`${this.info.name} is inebriated`);
    this.state = "Drunk";
    this.responsiveness += 0.20;
  }

  setAction(newAction: AIAction) {
    this.action = newAction;
  }

  printStats() {
    Std.writeLine("Attraction: " + this.personality.attraction.class);
    Std.writeLine("Trust: " + this.personality.trust.class);
    Std.writeLine("Mood: " + this.personality.mood.class);
    Std.writeLine("Sexuality: " + this.sexuality);
    Std.writeLine("State: " + this.state);
    Std.writeLine("Health: " + this.health);
    Std.writeLine("Awareness: " + this.awareness);
    Std.writeLine("Bravery: " + this.personality.bravery);
    Std.writeLine("Morality: " + this.personality.morality);
    Std.writeLine("Ethics: " + this.personality.ethics);
    Std.writeLine("Responsiveness: " + this.responsiveness);
  }

  getAttraction() { return this.personality.attraction; }
  getMood() { return this.personality.mood; }
  getTrust() { return this.personality.trust; }
  getFear() { return this.personality.fear; }
  getEthics() { return this.personality.ethics; }
  getMorality() { return this.personality.morality; }
  getAwareness() { return this.awareness; }
  getHealth() { return this.health; }
  getState() { return this.state; }
  getName() { return this.info.name; }
  getDescription() { return this.info.description; }
  getInfo() { return this.info; }

  queryPersonality() { return this.personality.attraction.value; }
  queryTrust() { return this.personality.trust.value; }
  queryMood() { return this.personality.mood.value; }
  queryAttraction() { return this.personality.attraction.value; }

  adjustChanceWithStats(chance) {
    let weights = [ Person.fearWeight * this.personality.fear.value, Person.moodWeight * this.personality.mood.value, Person.trustWeight * this.personality.trust.value ]
    return List.foldNumber((x, y) => x + y, weights, chance);
  }

  adjustChanceFixed() {
    let weights = [ Person.fearWeight * this.personality.fear.value, Person.moodWeight * this.personality.mood.value, Person.trustWeight * this.personality.trust.value ]
    return List.reduceNumber((x, y) => x + y, weights);
  }

  // Random chance for a person's response based on their ethics.
  getEthicsBasedChance() {
    let chance = this.personality.ethics === "ELawful" ? 0.20 : (this.personality.ethics === "ENeutral" ? 0.50 : 0.80);
    return Math.random() < this.adjustChanceWithStats(chance);
  }

  // Random chance for a person's response based on their morality.
  getMoralityBasedChance() {
    let chance = this.personality.morality === "MBlue" ? 0.20 : (this.personality.morality === "MGrey" ? 0.50 : 0.80);
    return Math.random() < this.adjustChanceWithStats(chance);
  }

  // Random chance for a person's response based on their ethics and morality.
  getEthicsAndMoralityBasedChance()
  {
    return this.getEthicsBasedChance() === this.getMoralityBasedChance();
  }

  getPossiveGenderString() {
    return this.gender === "Female" ? "her" : (this.gender === "Male" ? "his" : "their");
  }

  getReflexiveGenderString() {
    return this.gender === "Female" ? "herself" : (this.gender === "Male" ? "himself" : "theirself");
  }

  getGenderPronounString() {
    return this.gender === "Female" ? "she" : (this.gender === "Male" ? "he" : "they");
  }

  getGenderObjectiveString() {
    return this.gender === "Female" ? "her" : (this.gender === "Male" ? "him" : "them");
  }


  getAwarenessAsString() {
    switch (this.awareness.kind) {
      case "Unaware": return "Unaware of you";
      case "Afraid": return "Afraid of you";
      case "Aware": return "Aware of you";
      case "Warn": return "Warning you";
      default:
        if (this.awareness.kind === "Hostile") {
          if (this.awareness.target.kind === "TPlayer")
            return "Hostile to You";
          else if (this.awareness.target.kind === "NoTarget")
            return "No Target";
          else
            return "Hostile to " + this.awareness.target.name;
        }
    }
  }

  // Get all search info about a person.
  getFullInfoStr() {
    return `Name:${this.info.name} - Gender:${this.gender} - Type:${this.type} - State:${this.state} - Awareness:${this.awareness}`;
  }

  getJobClothes() {
    switch (this.type) {
      case "Barkeep": case "Chef": case "Groundskeeper": case "Janitor": case "Maid": case "Guard":
        return Result.makeSuccess(this.type);
      default:
        return Result.makeFailure(`${this.info.name} is not a person you can take clothes from`);
    }
  }

  // Get a person's compatability with the player's gender. This applies to AI sexuality because the player can choose their own sexuality.
  isCompatableWith(gender) {
    if (this.sexuality === "Gay") return gender === this.gender;
    else if (this.sexuality === "Straight") return (this.gender === "Male" && gender === "Female") || (this.gender === "Female" && gender === "Male");
    else return true;
  }

  getClueFromPerson() {
    if (this.getTrust().class === "TFull" || this.getTrust().class === "TTrust")
      return `${this.info.name} Clue:\n${this.clueInfo}`;
    else
      return `${this.info.name} does not trust you enough to give you any information`;
  }

  stringToDataString(arg) : Result.Result<string>{
    function inner(a) {
      switch (a) {
        case "name": return "Name: " + this.info.name;
        case "description": return "Description: " + this.info.description;
        case "type": return "Type: " + this.type;
        case "gender": return "Gender: " + this.gender
        case "sexuality": return "Sexuality: " + this.sexuality
        case "attraction": return "Attraction: " + this.personality.attraction.class;
        case "trust": return "Trust: " + this.personality.trust.class;
        case "fear": return "Fear: " + this.personality.fear.class;
        case "mood": return "Mood: " + this.personality.mood.class;
        case "ethics": return "Ethics: " + this.personality.ethics;
        case "morality": return  "Morality: " + this.personality.morality;
        case "bravery": return "Bravery: " + this.personality.bravery;
        case "health": return "Health: " + this.health;
        case "state": return "State: " + this.state;
        case "clue": return this.clueInfo;
        case "items": 
          let itemNames = List.map((i: Item) => getNameWithType(i), this.items);
          return `${this.info.name} items:\n${List.foldString((a, b) => a + b, itemNames, "")}`;
        default: return "Error in stringToDataString.inner";
      }
    }
    if (Person.inquireInfo.includes(arg))
      return Result.makeSuccess(inner(arg));
    else
      return Result.makeFailure(`${arg} is not a valid question`);
  }

  addToInventory(item) { this.items.push(item); }
  
  removeFromInventory(itemName: string) { this.items = List.removeOne<Item>((i: Item) => i.info.name.toLowerCase() === itemName.toLowerCase(), this.items); }
    
  updateInventory(oldItem, newItem) {
    this.removeFromInventory(oldItem);
    this.addToInventory(newItem);
  }

  setHoldingWeapon(b) { this.isHoldingWeapon = b; }
  setHoldingFood(b) { this.isHoldingFood = b; }

  tryFindItem(item) { return List.tryFind((i) => i === item, this.items); }

  // Finds the item in the person's inventory by checking its name in lower case.
  tryFindItemByName(itemName) { return List.tryFind((i: Item) => i.info.name === itemName, this.items); }

  // Update the specified person's awareness level with the given value.
  updateAwareness(newLevel) { this.awareness = newLevel; }

  addHealth(healthBonus) { this.health += healthBonus; }

  addFear(adj: Personality.Adjustment) {
    let result = Personality.adjustFear(adj, this.personality.fear);
    if (result.kind === "Success")
      this.setFear(result.value);
    else
      Std.writeLine(result.value);
  }

  addTrust(adj: Personality.Adjustment) {
    let result = Personality.adjustTrust(adj, this.personality.trust);
    if (result.kind === "Success")
      this.setTrust(result.value);
    else
      Std.writeLine(result.value);
  }

  // Bad action by the player can upset people based on their morality. Prints a message based on the action.
  badActionResponse() {
    let adj: Personality.Adjustment;
    let responseMsg: string;
    switch (this.personality.morality) {
      case "MBlue": adj = { kind: "Down", value: 2 }; responseMsg = `${this.info.name} hated that`;
      case "MGrey": adj = { kind: "Down", value: 1 }; responseMsg = `${this.info.name} didn't like that`;
      case "MRed": adj = { kind: "Up", value: 1 }; responseMsg = `${this.info.name} liked that`;
    }

    function adjAttraction(adj) {
      let result = Personality.adjustAttraction(adj, this.personality.attraction);
      if (result.kind === "Failure") Result.printPersonalityAdjFailure(this, result.value);
      else this.setAttraction(result.value);
    }

    function adjTrust(adj) {
      let result = Personality.adjustTrust(adj, this.personality.trust);
      if (result.kind === "Failure") Result.printPersonalityAdjFailure(this, result.value);
      else this.setTrust(result.value);
    }

    function adjMood(adj) {
      let result = Personality.adjustMood(adj, this.personality.mood);
      if (result.kind === "Failure") Result.printPersonalityAdjFailure(this, result.value);
      else this.setMood(result.value);
    }

    // Do nothing if the person trusts the player.
    if (List.forAll((x) => x > 8, [this.getTrust().value, this.getAttraction().value])) { }
    else {
      Std.writeLine(responseMsg);
      adjAttraction(adj);
      adjTrust(adj);
      adjMood(adj);
    }
        
  }

  getAction() { return this.action; }

  setState(newState: State) { this.state = newState; }
  setHealth(health) { this.health = health; }
      
  isCompliant() { return 1.0 - this.adjustChanceFixed() < this.responsiveness; }

  deathCheck() {
    if (this.health <= 0) {
      this.health = 0;
      Std.writeLine(`${this.info.name} is dead`);
      this.setState("Dead");
    }
  }

  // Try to apply poison damage to a person.
  tryApplyPoisonDamage() {
    if (this.state !== "Dead") {
      if (this.isPoisoned) {
        Std.writeLine(`${this.info.name} took damage from poison. Health: ${Person.defaultPoisonDamage}`);
        this.health -= Person.defaultPoisonDamage;
        this.deathCheck();
      }
    }
  }

  // Try to change a person's awareness to a new value.
  attackResponse(attacker: Target) {
    if (this.state === "SNormal") {
      if (this.type === "Guard" || this.personality.bravery === "BBrave")
        this.awareness = { kind: "Hostile", target: attacker };
      else if (this.personality.bravery === "BFearful")
        this.awareness = { kind: "Afraid" };
      else
        this.awareness = { kind: "Aware" };

      Std.writeLine(`${this.info.name} is ${this.getAwarenessAsString()}`);
    }
  }

  // Subtract health from people based on attack damage.
  takeDamage(damage, koChance: Option.Option<number>) {
    if (koChance.kind === "Some") {
      if (Random.nextInt(0, koChance.value) == 0) {
        this.setState("Unconscious");
        this.setAction({ kind: "ATryWakeUp" });
      }
    }
    this.health -= damage;
    this.deathCheck();
  }

  // Apply an attack with specific parameters for punch/attack/chokeout/etc.
  applyAttack(attackDamage, koChance: Option.Option<number>, isPoisoned) {
    if (this.state === "Dead") 
      return Std.writeLine(`${this.info.name} is already dead`)
    else {
      this.takeDamage(attackDamage, koChance);
      if (isPoisoned && !this.isPoisoned) {
        Std.writeLine(`${this.info.name} is poisoned`);
        this.isPoisoned = true;
      }
      this.attackResponse({ kind: "TPlayer" });
      this.setTrust( { kind: "TrustP", class: "TMistrust", value: 0 });
    }
  }

}


  
