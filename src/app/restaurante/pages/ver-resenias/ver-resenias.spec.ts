import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerResenias } from './ver-resenias';

describe('VerResenias', () => {
  let component: VerResenias;
  let fixture: ComponentFixture<VerResenias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerResenias]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerResenias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
