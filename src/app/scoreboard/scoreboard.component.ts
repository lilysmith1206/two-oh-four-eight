import { Component, HostListener, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import { BoardService } from '../shared/services/board.service';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit {
  highScore: number = 0;
  displayedScore: number;
  readonly scoreIncrementTimer: {
    incrementAmount: number,
    loopedThrough: number,
    id: any;
  } = {
    incrementAmount: -1,
    loopedThrough: 0,
    id: -1
  };
  
  private currentScore: number = 0;

  constructor(private boardService: BoardService) {}

  ngOnInit() {
    this.boardService.score.pipe(
      tap(score => {
        this.currentScore += score;
        this.incrementScore(score);
      })
    ).subscribe();

    if (window.localStorage.getItem('high-score')) {
      this.highScore = Number(window.localStorage.getItem('high-score'));
    }
    else {
      this.highScore = 0;
    }

    if (window.localStorage.getItem('score')) {
      this.currentScore = Number(window.localStorage.getItem('score'));
      this.displayedScore = this.currentScore;
    }

    this.boardService.gameActive.pipe(
      tap(gameActive => {
        if (!gameActive && this.currentScore > this.highScore) {
          window.localStorage.setItem('high-score', String(this.currentScore));
        }
        this.currentScore = 0;
        this.displayedScore = 0;
      })
    ).subscribe();
  }

  incrementScore(score: number) {
    if (this.scoreIncrementTimer.id !== -1) {
      clearInterval(this.scoreIncrementTimer.id);
      this.scoreIncrementTimer.incrementAmount = this.currentScore - this.displayedScore + (score / 4);
    }
    else {
      this.scoreIncrementTimer.incrementAmount = score / 4;
    }

    this.scoreIncrementTimer.id = setInterval(() => {
      if (this.scoreIncrementTimer.loopedThrough < 4) {
        this.displayedScore += this.scoreIncrementTimer.incrementAmount;
        if (this.highScore < this.displayedScore) {
          this.highScore = this.displayedScore;
        }
        this.scoreIncrementTimer.loopedThrough++;
      }
      else {
        clearInterval(this.scoreIncrementTimer.id);
        this.scoreIncrementTimer.loopedThrough = 0;
        this.scoreIncrementTimer.id = -1;
      }
    }, 50); 
  }

  @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
    window.localStorage.setItem('high-score', String(this.highScore));
    window.localStorage.setItem('score', String(this.currentScore));
  }

}
