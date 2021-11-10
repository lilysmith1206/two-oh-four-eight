import { Directive, Input, Renderer2, ElementRef, HostListener, OnInit } from '@angular/core';
import { BoardService } from './board.service';
import { Tile } from './tile.template';

@Directive({
  selector: '[RestartDirective]'
})
export class RestartDirective implements OnInit {
  @Input() gamePlaying: Boolean;
  intervalID;
  ngOnInit() {

  }

  constructor(private elRef: ElementRef, private renderer: Renderer2, private boardService: BoardService) {
    renderer.addClass(this.elRef.nativeElement, 'hide');
      this.intervalID = setInterval(() => {
        if (!this.gamePlaying) {
        clearInterval(this.intervalID);
        this.renderer.removeClass(this.elRef.nativeElement, 'hide');
        this.styleRestartButton();
        }
      }, 500);
  }

  styleRestartButton() {
    const el: Element = this.elRef.nativeElement;
    this.renderer.addClass(el, 'show');
  }

  @HostListener('click') resetButton() {
    this.renderer.removeClass(this.elRef.nativeElement, 'show');
    this.renderer.addClass(this.elRef.nativeElement, 'hide');
      this.intervalID = setInterval(() => {
        if (!this.gamePlaying) {
        clearInterval(this.intervalID);
        this.renderer.removeClass(this.elRef.nativeElement, 'hide');
        this.styleRestartButton();
        }
      }, 500);
  }
}
