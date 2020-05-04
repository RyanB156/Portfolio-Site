import { Environment } from './environment';
import { Info } from './info';
import { Player } from './player';
import { List } from './list';
import { RoomMap, Room } from './room';
import { Time } from './time';
import { Person } from './person';
import { Init, Item } from './item';


export namespace JsonParser {
  function parseItem(o: Object) : Item {
    let info = new Info(o["info"]["name"], o["info"]["description"]);
    switch (o["kind"]) {
      case "Weapon":
        if (o["weaponType"]["kind"] === "MeleeWeapon") {
          let mw = o["weaponType"];
          return Init.initMeleeWeapon(info.name, info.description, mw["damage"], mw["koChance"], mw["visibility"], mw["isPoisoned"]);
        } else if (o["weaponType"]["kind"] === "RangedWeapon") {
          let rw = o["weaponType"];
          return Init.initRangedWeapon(info.name, info.description, rw["damage"], rw["visibility"], rw["ammoCount"]);
        } else {
          return null;
        }
      case "Key":
        return Init.initKey(info.name, info.description, o["doorCode"]);
      case "Clue":
        return Init.initClue(info.name, info.description, o["clueInfo"]);
      case "HiddenPassageway":
        return Init.initHiddenPassageway(info.name, info.description, o["rooms"]);
      case "Consumable":
        return Init.initConsumable(info.name, info.description, o["isAlcohol"], o["healthBonus"], o["remainingUses"]);
      case "Container":
        return Init.initContainer(info.name, info.description, o["items"]);
      case "Display":
      case "Furniture":
      case "LargeDisplay":
      case "EscapeItem":
      case "Intel":
      case "Poison":
        return { kind: o["kind"], info: info };
    }
  }
  
  function parsePerson(o: Object) : Person {
    let info = new Info(o["info"]["name"], o["info"]["description"]);
    let clueInfo = o["clueInfo"];
    let type = o["type"];
    let gender = o["gender"];
    let sexuality = o["secuality"];
    let state = o["state"];
    let health = o["health"];
    let awareness = o["awareness"];      
  
    let jPersonality = o["personality"];
    let attraction = jPersonality["attraction"];
    let trust = jPersonality["trust"];
    let mood = jPersonality["mood"];
    let fear = jPersonality["fear"];
    let ethics = jPersonality["ethics"];
    let morality = jPersonality["morality"];
    let bravery = jPersonality["bravery"];
  
    let items = List.map(parseItem, o["items"]);
    let isHoldingWeapon = o["isHoldingWeapon"];
    let isHoldingFood = o["isHoldingFood"];
    let isPoisoned = o["isPoisoned"];
    let action = o["action"];
    let isCommanded = o["isCommanded"];
    let attackDamage = o["attackDamage"];
    let createdNewLife = o["createdNewLife"];
    let responsiveness = o["responsiveness"];
  
    let p = new Person(info, type, gender, sexuality, bravery, ethics, morality, responsiveness);
    p.setClue(clueInfo);
    p.setState(state);
    p.setHealth(health);
    p.setAwareness(awareness);
    p.setAttraction(attraction);
    p.setTrust(trust);
    p.setMood(mood);
    p.setFear(fear);
    p.setItems(items);
    p.setIsHoldingWeapon(isHoldingWeapon);
    p.setIsHoldingFood(isHoldingFood);
    p.setIsPoisoned(isPoisoned);
    p.setAction(action);
    p.setIsCommanded(isCommanded);
    p.setAttackDamage(attackDamage);
    p.setCreatedNewLife(createdNewLife);
    
    return p;
  }
  
  function parseRoom(o: Object) : Room {
    let rInfo = new Info(o["info"]["name"], o["info"]["description"]);
    let rPeople = List.map(parsePerson, o["people"]);
    let rItems = List.map(parseItem, o["items"]);
    return new Room(rInfo, o["roomType"], rPeople, rItems);
  }
  
  function parseTime(o: Object) : Time {
    return new Time(o["hour"], o["minute"]);
  }
  
  function parseRoomData(o:Object) : [string, [Room, RoomMap]][] {
    
    let data: [string, [Room, RoomMap]][] = [];
    for (let key in o) {
      let room = parseRoom(o[key][0]);
      let roomMap = <RoomMap><unknown>o[key][1];
      data.push([key, [room, roomMap]]);
    }
  
    return data;
  }
  
  export function parseJSON(json: string) : [Environment, Object] {
  
    let jsonObject = JSON.parse(json);
  
    let jEnvironment = jsonObject["environment"];
    
    let jPlayer = jEnvironment["player"];
    let pInfo = new Info(jPlayer["info"]["name"], jPlayer["info"]["description"]);
    let player = new Player(pInfo, jPlayer["gender"], jPlayer["closeTarget"], jPlayer["disguise"], jPlayer["companionName"], jPlayer["health"], jPlayer["items"], jPlayer["equippedItem"]);
  
    let jRoom = jEnvironment["room"];
    let room = parseRoom(jRoom);
  
    let jMap = jEnvironment["roomMap"];
    
    let time = parseTime(jEnvironment["time"]);
    let updatePeople = List.map(parsePerson, jEnvironment["updatePeople"]);
  
    let environment = new Environment(player, room, jMap, time, jEnvironment["gameStatus"], jEnvironment["extraLives"], updatePeople, jEnvironment["objectives"], jEnvironment["accolades"], jEnvironment["moveCount"], jEnvironment["visitedRooms"]);
  
    let jRoomData = jsonObject["roomData"];
    let roomData = parseRoomData(jRoomData);

    let mapObject = {};
    for (let i = 0; i < roomData.length; i++) {
      mapObject[roomData[i][0]] = [roomData[i][1][0], roomData[i][1][1]];
    }
    
  
    return [environment, mapObject];
  }
}