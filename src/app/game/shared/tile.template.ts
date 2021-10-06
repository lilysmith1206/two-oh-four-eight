export class Tile {
  value: number;
  constructor(public isEmpty: boolean, private initialValue: number) {
    if (this.isEmpty) {
      this.value = 1;
    }
    else {
      if (initialValue > 1) {
        this.value = initialValue;
      }
      else {
        let randomNum: number = Math.random();
        if (randomNum < 0.98 ) {
          this.value = 2;
        }
        else {
          this.value = 4;
        }
      }
    }
  }
}
