import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NSConv } from './ns-conv';

describe('NSConv', () => {
  let component: NSConv;
  let fixture: ComponentFixture<NSConv>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NSConv]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NSConv);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
