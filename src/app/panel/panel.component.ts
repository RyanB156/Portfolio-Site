import { Component, Input, Output, EventEmitter } from '@angular/core';
 
@Component({
  selector: 'panel',
  styleUrls: [
    './panel.component.scss'
  ],
  template: `
  <div class="panel panel-info">
    <div class="panel-heading btn-link text-center" (click)="toggle.emit()">
      {{title}}
    </div>
    <div class="panel-body border-top border-dark mt-2 px-2" *ngIf="opened">
      <ng-content></ng-content>
    </div>
  <div>
  `
})
export class PanelComponent {
  @Input() opened = false;
  @Input() title: string;
  @Output() toggle: EventEmitter<any> = new EventEmitter<any>();
}
