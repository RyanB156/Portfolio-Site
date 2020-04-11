import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LogicsimComponent } from './logicsim.component';

describe('LogicsimComponent', () => {
  let component: LogicsimComponent;
  let fixture: ComponentFixture<LogicsimComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LogicsimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogicsimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
