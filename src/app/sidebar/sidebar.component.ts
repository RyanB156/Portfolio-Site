import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  status: boolean;

  constructor() { 
    this.status = false;
  }

  ngOnInit(): void {
  }

}
