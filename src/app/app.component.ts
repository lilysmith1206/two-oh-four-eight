import { Component } from '@angular/core';
import { BoardService } from './shared/services/board.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private boardService: BoardService) {

  }
  // title = 'two-oh-four-eight';
}
