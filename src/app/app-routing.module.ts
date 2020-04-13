import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SnakeComponent } from './snake/snake.component';
import { HomeComponent } from './home/home.component';
import { TribeComponent } from './tribe/tribe.component';
import { LogicsimComponent } from './logicsim/logicsim.component';
import { HitmanComponent } from './hitman/hitman.component';
import { HazelComponent } from './hazel/hazel.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'games/snake', component: SnakeComponent },
  { path: 'projects/tribe', component: TribeComponent },
  { path: 'projects/logicsim', component: LogicsimComponent },
  { path: 'projects/hitman', component: HitmanComponent },
  { path: 'hazel', component: HazelComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
