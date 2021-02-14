export enum ETetromino {
  J = "J",
  L = "L",
  S = "S",
  T = "T",
  Z = "Z",
  I = "I",
  O = "O",
}

export class Tetromino {
  public pixelsStr: string[];
  constructor(public letter: string, rawString: string) {
    this.pixelsStr = this.transform(rawString);
  }

  private transform(rawString: string): string[] {
    if (rawString.indexOf("\n") > -1) {
      return rawString
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s !== "");
    } else {
      return [rawString];
    }
  }
}

// prettier-ignore

export const bluePrints: Tetromino[] = [
  new Tetromino('J', `#__
                      #@#`),

  new Tetromino('L', `__#
                      #@#`),

  new Tetromino('S', `_##
                      #@_`),

  new Tetromino('T', `_#_
                      #@#`),

  new Tetromino('Z', `##_
                      _@#`),

  new Tetromino('I', `#@##`),

  new Tetromino('O', `##
                      @#`),
]
