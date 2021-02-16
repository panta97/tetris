import Board from "./Board";
import Group from "./enums/Group";
import Pixel from "./Pixel";

class Animation {
  private stateDelete = {
    blinkingColors: [Group.orange, Group.black],
    pixels: [] as Pixel[][],
    step: 0,
    untilStep: 2,
  };

  constructor() {}

  private copyPixels(rowsToDelete: number[], board: Board) {
    let pixels: Pixel[][] = [];
    for (let y = 0; y < board.ROWS; y++) {
      for (let rd = 0; rd < rowsToDelete.length; rd++) {
        if (y === rowsToDelete[rd]) {
          // copy by value
          pixels.push(board.board[y].map((p: Pixel) => Object.assign({}, p)));
        }
      }
    }
    return pixels;
  }

  // there could be multiple deletions at a time
  deleteFullRows(rowsToDelete: number[], board: Board) {
    const state = this.stateDelete;
    // there are no rows to be deleted
    if (rowsToDelete.length < 0) {
      return;
      // there are rows and step is starting step = 0
    } else if (rowsToDelete.length > 0 && state.step === 0) {
      // populate pixels
      state.pixels = this.copyPixels(rowsToDelete, board);
      // set color
      state.pixels.forEach((row: Pixel[]) => {
        row.forEach(
          (px: Pixel) => (px.group = state.blinkingColors[state.step % 2])
        );
      });

      state.step += 1;

      // animation blinking has begun
    } else if (state.step > 0 && state.step < state.untilStep) {
      // set color
      state.pixels.forEach((row: Pixel[]) => {
        row.forEach(
          (px: Pixel) =>
            (px.group =
              state.blinkingColors[state.step % state.blinkingColors.length])
        );
      });

      state.step += 1;
      // animation has reached end
    } else if (state.step === state.untilStep) {
      // reset object delete state
      state.pixels = [];
      state.step = 0;
    }
  }

  getRowsToDelete() {
    return this.stateDelete.pixels;
  }
}

export default Animation;
