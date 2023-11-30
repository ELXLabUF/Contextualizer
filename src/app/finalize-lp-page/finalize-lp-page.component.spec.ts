import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalizeLpPageComponent } from './finalize-lp-page.component';

describe('FinalizeLpPageComponent', () => {
  let component: FinalizeLpPageComponent;
  let fixture: ComponentFixture<FinalizeLpPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FinalizeLpPageComponent]
    });
    fixture = TestBed.createComponent(FinalizeLpPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
