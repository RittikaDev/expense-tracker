import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingGoalComponent } from './saving-goal.component';

describe('SavingGoalComponent', () => {
  let component: SavingGoalComponent;
  let fixture: ComponentFixture<SavingGoalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavingGoalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingGoalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
