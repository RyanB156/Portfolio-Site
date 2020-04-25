import { Result } from './result'

export namespace Personality {

  export type Gender = "Male" | "Female" | "Other"
  export type Sexuality = "Straight" | "Gay" | "Bisexual"

  export type Ethics = "ELawful" | "ENeutral" | "EChaotic"
  export type Morality = "MBlue" | "MGrey" | "MRed"

  export type Attraction = "Love" | "ANeutral" | "Hate"
  export type Trust = "TFull" | "TTrust" | "TNeutral" | "TDoubt" | "TMistrust"
  export type Mood = "MElated" | "MHappy" | "Mneutral" | "MSad" | "MDepressed"
  export type Bravery = "BFearful" | "BNeutral" | "BBrave"
  export type Fear = "FNormal" | "FTimid" | "FShaken" | "FTerrified"

  export interface Up { kind: "Up"; value: number; }
  export interface Down { kind: "Down"; value: number; }
  export type Adjustment = Up | Down

  export function makeAttractionP(attrValue, value) : AttractionP { return { kind: "AttractionP", class: attrValue, value: value } };
  export function makeTrustP(attrValue, value) : TrustP { return { kind: "TrustP", class: attrValue, value: value } };
  export function makeMoodP(attrValue, value) : MoodP { return { kind: "MoodP", class: attrValue, value: value } };
  export function makeFearP(attrValue, value) : FearP { return { kind: "FearP", class: attrValue, value: value } };

  export interface AttractionP { kind: "AttractionP"; class: Attraction; value: number }
  export interface TrustP { kind: "TrustP"; class: Trust; value: number }
  export interface MoodP { kind: "MoodP"; class: Mood; value: number }
  export interface FearP { kind: "FearP"; class: Fear; value: number }

  export interface Personality {
    attraction: AttractionP;
    trust: TrustP;
    mood: MoodP;
    fear: FearP;
    ethics: Ethics;
    morality: Morality;
    bravery: Bravery;
  }

  export function makePersonality(attraction, trust, mood, fear, ethics, morality, bravery) : Personality {
    return { 
      attraction: { kind: "AttractionP", class: intToAttraction(attraction), value: attraction },
      trust: { kind: "TrustP", class: intToTrust(trust), value: trust },
      mood: { kind: "MoodP", class: intToMood(mood), value: mood },
      fear: { kind: "FearP", class: intToFear(fear), value: fear },
      ethics: ethics,
      morality: morality,
      bravery: bravery
    };
  }

  export function adjuster<T, U>(f: (x:number) => T, maker: (p: T, v: number) => U, adjustment: Adjustment, min, max, stat, statStr) : Result.Result<U> {
    function adjustMin(x) { x < 0 ? 0 : x; }
    function adjustMax(x) { x > 10 ? 10 : x; }
    let level: number = stat.value;
    switch (adjustment.kind) {
      case "Down":
        return level > min ? Result.makeSuccess( maker(f(level - adjustment.value), level - adjustment.value) )
          : Result.makeFailure(`${statStr} cannot go any lower`);
      case "Up":
        return level < max ? Result.makeSuccess( maker(f(level + adjustment.value), level + adjustment.value) )
          : Result.makeFailure(`${statStr} cannot go any higher`);
    }
  }

  export function intToAttraction(x) : Attraction {
    if (x === 0) return "Hate";
    else if (x >= 10) return "Love";
    else return "ANeutral";
  }

  export function adjustAttraction(adjustment: Adjustment, attrStat: AttractionP) : Result.Result<AttractionP> {
    return adjuster<Attraction, AttractionP>(intToAttraction, makeAttractionP, adjustment, 0, 10, attrStat, "Attraction");
  }

  export function intToTrust(x) : Trust {
    if (x >= 10) return "TFull";
    else if (x >= 8) return "TTrust";
    else if (x >= 3) return "TNeutral";
    else if (x >= 1) return "TDoubt";
    else return "TMistrust";
  }

  export function adjustTrust(adjustment: Adjustment, trustStat: TrustP) : Result.Result<TrustP> {
    return adjuster<Trust, TrustP>(intToTrust, makeTrustP, adjustment, 0, 10, trustStat, "Trust");
  }

  export function intToMood(x) {
    if (x >= 10) return "MElated";
      else if (x >= 7) return "MHappy";
      else if (x >= 4) return "Mneutral";
      else if (x >= 1) return "MSad";
      else return "MDepressed";
  }

  export function adjustMood(adjustment: Adjustment, moodStat: MoodP) : Result.Result<MoodP> {
    return adjuster<Mood, MoodP>(intToMood, makeMoodP, adjustment, 0, 10, moodStat, "Mood");
  }

  export function intToFear(x) {
    if (x >= 10) return "FTerrified";
      else if (x >= 6) return "FShaken";
      else if (x >= 2) return "FTimid";
      else return "FNormal";
  }

  export function adjustFear(adjustment: Adjustment, fearStat: FearP) : Result.Result<FearP> {
    return adjuster<Fear, FearP>(intToFear, makeFearP, adjustment, 0, 10, fearStat, "Fear");
  }


}

