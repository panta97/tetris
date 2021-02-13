import Group from "./enums/Group";

class Pixel {
  constructor(
    public posX: number,
    public posY: number,
    public group: Group,
    public isCenter?: boolean
  ) {}

  updateCoords(posX: number, posY: number) {
    this.posX += posX;
    this.posY += posY;
  }
}

export default Pixel;
