import Group from "./enums/Group";
import { ETetromino } from "./enums/Tetromino";
import Pixel from "./Pixel";
import { Shape } from "./Shape";

class CanvasRender {
  private context: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(
    canvasId: string,
    width: number,
    height: number,
    private pixelSize: number
  ) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.context = canvas.getContext("2d")!;
    canvas.width = width * pixelSize;
    canvas.height = height * pixelSize;
    this.width = width;
    this.height = height;
    this.context.translate(0.5, 0.5);
  }

  load() {
    // load all of the arrays of pixels
    // and draw only once
    return "";
  }

  draw(pixels: any[]) {
    const flatPixels = pixels.flatMap((e: any) => e) as Pixel[];
    flatPixels.forEach((p: Pixel) => {
      this.context.strokeStyle = "black";
      if (p.group === Group.Empty) {
        this.context.fillStyle = "white";
      } else {
        this.context.fillStyle = Group[p.group];
      }

      // pixel color
      this.context.fillRect(
        p.posX * this.pixelSize,
        p.posY * this.pixelSize,
        this.pixelSize,
        this.pixelSize
      );
      // pixel border
      this.context.strokeRect(
        p.posX * this.pixelSize,
        p.posY * this.pixelSize,
        this.pixelSize,
        this.pixelSize
      );
    });
  }

  clear() {
    this.context.clearRect(
      0,
      0,
      this.width * this.pixelSize,
      this.height * this.pixelSize
    );
  }
}

// responsible of showing game stats
class DomRender {
  private statsEl: HTMLDivElement;
  private nextShapeEl: HTMLDivElement;
  private nextShapeBoard: HTMLDivElement[];
  private scoreEl: HTMLParagraphElement;
  constructor(elementID: string) {
    this.statsEl = document.getElementById(elementID) as HTMLDivElement;
    this.nextShapeEl = this.statsEl.querySelector(
      ".next-shape"
    ) as HTMLDivElement;
    this.nextShapeBoard = [...this.nextShapeEl.children] as HTMLDivElement[];
    this.scoreEl = this.statsEl.querySelector(
      ".score-points"
    ) as HTMLParagraphElement;
  }

  private positionMiddle(x: number, y: number, type: ETetromino) {
    switch (type) {
      case ETetromino.J:
      case ETetromino.L:
      case ETetromino.S:
      case ETetromino.T:
      case ETetromino.Z:
        y += 1;
        break;
      case ETetromino.I:
        y += 2;
        break;
      case ETetromino.O:
        x += 1;
        y += 1;
        break;
    }
    return y * 4 + x;
  }

  drawNextShape(shape: Shape) {
    // clean old next shape
    this.nextShapeBoard.forEach((ele) => {
      (ele as HTMLDivElement).style.backgroundColor = "white";
    });

    shape.pixels.forEach((p) => {
      let index = this.positionMiddle(p.posX, p.posY, shape.type);
      (this.nextShapeBoard[index] as HTMLDivElement).style.backgroundColor =
        Group[p.group];
    });
  }

  updateScore(newScore: number) {
    this.scoreEl.textContent = String(newScore).padStart(7, "0");
  }
}

export { CanvasRender, DomRender };
