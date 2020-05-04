
import { Personality } from './personality';
import { Environment } from './environment';
import { Item, Init } from './item';
import { Person } from './person';
import { List } from './list';
import { Room, RoomMap } from './room';
import { Time } from './time';
import { Player } from './player';
import { Info } from './info';


/**Data format for saving and loading files. roomData is used as a dictionary. */
export interface SaveData {
  environment: Environment,
  roomData: Object
}

export interface Accolades { kills: number }

export function accoladesString(accolades: Accolades) : string {
  return `accolades: { kills: ${accolades.kills} }`;
}

export type GameStatus = "Continue" | "Exit" | "PlayerDead" | "Win" | "PartialWin"

export interface NewGameInfo { kind: "NewGameInfo"; name: string; gender: Personality.Gender }
export interface LoadGameInfo { kind: "LoadGameInfo"; }