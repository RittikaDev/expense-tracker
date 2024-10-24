import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from '../../services/authentication.service';
import { TransactionBudgetService } from '../../services/transaction-budget.service';
import { ISavingsGoal } from '../../../interfaces/ISavings';
import Swal from 'sweetalert2';
import * as echarts from 'echarts';

@Component({
  selector: 'app-saving-goal',
  templateUrl: './saving-goal.component.html',
  styleUrls: [
    './saving-goal.component.scss',
    '../../authentication/login/login.component.scss',
  ],
})
export class SavingGoalComponent implements OnInit {
  userID: string | null = '';

  goalForm: FormGroup = new FormGroup({});

  goalValue: number = 0;
  goalSet: boolean = false;

  totalIncome: number = 0;
  totalExpenses: number = 0;
  cumulativeSavings: number = 0;
  savingsPercentage: number = 0;
  goalSetDate: Date | null = null;
  goalDeadline: Date | null = null;
  incomeChangePercentage: string = '';
  expenseChangePercentage: string = '';

  monthlySavingsTarget: number[] = [];

  ngOnInit(): void {
    this.goalForm = this.fb.group({
      purpose: ['', [Validators.required]],
      goal: [0, Validators.required],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
    });

    this.authService.userId$.subscribe((userId) => {
      if (userId) this.userID = userId;
    });
  }

  constructor(
    private fb: FormBuilder,
    private transactionBudgetService: TransactionBudgetService,
    private authService: AuthenticationService,
    private datepipe: DatePipe,
    private toastr: ToastrService
  ) {}

  showFormError(controlName: string) {
    return (
      (this.goalForm?.get(controlName)?.touched ||
        this.goalForm?.get(controlName)?.dirty) &&
      !this.goalForm?.get(controlName)?.valid &&
      this.goalForm?.get(controlName)?.errors?.['required']
    );
  }

  setGoal() {
    if (this.goalForm.valid) {
      this.goalValue = this.goalForm.value.goal;
      // this.goalSet = true;

      // const goalTextElement = document.querySelector(
      //   '.goal-text'
      // ) as HTMLElement;
      // goalTextElement.classList.add('show');

      // const progressCircle = document.querySelector(
      //   '.progress-circle'
      // ) as HTMLElement;
      // progressCircle.style.transform = 'translateX(-120px)';

      // this.goalSetDate = this.goalForm.value.startDate;
      // this.goalDeadline = this.goalForm.value.endDate;

      const goalData = {
        userId: this.userID,
        goalValue: this.goalForm.value.goal,
        purpose: this.goalForm.value.purpose,
        startDate: this.datepipe.transform(
          this.goalForm.value.startDate,
          '01-MMM-yyyy'
        ),
        endDate: this.datepipe.transform(
          this.goalForm.value.endDate,
          '01-MMM-yyyy'
        ),
      };

      this.transactionBudgetService
        .GetSavingGoalMonthWise(this.userID, goalData)
        .subscribe({
          next: (res: any) => {
            this.goalValue = res.existingGoal.goalValue;
            this.toastr.info(res.message, 'Info');

            Swal.fire({
              title: `${res.message}`,
              text: 'Do you want update?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Update',
              cancelButtonText: 'Cancel',
            }).then((result) => {
              if (result.isConfirmed) this.saveSavingGoal(goalData);
              else {
                this.toastr.info('Savings goal not updated!', 'Info');
                this.setProgressBarData();
              }
            });
          },
          error: (err) => this.saveSavingGoal(goalData),
        });
    }
  }

  saveSavingGoal(goalData: ISavingsGoal) {
    this.setProgressBarData();
    this.transactionBudgetService
      .AddSavingsGoal(this.userID, goalData)
      .subscribe({
        next: (res) => {
          this.toastr.success('Savings goal saved successfully!', 'Success');
          this.simulateProgress();
          this.getMonthlySavings();
        },
        error: () => this.toastr.error('Failed to set the goal', 'Error'),
      });
  }

  setProgressBarData() {
    // this.goalValue = this.goalForm.value.goal;
    this.goalSet = true;

    const goalTextElement = document.querySelector('.goal-text') as HTMLElement;
    goalTextElement.classList.add('show');

    const progressCircle = document.querySelector(
      '.progress-circle'
    ) as HTMLElement;
    progressCircle.style.transform = 'translateX(-120px)';

    this.goalSetDate = this.goalForm.value.startDate;
    this.goalDeadline = this.goalForm.value.endDate;

    this.simulateProgress();
    this.getMonthlySavings();
  }

  simulateProgress() {
    let progressValue = 0;
    const progressBar: any = document.querySelector('[role="progressbar"]');

    const interval = setInterval(() => {
      if (progressValue < 100) {
        progressValue += 10;
        progressBar?.style.setProperty('--value', progressValue);
        progressBar.setAttribute('aria-valuenow', progressValue);
      } else clearInterval(interval);
    }, 100);
  }

  getMonthlySavings(): void {
    if (!this.userID || !this.goalSetDate || !this.goalDeadline) return;

    const startYear = this.goalSetDate.getFullYear();
    const startMonth = this.goalSetDate.getMonth() + 1;
    const endYear = this.goalDeadline.getFullYear();
    const endMonth = this.goalDeadline.getMonth() + 1;

    // Fetch savings data for the selected month range
    this.transactionBudgetService
      .GetMonthlySavings(this.userID, startYear, startMonth, endYear, endMonth)
      .subscribe({
        next: (savingsDataArray) => {
          this.totalIncome = savingsDataArray.totalIncome;
          this.totalExpenses = savingsDataArray.totalExpenses;
          this.cumulativeSavings = this.totalIncome - this.totalExpenses;

          this.updateSavingsPercentage();
        },
        error: (err) => this.toastr.error(err.error.error, 'Error'),
      });
  }

  updateSavingsPercentage(): void {
    if (this.goalValue > 0) {
      this.savingsPercentage = (this.cumulativeSavings / this.goalValue) * 100;
      if (this.savingsPercentage > 100) this.savingsPercentage = 100;
      else if (this.savingsPercentage < 0) this.savingsPercentage = 0;

      // THIS WILL TRIGGER THE PROGRESS BAR ANIMATION
      const progressBar = document.querySelector(
        '.progress-bar'
      ) as HTMLElement;

      progressBar.style.setProperty(
        '--value',
        this.savingsPercentage.toString()
      );
      progressBar.style.width = `${this.savingsPercentage}%`;

      // Remove the animation class if it exists before setting the new one
      progressBar.classList.remove('animate');
      // Trigger reflow to restart the animation
      void progressBar.offsetWidth; // This forces a reflow
      progressBar.classList.add('animate');
    }
  }
}
