import Group from "./enums/Group";
import Direction from "./enums/Direction";
import { Shape, ShapeBluePrint as SHAPE_BP } from "./Shape";
import Board from "./Board";
import CanvasRender from "./Render";
import Animation from "./Animation";

enum UpdateType {
  nextMove,
  rotate,
  hardDrop,
}

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
  private animation: Animation;

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
    this.animation = new Animation();
  }

  private nextMove(dir: Direction) {
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
  }

  private rotateShape(clockwise: boolean) {
    this.board.kick(this.currentShape, clockwise);
  }

  private hardDropShape() {
    this.board.hardDrop(this.currentShape);
    this.board.addShape(this.currentShape);
    this.currentShape = SHAPE_BP.createShape();
  }

  updateGame(type: UpdateType, param?: Direction | boolean) {
    switch(type) {
      case UpdateType.nextMove:
        this.nextMove(param as Direction);
      break;
      case UpdateType.rotate:
        this.rotateShape(param as boolean);
        break;
      case UpdateType.hardDrop:
        this.hardDropShape();
        break;
    }

    const fullRows = this.board.getFullRows();
    this.board.deleteFullRows(fullRows);
    this.animation.deleteFullRows(fullRows, this.board);
  }

  render() {
    this.canvas.clear();
    this.canvas.draw(this.board.board);
    this.canvas.draw(this.currentShape.pixels);
    this.canvas.draw(this.animation.getRowsToDelete());
  }
}
const game = new Game({
  width: 10,
  height: 20,
  pixelSize: 25,
  canvasId: "board",
});

game.render();

let animationId;
let fps = 2;

function autoMove() {
  setTimeout(() => {
    game.updateGame(UpdateType.nextMove, Direction.DOWN);
    game.render();
    animationId = requestAnimationFrame(autoMove);
  }, 1000 / fps);
}
// autoMove();

document.addEventListener("keydown", (e: KeyboardEvent) => {
  switch (e.key) {
    case "Down":
    case "ArrowDown":
      game.updateGame(UpdateType.nextMove, Direction.DOWN);
      break;
    case "Up":
    case "ArrowUp":
      game.updateGame(UpdateType.nextMove, Direction.UP);
      break;
    case "Left":
    case "ArrowLeft":
      game.updateGame(UpdateType.nextMove, Direction.LEFT);
      break;
    case "Right":
    case "ArrowRight":
      game.updateGame(UpdateType.nextMove, Direction.RIGHT);
      break;
    case "x":
      game.updateGame(UpdateType.rotate, true);
      break;
    case "z":
      game.updateGame(UpdateType.rotate, false);
      break;
    case " ":
      game.updateGame(UpdateType.hardDrop);
      break;
  }
  game.render();
});
