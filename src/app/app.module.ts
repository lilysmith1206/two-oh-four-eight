import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider'

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { ScoreboardComponent } from './scoreboard/scoreboard.component';
import { ConfigurationComponent } from './configuration/configuration.component';

import { BoardService } from './shared/services/board.service';
import { MovementService } from './shared/services/movement.service';

import { GameDirective } from './shared/directives/game.directive';
import { TileDirective } from './shared/directives/tile.directive';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    TileDirective,
    ScoreboardComponent,
    GameDirective,
    ConfigurationComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSliderModule
  ],
  providers: [BoardService, MovementService],
  bootstrap: [AppComponent]
})
export class AppModule { }
