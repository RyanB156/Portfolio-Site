import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HazelComponent } from './hazel.component';

describe('HazelComponent', () => {
  let component: HazelComponent;
  let fixture: ComponentFixture<HazelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HazelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HazelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
