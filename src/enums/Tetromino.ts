import mod from "../utils/Mod";

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

export type Coord = [number, number];

// prettier-ignore
export class OffsetData {
  static letterALL: Coord[][] = [
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    [ [0, 0], [1, 0], [1, -1], [0, 2], [1, 2] ],
    [ [0, 0], [0, 0], [0, 0], [0, 0], [0, 0] ],
    [ [0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2] ],
  ];
  static letterI: Coord[][] = [
    [ [0, 0], [-1, 0], [2, 0], [-1, 0], [2, 0] ],
    [ [-1, 0], [0, 0], [0, 0], [0, 1], [0, -2] ],
    [ [-1, 1], [1, 1], [-2, 1], [1, 0], [-2, 0] ],
    [ [0, 1], [0, 1], [0, 1], [0, -1], [0, 2] ],
  ];
  static letterO: Coord[][] = [
    [ [0, 0]],
    [ [0, -1]],
    [ [-1, -1]],
    [ [-1, 0]],
  ];

  static getData(type: ETetromino, clockwise: boolean, step: number, attempt: number): [Coord, Coord]  {
    let moveCoor: [Coord, Coord];
    const stepTo = mod(step + (clockwise ? 1 : -1), 4)
    switch (type) {
      case ETetromino.J:
      case ETetromino.L:
      case ETetromino.S:
      case ETetromino.T:
      case ETetromino.Z:
        moveCoor = [this.letterALL[step][attempt], this.letterALL[stepTo][attempt]];
        break;
      case ETetromino.I:
        moveCoor = [this.letterI[step][attempt], this.letterI[stepTo][attempt]];
        break;
      case ETetromino.O:
        moveCoor = [this.letterO[step][attempt], this.letterO[stepTo][attempt]];
        break;
    }
    return moveCoor;
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
