export class Tile {
  public value: number;
  public isNew: boolean = false;
  public hasMerged: boolean = false;

  constructor(public isEmpty?: boolean, private initialValue?: number) {
    if (this.isEmpty === undefined || this.isEmpty) {
      this.value = 1;
    }
    else {
      if (initialValue > 1) {
        this.value = initialValue;
      }
      else {
        let randomNum: number = Math.random();
        if (randomNum < 0.98) {
          this.value = 2;
        }
        else {
          this.value = 4;
        }
      }
    }
  }
}
