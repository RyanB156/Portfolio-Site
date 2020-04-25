export namespace Random {
  // return an integer on [a, b).
  
  export function nextInt(a, b) {
    a = Math.ceil(a);
    b = Math.floor(b);
    return Math.floor(Math.random() * (b - a) + a);
  }
}