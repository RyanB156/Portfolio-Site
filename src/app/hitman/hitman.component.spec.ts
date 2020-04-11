import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HitmanComponent } from './hitman.component';

describe('HitmanComponent', () => {
  let component: HitmanComponent;
  let fixture: ComponentFixture<HitmanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HitmanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HitmanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
