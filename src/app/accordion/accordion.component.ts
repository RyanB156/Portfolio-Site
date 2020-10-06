import { Component, ContentChildren, QueryList, AfterContentInit } from '@angular/core';
import { PanelComponent } from '../panel/panel.component';
 
@Component({
  selector: 'accordion',
  template: '<ng-content></ng-content>'
})
export class AccordionComponent  implements AfterContentInit {
  @ContentChildren(PanelComponent) panels: QueryList<PanelComponent>;
 
  ngAfterContentInit() {
    // Loop through all panels
    this.panels.toArray().forEach((panel: PanelComponent) => {
      // subscribe panel toggle event
      panel.toggle.subscribe(() => {
        // Open the panel
        this.clickPanel(panel);
      });
    });
  }
 
  clickPanel(panel: PanelComponent) {
    if (!panel.opened) {
      // close all panels
      this.panels.toArray().forEach(p => p.opened = false);
      // open the selected panel
      panel.opened = !panel.opened;
    } else {
      panel.opened = false;
    }
  }
}