import Group from "./enums/Group";
import Direction from "./enums/Direction";
import { Shape, ShapeBluePrint as SHAPE_BP } from "./Shape";
import Board from "./Board";

interface GameOptions {
  width: number;
  height: number;
}

class Game {
  private board: Board;
  private width: number;
  private height: number;
  private currentShape: Shape;

  constructor(gameops: GameOptions) {
    this.width = gameops.width;
    this.height = gameops.height;
    this.board = new Board(this.height, this.width);
    this.currentShape = SHAPE_BP.createShape();
  }

  nextMove(dir: Direction) {
    if (!this.board.shouldMoveShape(this.currentShape, dir)) {
      return;
    }

    if (this.board.shouldAddShape(this.currentShape, dir)) {
      this.board.addShape(this.currentShape);
      this.currentShape = SHAPE_BP.createShape();
      this.currentShape.move(dir);
    } else {
      this.currentShape.move(dir);
    }
    this.board.deleteFullRows();
  }

  rotateShape(clockwise: boolean) {
    this.board.kick(this.currentShape, clockwise);
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
