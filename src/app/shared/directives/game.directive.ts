import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { CONSTANTS } from '../libraries/constants';

@Directive({
  selector: '[gameDirective]'
})
export class GameDirective extends CONSTANTS implements OnInit {
  // width and height based on TILE LENGTH AND HEIGHT AND BOARD LENGTH AND HEIGHT

  constructor(private renderer: Renderer2,
    private elRef: ElementRef,
  ) {
    super();
  }
  ngOnInit(): void {
    const height = this.CONSTS.board.height
      * this.CONSTS.tiles.height
      + this.CONSTS.board.border * 2
      + this.CONSTS.board.margin * this.CONSTS.board.height;
    const width = this.CONSTS.board.width
      * this.CONSTS.tiles.width
      + this.CONSTS.board.border * 2
      + this.CONSTS.board.margin * this.CONSTS.board.width;
    this.renderer.setStyle(this.el, 'width', width + 'px');
    this.renderer.setStyle(this.el, 'height', height + 'px');
  }

  get el() {
    return this.elRef.nativeElement;
  }
}
