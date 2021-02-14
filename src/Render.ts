import Group from "./enums/Group";
import Pixel from "./Pixel";

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
    this.width = width;
    this.height = height;
  }

  draw(pixels: any[]) {
    const flatPixels = pixels.flatMap((e: any) => e) as Pixel[];
    flatPixels.forEach((p: Pixel) => {
      if (p.group === Group.Empty) {
        this.context.fillStyle = "white";
      } else {
        this.context.fillStyle = Group[p.group];
      }

      this.context.fillRect(
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

export default CanvasRender;
