import Direction from "./enums/Direction";
import Group from "./enums/Group";
import Pixel from "./Pixel";

export class ShapeBluePrint {
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

export class Shape {
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
