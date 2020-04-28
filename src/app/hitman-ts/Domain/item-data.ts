
import { Init, Item } from './item';
import { List } from './list';
import { Option } from './option';
import { RoomTypes } from './room';
import { Std } from './std';
import { SpawnRoom } from './spawn-room';
import { Random } from './random';

export namespace ItemData {
  

  export namespace MeleeWeapon {
    let f = Init.initMeleeWeapon;
    let itemOptionsList = [
        
        f(30, Option.makeNone(), "VMedium",  "Knife", "A knife"),
        f(50, Option.makeSome(2), "VMedium",  "Shovel",  "A typical garden shovel"),
        f(15, Option.makeNone(), "VLow",  "ScrewDriver",  "A well worn screwdriver"),
        f(50, Option.makeSome(3), "VHigh",  "MetalPipe",  "A heavy piece of(pipe"),
        f(10, Option.makeNone(), "VLow",  "Pen",  "A calligraphy pen"),
        f(40, Option.makeNone(), "VMedium",  "Cleaver",  "A large butcher knife"),
        f(5, Option.makeSome(10), "VLow",  "Mop",  "An old mop"),
        f(25, Option.makeNone(), "VMedium",  "HedgeTrimmers",  "A set of(hedge trimmers. They look sharp"),
        f(15, Option.makeNone(), "VLow",  "Pencil",  "A well sharpened writing utensil"),
        f(60, Option.makeNone(), "VMedium",  "Katana",  "A traditional Japanese sword"),
        f(45, Option.makeSome(4), "VMedium",  "Claymore",  "A large two handed sword"),
        f(10, Option.makeSome(15), "VMedium",  "TVRemote",  "An everyday TV remote"),

        ]
    export function getItem() : Item { return List.randomChoice(itemOptionsList); }
  }

  
  export namespace RangedWeapon {
    let f = Init.initRangedWeapon
    let itemOptionsList = [
        
        f(100, "VHigh", 2, "Shotgun", "A trusty double barrelled shotgun"),
        f(100, "VMedium", 1, "HarpoonGun", "A projectile weapon used for underwater fishing"),
        f(15, "VLow", 20, "NailGun", "A seemingly harmless tool. In the right hands it can be a deadly weapon."),
        f(30, "VMedium", 8, "1911", "An American classic"),
        f(60, "VHigh", 30, "M4", "A standard issue military carbine"),
        f(35, "VMedium", 30, "M4Suppressed", "The M4, you know and love, with a suppressor attached"),
        f(30, "VMedium", 15, "P226", "A special forces pistol"),
        f(20, "VLow", 15, "P226Suppressed", "The same pistol, but quieter"),

        ]
      export function getItem() : Item { return List.randomChoice(itemOptionsList); }
    }

  export namespace Key {
    
    // type DoorCode = Blue | Red | Green | White | Black
    let blueKey = Init.initKey("blue", "BlueKey", "A BlueKey");
    let redKey = Init.initKey("red", "RedKey", "A RedKey");
    let greenKey = Init.initKey("green", "GreenKey", "A GreenKey");
    let whiteKey = Init.initKey("white", "WhiteKey", "A WhiteKey");
    let blackKey = Init.initKey("black", "BlackKey", "A BlackKey");

    export function getItem(roomType: RoomTypes.SpawnRoomType) {
      if (roomType.kind === "Spawn" || roomType.kind === "Storage")
        return blueKey;
      else if (roomType.kind === "Patio" || roomType.kind === "Garden" || roomType.kind === "Garage")
        return redKey;
      else if (roomType.kind === "CommonRoom")
        return greenKey;
      else if (roomType.kind === "PrivateRoom")
        return blackKey;
      else {
        Std.writeLine(`Failure generating key for RoomType: ${roomType}. ${roomType} cannot have keys`);
        return null;
      }
    

    
    }
        
  }

  export namespace Clue { // Create all rooms with people and items, find all targets and intel items, then create clues in the proper rooms with objective information.
    let f = Init.initClue
    let itemOptionsList = 
        [

        f("SecretDocument", "A shady piece of paper", ""),
        f("Memo", "An internal communication from the family", ""),
        f("Letter", "A letter from one of(the family's contacts", ""),
        
        ]

    export function getItem() : Item { return List.randomChoice(itemOptionsList); }
  }

  export namespace HiddenPassageway {
    let f = Init.initHiddenPassageway
    let itemOptionsList = [
        
        f("Bookcase", "A dusty bookcase. One of(the books has some fingerprints on it. Interesting", []),
        f("Panel", "An access panel on the wall", []),
        f("Vent", "An airconditioning vent", []),

        ]

    export function getItem() : Item { return List.randomChoice(itemOptionsList); }
    }

  export namespace Consumable {
    let f = Init.initConsumable

    let itemOptionsList = [

        f("Pizza", "A supreme pizza with all of(the standard toppings", false, 20, 4),
        f("Burrito", "A spicy burrito", false, 15, 5),
        f("Apple", "A juicy apple", false, 10, 4),
        f("MtDew", "A crisp cool beverage with all of(the sugar and caffeine an assassin can handle", false, 10, 2),
        f("Pepsi", "A refreshing soda", false, 10, 2),
        f("Coke", "An American classic", false, 10, 2),
        f("Goldy", "A brilliant goldfish. It looks tasty, if(you're into that sort of(thing.", false, 20, 1),
        f("Grapes", "A handful of(grapes picked from the grape vines in the North Patio.", false, 5, 6),
        f("Cake", "A lemon cake. It looks delicious", false, 15, 4),
        f("Wine", "A bottle of(red wine. It looks expensive", true, 10, 6),
        f("Cake", "A lemon cake. It looks delicious", false, 15, 4),
        f("Wine", "A bottle of(red wine. It looks expensive", true, 10, 6),
        f("Vodka", "A high quality Russian liquor", true, 25, 3),
        f("Rum", "A rich Caribbean booze", true, 20, 4),
        f("Whiskey", "A strong American brew", true, 30, 3),
        f("Water", "It's water", false, 10, 4),
        f("Special", "A special mix for the father", true, 100, 2),

        ]

    export function getItem() : Item { return List.randomChoice(itemOptionsList); }
    }

  export namespace Display {
    
    let f = Init.initDisplay

    let itemOptionsList = [

        f("Lillies", "A small display of(flowers on the patio table. They must have come from the Mother's garden."),
        f("FishPicture", "A family fishing picture. The father and son are struggling to hold a huge marlin for the picture."),
        f("AfricaPicture", "A picture of(the father with a robed man in the desert"),
        f("JunglePicture", "A picture of(the father with a rich looking man in a jungle somewhere"),
        f("SkiMagazine", "A magazine about skiing in the Swiss Alps. A skiier carving a corner is featured on the cover"),
        f("CallOfDestiny", "There is a futuristic man on the cover with a gun. This must be what the kids are playing nowadays."),
        f("ZStation5", "The latest game console"),
        f("FatherPortrait", "A regal portrait of(the father. He is in some sort of(military dress uniform"),
        f("MotherPortrait", "A portrait of(the mother. She's in a large ball gown"),
        f("SonPortrait", "A portrait of(the son. He is in a nice tuxedo"),
        f("DaughterPortrait", "She is a spitting image of(her mother"),
        f("AfricanHistory", "A large book with a map of(Africa on the cover"),

        ]
    export function getItem() : Item { return List.randomChoice(itemOptionsList); }
  }

  // Large items to be placed outside.
  export namespace LargeDisplay {
    let f = Init.initLargeDisplay

    let itemOptionsList = [
        f("JetSki", "A blue jet ski"),
        f("HorseHedge", "A decorative hedge hand crafted to look like a horse"),
        f("ElephantHedge", "A decorative hedge hand crafted to look like an elephant"),
        f("DolphinHedge", "A decorative hedge hand crafted to look like a dolphin"),
        f("Pool", "A fancy inground pool with a rock display on one side"),
        f("FishingBoat", "A fancy fishing boat"),
        ]

    export function getItem() : Item { return List.randomChoice(itemOptionsList); }
  }

  export namespace Escape {
    let f = Init.initEscape

    let itemOptionsList = [
        f("Horse", "A large thoroughbred"),
        f("Bugatti", "An expensive car"),
        f("Tesla", "A sleek electric car"),

        ]

    export function getItem() : Item { return List.randomChoice(itemOptionsList); }
  }

  // Furniture items for inside.
  export namespace Furniture {
    let f = Init.initFurniture
    let itemOptionsList = [
        f("Couch", "A large leather couch"),
        f("TV", "A large flatscreen TV. Some sort of(shooter game is on the screen."),
        f("Bar", "A modern looking bar. It is very clean."),
        f("LoveSeat", "A small couch"),
        f("Stool", "A small stool"),
        f("WoodenStool", "A wooden stool"),
        f("BarSeat", "A plain seat for sitting at a bar"),

        ]

    export function getItem() : Item { return List.randomChoice(itemOptionsList); }
  }

  export namespace Intel {
    
    let f = Init.initIntel

    let itemOptionsList = [

        f("DrugManifest", "A listing of(all of(the father's drug shipments"),
        f("PersonManifest", "A record of(the father's human trafficking shipments"),
        f("CocaineResidue", "Trace powder on the table. It seems like someone was doing lines recently"),
        ]

    export function getItem() : Item { return List.randomChoice(itemOptionsList); }
  }

  export namespace Poison {

    let f = Init.initPoison

    let itemOptionsList = [
        
        f("RattlesnakeVenom", "Potent venom from a local viper"),
        f("Venom", "An unknown concoction"),
        ]

    export function getItem() : Item { return List.randomChoice(itemOptionsList); }
  }

  export namespace Container {
    function containerItemOptions() {

      let weights : [string, number][] = [["MWeapon", 2], ["RWeapon", 2], ["Consumable", 4], ["Poison", 1]];

      //let weights = ["MWeapon", 2; "RWeapon", 2; "Consumable", 4; "Poison", 1]
      let flatWeights = [];
      weights.forEach(w => {
        List.transformWeights(w[1], w[0]).forEach(n => flatWeights.push(n));
      })
      return flatWeights;
    }

    let capacity = 2

    let itemOptionsList = [

        ["Chest", "A storage chest"],
        ["OrnateShelf", "An ornate shelf"],
        ["PlainCabinet", "A plain cabinet"],
        ["KoiPond", "A koi pond surrounded by decorative stones"],
        ["TrashCan", "A place for people to dispose of(their garbage"],
        ["ToolBox", "A place for storing tools"],
        ["FancyCabinet", "A fancy cabinet"],
        ["CoffeeTable", "A table for setting drinks on"],
        ["Counter", "A counter for holding various items"],
        ["WoodTable", "A wooden table"],
        ]

    function stringToItem(str: string) {
      switch (str) {
        case "MWeapon": return MeleeWeapon.getItem()
        case "RWeapon": return RangedWeapon.getItem()
        case "Consumable": return Consumable.getItem()
        case "Poison": return Poison.getItem()
      }
    }

    export function getItem() : Item {
      let items: Item[] = [];
      for (let i = 0; i < capacity; i++) {
        items.push(stringToItem(List.randomChoice(containerItemOptions())));
      }
      

        let [name, desc] = List.randomChoice(itemOptionsList);
        return Init.initContainer(name, desc, items)
    }

  }

  export function stringClassToItem(roomType: RoomTypes.SpawnRoomType, str: string) {
    
    switch(str) {
      case "MWeapon": return MeleeWeapon.getItem()
      case "RWeapon": return RangedWeapon.getItem()
      case "Key": return Key.getItem(roomType)
      case "Clue": return Clue.getItem()
      case "HiddenP": return HiddenPassageway.getItem() // -- This should never be matched here. This item created later.
      case "Consumable": return Consumable.getItem()
      case "Container": return Container.getItem()
      case "Display": return Display.getItem()
      case "LargeDisplay": return LargeDisplay.getItem()
      case "Escape": return Escape.getItem()
      case "Furniture": return Furniture.getItem()
      case "Intel": return Intel.getItem()
      case "Poison": return Poison.getItem()
      default: Std.writeLine(str + " unmatchable as stringToItem")
    }
      
  }

  export function defaultItems(roomType: RoomTypes.SpawnRoomType) {
    switch (roomType.kind) {
      case "Spawn": return ["MWeapon",  "Escape",  "Consumable"];
      case "Patio": return ["LargeDisplay"];
      case "Garden": return ["LargeDisplay"];
      case "Garage": return ["Escape"];
      case "Storage": return ["MWeapon",  "Consumable"];
      case "Bathroom": return [];
      case "Stairs": return [];
      case "Hallway": return [];
      case "CommonRoom": return ["Furniture",  "Consumable",  "Consumable"];
      case "EntranceWay": return [];
      case "PrivateRoom": return ["Consumable"];
      case "Closet": return [];
      case "MissionRoom": return [];
    }
  }

  export function itemTypeChanceByRoomType(roomType: RoomTypes.SpawnRoomType) : string[] {
    function initWeightsByRoom() : [string, number][] {
      // | Bathroom | Stairs | Hallway | Closet _ | MissionRoom -> will raise an exception if(you try to put a key in them, so don't.
      switch (roomType.kind) {
        case "Spawn": return          [["MWeapon", 1], ["RWeapon", 2], ["Key", 5], ["Consumable", 2], ["Container", 1], ["Display", 1], ["Poison", 1]];
        case "Patio": return          [["MWeapon", 1], ["Key", 1], ["Consumable", 2], ["Container", 1], ["Display", 1], ["LargeDisplay", 2]];
        case "Garden": return         [["MWeapon", 1], ["Key", 1], ["Container", 1], ["Furniture", 0], ["Display", 1], ["LargeDisplay", 2], ["Poison", 2]];
        case "Garage": return         [["RWeapon", 1], ["Key", 1], ["Escape", 2], ["Container", 1], ["Furniture", 1], ["Display", 1], ["LargeDisplay", 1]];
        case "Storage": return        [["Key", 1], ["Consumable", 1], ["Container", 1], ["Furniture", 1], ["Display", 1]];
        case "Bathroom": return       [["MWeapon", 1], ["Container", 1], ["Furniture", 1], ["Display", 2]];
        case "Stairs": return         [["Display", 3]];
        case "Hallway": return        [["RWeapon", 1], ["Consumable", 1], ["Container", 1], ["Display", 1]];
        case "CommonRoom": return     [["MWeapon", 1], ["Key", 1],  ["Consumable", 2], ["Container", 1], ["Furniture", 2], ["Display", 1]];
        case "EntranceWay": return    [["Key", 1], ["Furniture", 1], ["Display", 1]];
        case "PrivateRoom": return    [["MWeapon", 1], ["RWeapon", 1], ["Key", 2], ["Furniture", 3], ["Display", 1], ["Intel", 1]];
        case "Closet": return         [["RWeapon", 1], ["Consumable", 1], ["Container", 1], ["Display", 1]];
        case "MissionRoom": return    [["MWeapon", 1], ["RWeapon", 2], ["Consumable", 1], ["Container", 1], ["Furniture", 1], ["Display", 1], ["Intel", 3], ["Poison", 1]];
      }
    }

    let items = [];
    initWeightsByRoom().forEach(l => List.transformWeights(l[1], l[0]).forEach(res => items.push(res)));
    return items;

  }    


  export let clueRoomTypes = ["Spawn", "Garage", "Bathroom", "Stairs", "Hallway", "CommonRoom", "PrivateRoom", "Closet"] 

  export function getItemCountByRoom(roomType: RoomTypes.SpawnRoomType) {
    function itemCount() : number {
      switch (roomType.kind) {
        case "Spawn": return Random.nextInt(4, 6); // 4-5, items.
        case "Patio": return Random.nextInt(4, 7); // 4-6, items.
        case "Garden": return Random.nextInt(2, 6); // 2-5, items.
        case "Garage": return Random.nextInt(1, 3); // 1-2, items.
        case "Storage": return Random.nextInt(5, 8); // 5-7, items.
        // Inside
        case "Bathroom": return Random.nextInt(0, 2); // 0-1, items.
        case "Hallway": return Random.nextInt(2, 4); // 2-3, items.
        case "CommonRoom": return Random.nextInt(2, 5); // 2-4, items.
        case "EntranceWay": return Random.nextInt(2, 5); // 2-4, items.
        case "PrivateRoom": return Random.nextInt(2, 4); // 2-3, items.
        case "Closet": return Random.nextInt(2, 5); // 2-4, items.
        case "MissionRoom": return Random.nextInt(3, 5); // 3-4, items.
        default: return 0;
      }
    }
    return 2 + itemCount();
  }

  // Adds a hiddenpassageway to closets that are linked to mission rooms.
  export function tryAddHiddenPassageway(roomType: RoomTypes.SpawnRoomType, items: Item[]) {
    if (roomType.kind === "Closet" && roomType.hasSecret)
      items.push(HiddenPassageway.getItem());
    return items;
  }

  // Force more food items to spawn in food related rooms.
  export function tryPrioritizeFood(b: boolean, itemTypeNames: string[]) {
    if (b) {
      itemTypeNames = List.map((s: string) => s === "Intel" ? s : (Random.nextInt(0, 2) === 0 ? "Consumable" : s), itemTypeNames);
    }
    return itemTypeNames;
  }

  export function spawnItems(roomType: RoomTypes.SpawnRoomType, prioritizeFood: boolean) : Item[] {
    let count = getItemCountByRoom(roomType);
    let itemNames: string[] = [];

    // Get a random number of additional items.
    for (let i = 0; i < count; i++) {
      itemNames.push(List.randomChoice(itemTypeChanceByRoomType(roomType)));
    }
    // Add default items to the room.
    itemNames.concat(defaultItems(roomType));
    // Try to convert some items into food if it makes sense for the room.
    itemNames = tryPrioritizeFood(prioritizeFood, itemNames);
    // Select random items that correspond to each type name.
    let items: Item[] = List.map((s: string) => stringClassToItem(roomType, s), itemNames);
    items = tryAddHiddenPassageway(roomType, items);
    items = List.distinctBy((i: Item) => i.info.name.toLowerCase(), items);
    return items;
  }

}