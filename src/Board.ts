import Direction from "./enums/Direction";
import Group from "./enums/Group";
import Pixel from "./Pixel";
import { Shape } from "./Shape";

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

export default Board;
