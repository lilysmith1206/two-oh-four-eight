import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { PlatformModule } from '@angular/cdk/platform';

import { MatSelectModule } from '@angular/material/select'
import { MatOption } from '@angular/material/core';
import { MatFormField } from '@angular/material/form-field';

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
    MatSelectModule,
    FormsModule,
    PlatformModule
  ],
  providers: [BoardService, MovementService],
  bootstrap: [AppComponent]
})
export class AppModule { }
