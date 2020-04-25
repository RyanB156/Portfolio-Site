
import { Personality } from './personality';

export class Info { 
  name: string; 
  description: string 

  constructor(name:string, description:string) {
    this.name = name;
    this.description = description;
  }
}

export interface Accolades { kills: number }
export type GameStatus = "Continue" | "Exit" | "PlayerDead" | "Win" | "PartialWin"

export interface NewGameInfo { kind: "NewGameInfo"; name: string; gender: Personality.Gender }
export interface LoadGameInfo { kind: "LoadGameInfo"; }