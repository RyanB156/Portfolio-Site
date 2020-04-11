import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SnakeComponent } from './snake/snake.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TribeComponent } from './tribe/tribe.component';
import { LogicsimComponent } from './logicsim/logicsim.component';
import { HazelComponent } from './hazel/hazel.component';
import { HitmanComponent } from './hitman/hitman.component';

@NgModule({
  declarations: [
    AppComponent,
    SnakeComponent,
    HomeComponent,
    AboutComponent,
    SidebarComponent,
    TribeComponent,
    LogicsimComponent,
    HazelComponent,
    HitmanComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
