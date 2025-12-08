import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Under5Pyramids } from './under5-pyramids';

describe('Under5Pyramids', () => {
  let component: Under5Pyramids;
  let fixture: ComponentFixture<Under5Pyramids>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Under5Pyramids]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Under5Pyramids);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
