import Group from "./enums/Group";
import Direction from "./enums/Direction";
import { Shape, ShapeBluePrint as SHAPE_BP } from "./Shape";
import Board from "./Board";
import CanvasRender from "./Render";

interface GameOptions {
  width: number;
  height: number;
  pixelSize: number;
  canvasId: string;
}

class Game {
  private board: Board;
  private width: number;
  private height: number;
  private currentShape: Shape;
  private canvas: CanvasRender;

  constructor(gameops: GameOptions) {
    this.width = gameops.width;
    this.height = gameops.height;
    this.board = new Board(this.height, this.width);
    this.currentShape = SHAPE_BP.createShape();
    this.canvas = new CanvasRender(
      gameops.canvasId,
      this.width,
      this.height,
      gameops.pixelSize
    );
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

  render() {
    this.canvas.clear();
    this.canvas.draw(this.board.board);
    this.canvas.draw(this.currentShape.pixels);
  }
}
const game = new Game({
  width: 10,
  height: 20,
  pixelSize: 25,
  canvasId: "board",
});

game.render();

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
  game.render();
});
