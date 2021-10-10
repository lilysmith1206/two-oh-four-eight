import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { TileDirective } from './game/shared/tile.directive';
import { RestartDirective } from './game/shared/restart.directive';
import { ScoreboardComponent } from './scoreboard/scoreboard.component';
import { BoardService } from './game/shared/board.service';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    TileDirective,
    RestartDirective,
    ScoreboardComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [BoardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
