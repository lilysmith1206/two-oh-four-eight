import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from '../libraries/constants';
import { BoardService } from '../services/board.service';

@Directive({
  selector: '[gameDirective]'
})
export class GameDirective extends CONSTANTS implements OnInit, OnDestroy {
  // width and height based on TILE LENGTH AND HEIGHT AND BOARD LENGTH AND HEIGHT

  private themeUpdateListener: Subscription;
  private borderColours = {
    'light': '#aaa',
    'dark': '#999'
  };

  constructor(private renderer: Renderer2,
    private elRef: ElementRef,
    private boardService: BoardService
  ) {
    super();
  }

  ngOnInit(): void {
    const height = this.CONSTS.board.height
      * this.CONSTS.tiles.height
      + this.CONSTS.board.border * 1.5
      + this.CONSTS.board.margin * this.CONSTS.board.height;

    const width = this.CONSTS.board.width
      * this.CONSTS.tiles.width
      + this.CONSTS.board.border * 1.5
      + this.CONSTS.board.margin * this.CONSTS.board.width;

    this.renderer.setStyle(this.el, 'width', width + 'px');
    this.renderer.setStyle(this.el, 'height', height + 'px');

    // border: outset 3px #aaa;
    this.renderer.setStyle(this.el, 'border', `outset 3px ${this.borderColours[this.boardService.theme]}`);

    this.themeUpdateListener = this.boardService.themeUpdated.subscribe( () => {
      this.renderer.setStyle(this.el, 'background-color', this.boardService.colours[0].backgroundColor);
      this.renderer.setStyle(this.el, 'border', `outset 3px ${this.borderColours[this.boardService.theme]}`);
    })
  }

  ngOnDestroy(): void {
    this.themeUpdateListener.unsubscribe();
  }

  get el() {
    return this.elRef.nativeElement;
  }
}
