import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { borderColours, constants } from '../libraries/constants';
import { BoardService } from '../services/board.service';
import { Theme, ThemeService } from '../services/theme.service';

@Directive({
  selector: '[gameDirective]'
})
export class GameDirective implements OnInit {
  // width and height based on TILE LENGTH AND HEIGHT AND BOARD LENGTH AND HEIGHT

  constructor(private renderer: Renderer2,
    private elRef: ElementRef,
    private boardService: BoardService,
    private themeService: ThemeService
  ) {
    this.themeService.themeChange.pipe(
      tap((theme: Theme) => {
        this.renderer.setStyle(this.el, 'background-color', borderColours[theme].backgroundColor);
        this.renderer.setStyle(this.el, 'border', borderColours[theme].border);
      })
    ).subscribe();
  }

  ngOnInit(): void {
    const height = constants.board.height * constants.tiles.height
      + constants.board.border * 2
      + constants.board.margin * (constants.board.height - 2);

    const width = constants.board.width * constants.tiles.width
      + constants.board.border * 2
      + constants.board.margin * (constants.board.width - 2);
    
    this.renderer.setStyle(this.el, 'width', width + 'px');
    this.renderer.setStyle(this.el, 'height', height + 'px');
    // border: outset 3px #aaa;
    this.renderer.setStyle(this.el, 'background-color', borderColours[this.boardService.theme].backgroundColor);
    this.renderer.setStyle(this.el, 'border', borderColours[this.boardService.theme].border);
  }

  get el() {
    return this.elRef.nativeElement;
  }
}
