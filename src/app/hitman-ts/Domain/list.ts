
import { Option } from './option';
import { Random } from './random';

export namespace List {
  
  export function arrayToString<T>(f: (x: T) => string, arr: T[]) {
    if (arr.length === 0)
      return "[]";
    else if (arr.length === 1)
      return `[${arr[0]}]`;
    else {
      let str = List.fold((s: string, x: T) => s + f(x) + ", ", "[", arr.slice(0, arr.length - 1));
      return str + f(arr[arr.length - 1]) + "]";
    }
  }
  
  // Returns a new array containing items from the original array mapped by the specified function.
  export function map<T, U>(f: (x: T) => U, arr: T[]) {
    let temp: U[] = [];
    arr.forEach(x => temp.push(f(x)));
    return temp;
  }

  // Thread an accumulator function over the specified list.
  export function fold<T, U>(f: (state: U, x: T) => U, initialState: U, arr: T[]) {
    arr.forEach((e: T) => {
      initialState = f(initialState, e);
    });
    return initialState;
  }

  export function reduce<T>(f: (x: T, y: T) => T, arr: T[]) {
    let acc: T = arr[0];
    for (let i = 1; i < arr.length; i++)
      acc = f(acc, arr[i]);
    return acc;
  }
  
  export function removeOne<T>(f: (x: T) => boolean, arr: T[]) {
    let removed = false;
    let temp: T[] = [];
    arr.forEach((e) => {
      if (!removed && f(e))
        removed = true;
      else
        temp.push(e);
    });
    return temp;
  }
  
  export function tryFind<T>(f: (x: T) => boolean, arr: T[]) : Option.Option<T> {
    for (let i = 0; i < arr.length; i++) {
      if (f(arr[i]))
        return Option.makeSome(arr[i]);
    }
    return Option.makeNone();
  }
  
  export function forAll<T>(f: (x: T) => boolean, arr: T[]) {
    if (arr.length == 0) return false;
    for (let i = 0; i < arr.length; i++) {
      if (!f(arr[i])) {
        return false;
      }
    }
    return true;
  }

  // Takes an element x and returns a list containing n copies of x.
  export function transformWeights<T>(n: number, x: T) : T[] {
    let temp: T[] = [];
    for (let i = 0; i < n; i++) {
      temp.push(x);
    }
    return temp;
  }

  export function randomChoice<T>(arr: T[]) {
    let choice = Random.nextInt(0, arr.length);
    return arr[choice];
  }

  // Count the number of elements in the list that match the specified element using the key generator function.
  export function countMatch<T, U>(keyGenerator: (x: T) => U, x: T, arr: T[]) {
    let keyVal = keyGenerator(x);
    let count = 0;
    arr.forEach((x) => {
      if (keyGenerator(x) === keyVal)
        count++;
    });
    return count;
  }

  // Count the number of elements in the list that satisfy the given predicate.
  export function countBy<T>(f: (x: T) => boolean, arr: T[]) {
    let count = 0;
    arr.forEach((e: T) => {
      if (f(e))
        count++;
    });
    return count;
  }
  
  export function distinctBy<T, U>(f: (x: T) => U, arr: T[]) : T[] {
    let temp: T[] = [];

    arr.forEach((x) => {
      if (countMatch(f, x, temp) === 0) {
        temp.push(x);
      }
    });
    return temp;
  }

  // For each element for which the given function returns true, replace that element with the specified item.
  export function replaceByWith<T>(f: (x: T) => boolean, x: T, arr: T[]) : T[] {
    console.log(JSON.stringify(arr));
    let temp: T[] = [];
    arr.forEach(e => {
      if(f(e)) {
        temp.push(x);
      } else {
        temp.push(e);
      }
    });
    return temp;
  }

  export function stringDiff(a: string, b: string) : number {
    let sim = 0, i = 0;
    while (i < a.length && i < b.length) {
      if (a[i] === b[i]) {
        sim++;
        i++;
      } else {
        break;
      }
    }
    return sim;
  }

}
