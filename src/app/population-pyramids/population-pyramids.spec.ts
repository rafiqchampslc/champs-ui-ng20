import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopulationPyramids } from './population-pyramids';

describe('PopulationPyramids', () => {
  let component: PopulationPyramids;
  let fixture: ComponentFixture<PopulationPyramids>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PopulationPyramids]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopulationPyramids);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
