import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HitmanTSComponent } from './hitman-ts.component';

describe('HitmanTSComponent', () => {
  let component: HitmanTSComponent;
  let fixture: ComponentFixture<HitmanTSComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HitmanTSComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HitmanTSComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
