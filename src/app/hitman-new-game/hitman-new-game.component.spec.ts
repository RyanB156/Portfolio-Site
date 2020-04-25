import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HitmanNewGameComponent } from './hitman-new-game.component';

describe('HitmanNewGameComponent', () => {
  let component: HitmanNewGameComponent;
  let fixture: ComponentFixture<HitmanNewGameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HitmanNewGameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HitmanNewGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
