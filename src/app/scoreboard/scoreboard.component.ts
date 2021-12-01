import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BoardService } from '../shared/services/board.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  public scoreSubscriber: Subscription;
  private scoreStoreListener: Subscription;
  public topFive: number[] = [];

  score: number = 0;
  constructor(private boardService: BoardService) {
    // this.ngOnInit()

  }



  ngOnInit(): void {
    this.scoreSubscriber = this.boardService.scoreUpdated.subscribe((score: number) =>
    {
      this.score += score;
    });

    if (window.localStorage.getItem('leaderboard')) {
      this.topFive = JSON.parse(window.localStorage.getItem('leaderboard'));
    }
    else {
      this.topFive = [0,0,0,0,0];
    }
    if (window.localStorage.getItem('score')) {
      this.score = Number(window.localStorage.getItem('score'));
      this.boardService.score = this.score;
    }

    this.scoreStoreListener = this.boardService.gameHasMoves.subscribe( (hasMoves) => {
      if (!hasMoves) {

        this.topFive.push(this.score);

        this.topFive.sort((a, b) => (b - a));

        this.topFive.pop();

        window.localStorage.setItem('leaderboard', JSON.stringify(this.topFive));
      }
    })
  }

  ngOnDestroy(): void {
    this.scoreStoreListener.unsubscribe();
  }

  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    window.localStorage.setItem('leaderboard', JSON.stringify(this.topFive.sort( (a, b) => (b - a))));
    window.localStorage.setItem('score', String(this.boardService.score));
  }

}
