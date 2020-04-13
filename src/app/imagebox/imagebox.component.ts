import { Component, Input } from '@angular/core';

@Component({
  selector: 'imagebox',
  template: `
  <div class="img-box">
    <div class="img-box-head">
      <img src={{src}} style="max-width: {{maxWidth}}" class="img-box-img">
    </div>
    <div class="img-box-caption">
      <ng-content></ng-content>
    </div>
  </div>`,
  styleUrls: ['./imagebox.component.scss']
})
export class ImageboxComponent {
  @Input() hasContent: boolean = false;
  @Input() src: string;
  @Input() maxWidth: number;
}
