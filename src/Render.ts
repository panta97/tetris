import Group from "./enums/Group";
import { ETetromino } from "./enums/Tetromino";
import Pixel from "./Pixel";
import { Shape } from "./Shape";

class CanvasRender {
  private context: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private pixelRatio = Math.round(window.devicePixelRatio) || 1;

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
    this.fixBlur();
  }

  private fixBlur() {
    this.context.translate(0.5, 0.5);
    const width = this.context.canvas.width * this.pixelRatio;
    const height = this.context.canvas.height * this.pixelRatio;
    this.context.canvas.width = width;
    this.context.canvas.height = height;
    this.context.canvas.style.width =
      Math.round(width / this.pixelRatio) + "px";
    this.context.canvas.style.height =
      Math.round(height / this.pixelRatio) + "px";
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
        p.posX * this.pixelSize * this.pixelRatio,
        p.posY * this.pixelSize * this.pixelRatio,
        this.pixelSize * this.pixelRatio,
        this.pixelSize * this.pixelRatio
      );
      // pixel border
      this.context.strokeRect(
        p.posX * this.pixelSize * this.pixelRatio,
        p.posY * this.pixelSize * this.pixelRatio,
        this.pixelSize * this.pixelRatio,
        this.pixelSize * this.pixelRatio
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
  private speedEl: HTMLParagraphElement;
  private levelEl: HTMLParagraphElement;
  constructor(elementID: string) {
    this.statsEl = document.getElementById(elementID) as HTMLDivElement;
    this.nextShapeEl = this.statsEl.querySelector(
      ".next-shape"
    ) as HTMLDivElement;
    this.nextShapeBoard = [...this.nextShapeEl.children] as HTMLDivElement[];
    this.scoreEl = this.statsEl.querySelector(
      ".score-points"
    ) as HTMLParagraphElement;
    this.speedEl = this.statsEl.querySelector("#speed") as HTMLParagraphElement;
    this.levelEl = this.statsEl.querySelector("#level") as HTMLParagraphElement;
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

  updateScore(score: number) {
    this.scoreEl.textContent = String(score).padStart(7, "0");
  }

  updateLevel(level: number) {
    this.levelEl.textContent = String(level).padStart(2, "0");
  }

  updateSpeed(speed: number) {
    this.speedEl.textContent = String(speed).padStart(2, "0");
  }
}

export { CanvasRender, DomRender };
