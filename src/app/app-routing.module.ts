import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SnakeComponent } from './snake/snake.component';
import { HomeComponent } from './home/home.component';
import { TribeComponent } from './tribe/tribe.component';
import { LogicsimComponent } from './logicsim/logicsim.component';
import { HitmanComponent } from './hitman/hitman.component';
import { HazelComponent } from './hazel/hazel.component';
import { ShooterComponent } from './shooter/shooter.component';
import { CalculatorComponent } from './calculator/calculator.component';
import { MorseCodeComponent } from './morse-code/morse-code.component';
import { HitmanTSComponent } from './hitman-ts/hitman-ts.component';
import { RegexComponent } from './regex/regex.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full'},
  { path: 'home', component: HomeComponent },
  { path: 'games/snake', component: SnakeComponent },
  { path: 'games/shooter', component: ShooterComponent },
  { path: 'games/hitmanTS', component: HitmanTSComponent },
  { path: 'apps/calculator', component: CalculatorComponent },
  { path: 'apps/morsecode', component: MorseCodeComponent },
  { path: 'projects/hitman', component: HitmanComponent },
  { path: 'projects/logicsim', component: LogicsimComponent },
  { path: 'projects/tribe', component: TribeComponent },
  { path: 'projects/regex', component: RegexComponent },
  { path: 'hazel', component: HazelComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
