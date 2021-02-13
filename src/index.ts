import { forEachTrailingCommentRange } from "../node_modules/typescript/lib/typescript";

enum Group {
  Empty,
  red,
  green,
  blue,
}

class Pixel {
  constructor(
    public posX: number,
    public posY: number,
    public group: Group,
    public isCenter?: boolean
  ) {}

  updateCoords(posX: number, posY: number) {
    this.posX += posX;
    this.posY += posY;
  }
}

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

class ShapeBluePrint {
  private bluePrints: string[] = [
    `__#
     #@#`,
    `_##
      #@_
     `,
    `#__
      #@#
     `,
    `#@##`,
    `_#_
      #@#`,
    `##_
       _@#`,
    `##
       @#`,
  ];
  constructor() {}

  private getRandomBluePrint(): String[] {
    const randBP = this.bluePrints[
      Math.floor(Math.random() * this.bluePrints.length)
    ];

    if (randBP.indexOf("\n") > -1) {
      return randBP
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s !== "");
    } else {
      return [randBP];
    }
  }

  createShape() {
    const bluePrint = this.getRandomBluePrint();
    const randGroup = Math.floor(
      Math.random() *
        (Object.keys(Group).filter((e) => isNaN(e as any)).length - 1) +
        1
    );
    const pixels: Pixel[] = [];
    for (let y = 0; y < bluePrint.length; y++) {
      for (let x = 0; x < bluePrint[y].length; x++) {
        if (bluePrint[y][x] === "#") {
          const newPixel = new Pixel(x, y, randGroup as Group, false);
          pixels.push(newPixel);
        }
        if (bluePrint[y][x] === "@") {
          const newPixel = new Pixel(x, y, randGroup as Group, true);
          pixels.push(newPixel);
        }
      }
    }
    return pixels;
  }
}

class Shape {
  private offsetStep: { [index: number]: number[] } = {
    0: [0, 0],
    1: [0, -1],
    2: [-1, -1],
    3: [-1, 0],
  };

  public rotationStep: number;
  constructor(public pixels: Pixel[]) {
    this.rotationStep = 0;
  }

  move(dir: Direction, extend: number = 1) {
    let moveX: number = 0,
      moveY: number = 0;
    switch (dir) {
      case Direction.UP:
        moveY -= extend;
        break;
      case Direction.DOWN:
        moveY += extend;
        break;
      case Direction.LEFT:
        moveX -= extend;
        break;
      case Direction.RIGHT:
        moveX += extend;
        break;
    }
    this.pixels.forEach((p: Pixel) => p.updateCoords(moveX, moveY));
  }

  // rotate clockwise or counterclockwise
  rotate(clockwise: boolean) {
    // rotation angle 90 degress
    const rAgl = Math.PI / 2;

    const { posX: cpx, posY: cpy } = this.pixels.filter((p) => p.isCenter)[0];
    for (let i = 0; i < this.pixels.length; i++) {
      if (this.pixels[i].isCenter) continue;

      const pxl = this.pixels[i];
      const [px, py] = [pxl.posX, pxl.posY];

      // get center distance
      const cd = Math.max(Math.abs(cpx - px), Math.abs(cpy - py));
      // step angle
      // example for cd=1 will be 45 degress
      const sAgl = Math.PI / (4 * cd);

      // circle
      for (let c = 0; c < 8 * cd; c++) {
        const startX = Math.round(Math.cos(sAgl * c) * cd);
        const endX = Math.round(
          Math.cos(sAgl * c + (clockwise ? rAgl : -rAgl)) * cd
        );
        const startY = Math.round(Math.sin(sAgl * c) * cd);
        const endY = Math.round(
          Math.sin(sAgl * c + (clockwise ? rAgl : -rAgl)) * cd
        );

        if (cpx - px === 0 - startX && cpy - py === 0 - startY) {
          pxl.posX += endX - startX;
          pxl.posY += endY - startY;
          break;
        }
      }
    }
    this.updateOffset(clockwise);
  }

  private updateOffset(clockwise: boolean) {
    // javascript negative modulo bug
    // correct implementation
    function mod(n: number, m: number) {
      return ((n % m) + m) % m;
    }

    // set offset
    const nextRotStep: number = clockwise
      ? this.rotationStep + 1
      : this.rotationStep - 1;

    const [moveToX, moveToY] = this.offsetStep[mod(nextRotStep, 4)];
    const [moveFromX, moveFromY] = this.offsetStep[mod(this.rotationStep, 4)];
    const direct = [moveToX - moveFromX, moveToY - moveFromY];

    if (direct[0] === 0 && direct[1] === 1) {
      this.move(Direction.DOWN);
    } else if (direct[0] === 0 && direct[1] === -1) {
      this.move(Direction.UP);
    } else if (direct[0] === -1 && direct[1] === 0) {
      this.move(Direction.RIGHT);
    } else if (direct[0] === 1 && direct[1] === 0) {
      this.move(Direction.LEFT);
    }

    // update rotation step
    this.rotationStep = nextRotStep;
  }

  getClone(): Shape {
    const clonedPixels: Pixel[] = [];
    for (let i = 0; i < this.pixels.length; i++) {
      const currShp = this.pixels[i];
      const clondePixel: Pixel = new Pixel(
        currShp.posX,
        currShp.posY,
        currShp.group,
        currShp.isCenter
      );
      clonedPixels.push(clondePixel);
    }
    const clonedShape = new Shape(clonedPixels);
    clonedShape.rotationStep = this.rotationStep;
    return clonedShape;
  }
}

class Board {
  public board: Pixel[][] = [];
  public ROWS: number;
  public COLS: number;
  constructor(xSize: number, ySize: number) {
    this.COLS = ySize;
    this.ROWS = xSize;
    // initialize board
    // blank pixel
    for (let y = 0; y < this.ROWS; y++) {
      const row: Pixel[] = [];
      for (let x = 0; x < this.COLS; x++) {
        row.push(new Pixel(x, y, Group.Empty));
      }
      this.board.push(row);
    }
  }

  // this method should be called after shaped is rotated
  wallKick(shape: Shape) {
    // fix position if it's outside board boudaries
    let minOffsetX = 0,
      maxOffsetX = 0,
      minOffsetY = 0,
      maxOffsetY = 0;

    for (let px = 0; px < shape.pixels.length; px++) {
      const pixel = shape.pixels[px];
      if (pixel.posX < 0 || pixel.posX > this.COLS - 1) {
        minOffsetX = Math.min(pixel.posX, minOffsetX);
        maxOffsetX = Math.max(pixel.posX, maxOffsetX);
      }
      if (pixel.posY < 0 || pixel.posY > this.ROWS - 1) {
        minOffsetY = Math.min(pixel.posY, minOffsetY);
        maxOffsetY = Math.max(pixel.posY, maxOffsetY);
      }
    }

    if (minOffsetX < 0) shape.move(Direction.RIGHT, Math.abs(minOffsetX));
    if (maxOffsetX > this.COLS - 1)
      shape.move(Direction.LEFT, maxOffsetX - (this.COLS - 1));
    if (minOffsetY < 0) shape.move(Direction.DOWN, Math.abs(minOffsetY));
    if (maxOffsetY > this.ROWS - 1)
      shape.move(Direction.UP, maxOffsetY - (this.ROWS - 1));
  }

  shouldMoveShape(shape: Shape, nextMove: Direction) {
    const clonedShape = shape.getClone();
    clonedShape.move(nextMove);

    // check if shape is outside the boundaries
    for (let px = 0; px < clonedShape.pixels.length; px++) {
      const pixel = clonedShape.pixels[px];
      //   only check for left and right boundary
      if (pixel.posX < 0 || pixel.posX > this.COLS - 1) {
        return false;
      }
    }

    // check if shape is collisioning horizontaly with board
    for (let y = 0; y < this.ROWS; y++) {
      for (let x = 0; x < this.COLS; x++) {
        if (this.board[y][x].group === Group.Empty) continue;

        for (let px = 0; px < clonedShape.pixels.length; px++) {
          const pixel = clonedShape.pixels[px];
          const prevPixel = shape.pixels[px];

          try {
            if (
              prevPixel.posY + 1 < this.ROWS &&
              this.board[prevPixel.posY + 1][prevPixel.posX].group ===
                Group.Empty
            ) {
              if (x === pixel.posX && y === pixel.posY) {
                return false;
              }
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    }

    return true;
  }

  shouldAddShape(shape: Shape, nextMove: Direction) {
    const clonedShape: Shape = shape.getClone();
    clonedShape.move(nextMove);
    // start at y 1 because [y - 1]
    for (let y = 1; y < this.ROWS; y++) {
      for (let x = 0; x < this.COLS; x++) {
        // shape has reached the bottom row
        if (y + 1 === this.ROWS) {
          for (let px = 0; px < clonedShape.pixels.length; px++) {
            if (y + 1 === clonedShape.pixels[px].posY) {
              return true;
            }
          }
        }

        if (this.board[y][x].group === Group.Empty) {
          continue;
        }

        // board pixel is on top
        if (this.board[y - 1][x].group === Group.Empty) {
          for (let px = 0; px < clonedShape.pixels.length; px++) {
            // check if pixel will overlap the board
            if (
              x === clonedShape.pixels[px].posX &&
              y === clonedShape.pixels[px].posY
            ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  addShape(shape: Shape) {
    for (let y = 0; y < this.ROWS; y++) {
      for (let x = 0; x < this.COLS; x++) {
        for (let px = 0; px < shape.pixels.length; px++) {
          if (y === shape.pixels[px].posY && x === shape.pixels[px].posX) {
            this.board[y][x].group = shape.pixels[px].group;
          }
        }
      }
    }
  }

  // in case there are single group rows
  // it will delete them
  deleteFullRows() {
    let rowsToDelete: number[] = [];

    // identify which rows should be deleted
    for (let y = 0; y < this.ROWS; y++) {
      const unique = new Set(this.board[y].map((p: Pixel) => p.group));
      if (unique.size === 1 && !unique.has(Group.Empty)) {
        rowsToDelete.push(y);
      }
    }

    let newBoard: Pixel[][] = [];
    for (let y = 0; y < this.ROWS; y++) {
      if (rowsToDelete.some((r) => r === y)) {
        continue;
      }
      newBoard.push(this.board[y]);
    }

    let missingRows: Pixel[][] = [];
    for (let y = 0; y < rowsToDelete.length; y++) {
      const row: Pixel[] = [];
      for (let x = 0; x < this.COLS; x++) {
        row.push(new Pixel(x, y, Group.Empty));
      }
      missingRows.push(row);
    }

    // add missing rows to the top
    newBoard = [...missingRows, ...newBoard];
    this.board = newBoard;
  }
}

interface GameOptions {
  width: number;
  height: number;
}

class Game {
  private board: Board;
  private SHAPE_BP: ShapeBluePrint;
  private width: number;
  private height: number;
  private currentShape: Shape;

  constructor(gameops: GameOptions) {
    this.width = gameops.width;
    this.height = gameops.height;
    this.board = new Board(this.height, this.width);
    this.SHAPE_BP = new ShapeBluePrint();
    this.currentShape = new Shape(this.SHAPE_BP.createShape());
  }

  nextMove(dir: Direction) {
    if (!this.board.shouldMoveShape(this.currentShape, dir)) {
      return;
    }

    if (this.board.shouldAddShape(this.currentShape, dir)) {
      this.board.addShape(this.currentShape);
      this.currentShape = new Shape(this.SHAPE_BP.createShape());
      this.currentShape.move(dir);
    } else {
      this.currentShape.move(dir);
    }
    this.board.deleteFullRows();
  }

  rotateShape(clockwise: boolean) {
    this.currentShape.rotate(clockwise);
    this.board.wallKick(this.currentShape);
  }

  render(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.clearRect(0, 0, canvas.width, canvas.height);
    const size = 20;
    // render shape
    for (let px = 0; px < this.currentShape.pixels.length; px++) {
      const group = this.currentShape.pixels[px].group;
      context.fillStyle = Group[group];
      context.fillRect(
        this.currentShape.pixels[px].posX * size,
        this.currentShape.pixels[px].posY * size,
        size,
        size
      );
    }
    // render board
    for (let y = 0; y < this.board.ROWS; y++) {
      for (let x = 0; x < this.board.COLS; x++) {
        const group = this.board.board[y][x].group;
        if (group === Group.Empty) continue;
        context.fillStyle = Group[group];
        context.fillRect(x * size, y * size, size, size);
      }
    }
  }
}
const game = new Game({ width: 10, height: 20 });
let canvas = document.querySelector("#board") as HTMLCanvasElement;
let context = canvas.getContext("2d") as CanvasRenderingContext2D;
game.render(canvas);

document.addEventListener("keydown", (e: KeyboardEvent) => {
  switch (e.key) {
    case "Down":
    case "ArrowDown":
      game.nextMove(Direction.DOWN);
      break;
    case "Up":
    case "ArrowUp":
      game.nextMove(Direction.UP);
      break;
    case "Left":
    case "ArrowLeft":
      game.nextMove(Direction.LEFT);
      break;
    case "Right":
    case "ArrowRight":
      game.nextMove(Direction.RIGHT);
      break;
    case "x":
      game.rotateShape(true);
      break;
    case "z":
      game.rotateShape(false);
      break;
  }
  game.render(canvas);
});
