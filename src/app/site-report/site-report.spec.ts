import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteReport } from './site-report';

describe('SiteReport', () => {
  let component: SiteReport;
  let fixture: ComponentFixture<SiteReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SiteReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
