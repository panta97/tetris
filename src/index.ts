import Animation from "./Animation";
import Board from "./Board";
import Direction from "./enums/Direction";
import { ETetromino } from "./enums/Tetromino";
import CanvasRender from "./Render";
import { Shape, ShapeBluePrint as SHAPE_BP } from "./Shape";

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
  // update rates
  private bFps = 2;
  private scheduleBoard: boolean = false;
  private aFps = 20;
  private scheduleAnimation: boolean = false;

  constructor(gameops: GameOptions) {
    this.width = gameops.width;
    this.height = gameops.height;
    this.board = new Board(this.height, this.width);
    this.currentShape = this.createShape();
    this.canvas = new CanvasRender(
      gameops.canvasId,
      this.width,
      this.height,
      gameops.pixelSize
    );
    this.animation = new Animation();
  }

  private createShape() {
    const newShape = SHAPE_BP.createShape();
    // move shape to the middle of board
    const fixPos = newShape.type === ETetromino.O ? 1 : 2;
    newShape.move(Direction.RIGHT, this.width / 2 - fixPos);
    return newShape;
  }

  private nextMove(dir: Direction) {
    if (!this.board.shouldMoveShape(this.currentShape, dir)) {
      return;
    }

    if (this.board.shouldAddShape(this.currentShape, dir)) {
      this.board.addShape(this.currentShape);
      this.currentShape = this.createShape();
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
    this.currentShape = this.createShape();
  }

  // update board state
  private update(type: UpdateType, param?: Direction | boolean) {
    switch (type) {
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
  }

  // update animation state
  private updateAnimation() {
    const rowsToDelete = this.board.getFullRows();
    this.animation.deleteFullRows(rowsToDelete, this.board);
    const step = this.animation.stateDelete.step;
    // we update the board after the animation is complete
    if (step === 0) {
      this.board.deleteFullRows(rowsToDelete);
    }
  }

  // controlled by the machine
  updateAuto(type: UpdateType, param?: Direction | boolean) {
    // debouncing board
    if (!this.scheduleBoard) {
      setTimeout(() => {
        this.update(type, param);
        this.scheduleBoard = false;
      }, 1000 / this.bFps);
    }
    this.scheduleBoard = true;

    // deboucing animation
    if (!this.scheduleAnimation) {
      setTimeout(() => {
        this.updateAnimation();
        this.scheduleAnimation = false;
      }, 1000 / this.aFps);
    }
    this.scheduleAnimation = true;
  }

  // controlled by the player
  updateGame(type: UpdateType, param?: Direction | boolean) {
    this.update(type, param);
  }

  render() {
    // this.canvas.clear();
    this.canvas.draw(this.board.board);
    this.canvas.draw(this.currentShape.pixels);
    this.canvas.draw(this.animation.getRowsToDelete());
  }
}
const game = new Game({
  width: 10,
  height: 24,
  pixelSize: 25,
  canvasId: "board",
});

game.render();

let animationId;
let fps = 60;

function autoMove() {
  setTimeout(() => {
    game.updateAuto(UpdateType.nextMove, Direction.DOWN);
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
    case "j":
    case "Left":
    case "ArrowLeft":
      game.updateGame(UpdateType.nextMove, Direction.LEFT);
      break;
    case "l":
    case "Right":
    case "ArrowRight":
      game.updateGame(UpdateType.nextMove, Direction.RIGHT);
      break;
    case "k":
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
