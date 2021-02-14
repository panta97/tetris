import Direction from "./enums/Direction";
import Group from "./enums/Group";
import Pixel from "./Pixel";
import { bluePrints, ETetromino } from "./enums/Tetromino";

export class ShapeBluePrint {
  constructor() {}

  static getRandomBluePrint() {
    // const randBP = this.bluePrints[
    //   Math.floor(Math.random() * this.bluePrints.length)
    // ];
    const randBP = bluePrints[Math.floor(Math.random() * bluePrints.length)];
    return randBP;
  }

  static createShape() {
    const bluePrint = this.getRandomBluePrint();
    const pixelStr = bluePrint.pixelsStr;
    const randGroup = Math.floor(
      Math.random() *
        (Object.keys(Group).filter((e) => isNaN(e as any)).length - 1) +
        1
    );
    const pixels: Pixel[] = [];
    for (let y = 0; y < pixelStr.length; y++) {
      for (let x = 0; x < pixelStr[y].length; x++) {
        if (pixelStr[y][x] === "#") {
          const newPixel = new Pixel(x, y, randGroup as Group, false);
          pixels.push(newPixel);
        }
        if (pixelStr[y][x] === "@") {
          const newPixel = new Pixel(x, y, randGroup as Group, true);
          pixels.push(newPixel);
        }
      }
    }
    return new Shape(pixels, bluePrint.letter as ETetromino);
  }
}

export class Shape {
  private offsetStep: { [index: number]: [number, number] } = {
    // all ones should be negative
    0: [0, 0],
    1: [0, -1],
    2: [-1, -1],
    3: [-1, 0],
  };

  public rotationStep: number;
  constructor(public pixels: Pixel[], public type: ETetromino) {
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

  // same as move but using coordinates
  moveCoords(fromCoord: [number, number], toCoord: [number, number]) {
    // [x, y]
    let [moveX, moveY] = [toCoord[0] - fromCoord[0], toCoord[1] - fromCoord[1]];

    moveX *= -1; //FIXME: something is wrong with my coords
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

    const fromCoord = this.offsetStep[mod(this.rotationStep, 4)];
    const toCoord = this.offsetStep[mod(nextRotStep, 4)];

    // only apply offset for I and O types (tetrominos)
    if (this.type === ETetromino.I || this.type === ETetromino.O)
      this.moveCoords(fromCoord, toCoord);

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
    const clonedShape = new Shape(clonedPixels, this.type);
    clonedShape.rotationStep = this.rotationStep;
    return clonedShape;
  }
}
