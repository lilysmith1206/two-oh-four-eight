import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BoardService } from '../game/shared/board.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit {
  public scoreSubscriber: Subscription;
  score: number = 0;
  constructor(private boardService: BoardService) {
    this.scoreSubscriber = boardService.scoreUpdated.subscribe((score: number) =>
    {
      this.score = score;
    });
  }



  ngOnInit(): void {
  }

}
