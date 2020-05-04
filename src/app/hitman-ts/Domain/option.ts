
export namespace Option {
  export interface Some<T> {
    kind: "Some";
    value: T;
  }
  
  export interface None { 
    kind: "None";
  }
  
  export function makeSome<T>(value) : Some<T> {
    return { kind: "Some", value: value };
  }
  
  export function makeNone() : None {
    return { kind: "None" };
  }

  export function optionToString<T>(option: Option<T>) : string {
    if (option.kind === "Some")
      return `Some(${option.value})`;
    else
      return "None";
  }
  
  export type Option<T> = Some<T> | None
}
