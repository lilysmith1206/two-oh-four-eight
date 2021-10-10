export class Tile {
  // tile value; 2, 4, 8, etc
  public value: number;
  // if it's a newly created tile
  public isNew: boolean = false;
  // sets if tile was created during a merge event during movement
  public hasMerged: boolean = false;

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
