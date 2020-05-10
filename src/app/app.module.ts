import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SnakeComponent } from './snake/snake.component';
import { HomeComponent } from './home/home.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TribeComponent } from './tribe/tribe.component';
import { LogicsimComponent } from './logicsim/logicsim.component';
import { HazelComponent } from './hazel/hazel.component';
import { HitmanComponent } from './hitman/hitman.component';
import { PanelComponent } from './panel/panel.component';
import { AccordionComponent } from './accordion/accordion.component';
import { FooterComponent } from './footer/footer.component';
import { ImageboxComponent } from './imagebox/imagebox.component';
import { ShooterComponent } from './shooter/shooter.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { MorseCodeComponent } from './morse-code/morse-code.component';
import { HitmanTSComponent } from './hitman-ts/hitman-ts.component';
import { CmdComponent } from './cmd/cmd.component';
import { HitmanNewGameComponent } from './hitman-new-game/hitman-new-game.component';

import "reflect-metadata";
import { RegexComponent } from './regex/regex.component';

@NgModule({
  declarations: [
    AppComponent,
    SnakeComponent,
    HomeComponent,
    SidebarComponent,
    TribeComponent,
    LogicsimComponent,
    HazelComponent,
    HitmanComponent,
    PanelComponent,
    AccordionComponent,
    FooterComponent,
    ImageboxComponent,
    ShooterComponent,
    CalculatorComponent,
    MorseCodeComponent,
    HitmanTSComponent,
    CmdComponent,
    HitmanNewGameComponent,
    RegexComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
