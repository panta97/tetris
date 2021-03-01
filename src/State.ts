import Direction from "./enums/Direction";
import { ETetromino } from "./enums/Tetromino";
import { Shape, ShapeBluePrint } from "./Shape";

// handle shapes creation
// handle scoring
class State {
  private shapes: Shape[];
  private width: number;
  private score: number = 0;
  private speed: number = 1;
  private level: number = 1;

  constructor(width: number) {
    this.width = width;
    this.shapes = [ShapeBluePrint.createShape()];
  }
  private moveMiddle(shape: Shape) {
    // move shape to the middle of board
    const fixPos = shape.type === ETetromino.O ? 1 : 2;
    shape.move(Direction.RIGHT, this.width / 2 - fixPos);
  }

  getNextShape() {
    return this.shapes.slice(-1)[0];
  }

  generateShape(): Shape {
    this.shapes.push(ShapeBluePrint.createShape());
    const newShape = this.shapes.shift()!;
    this.moveMiddle(newShape);
    return newShape;
  }

  getScore() {
    return this.score;
  }

  // add points base on deleted rows
  addPoints(rowsToDelete: number[]) {
    switch (rowsToDelete.length) {
      case 1:
        this.score += 40;
        break;
      case 2:
        this.score += 100;
        break;
      case 3:
        this.score += 300;
        break;
      case 4:
        this.score += 1200;
        break;
    }

    this.levelUp(Math.floor(this.score * 0.01) + 1);
  }

  private levelUp(level: number) {
    this.level = level;
    this.speed = level;
  }

  getLevel() {
    return this.level;
  }

  getSpeed() {
    return this.speed;
  }
}

export default State;
