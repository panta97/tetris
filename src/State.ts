import Direction from "./enums/Direction";
import { ETetromino } from "./enums/Tetromino";
import { Shape, ShapeBluePrint } from "./Shape";

// handle shapes creation
// handle score
class State {
  private shapes: Shape[];
  private width: number;

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
}

export default State;
