import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { PasswordMatchValidatorService } from './../password-match-validator.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss', '../login/login.component.scss'],
})
export class RegistrationComponent {
  registerForm: FormGroup = new FormGroup({});
  hide = signal(true); // SHOW/HIDE PASSWORD
  hideConPass = signal(true); // SHOW/HIDE CONFIRM PASSWORD

  navigateToLogin() {
    this.router.navigate(['/expense-tracker/login']);
  }
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private passValidator: PasswordMatchValidatorService,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(20),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passValidator.passwordMatch(
          'password',
          'confirmPassword'
        ),
      }
    );
  }

  showHidePass(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.preventDefault();
  }
  showHideConPass(event: MouseEvent) {
    this.hideConPass.set(!this.hideConPass());
    event.preventDefault();
  }

  get confirmPasswordControl() {
    return this.registerForm.get('confirmPassword');
  }
  public getConfirmPasswordError() {
    const control: AbstractControl | null = this.confirmPasswordControl;
    return control?.hasError('required')
      ? 'Please confirm the password'
      : control?.hasError('passwordMismatch')
      ? 'Passwords do not match'
      : '';
  }

  register() {
    const rawVal = this.registerForm.getRawValue();
    this.authService
      .register(rawVal.email, rawVal.username, rawVal.password)
      .subscribe({
        next: (res: any) =>
          this.toastr.success(
            `Welcome to Expense Tracker ${res.displayName}`,
            'Success'
          ),
        error: () => this.toastr.error(`Failed to register`, 'Error'),
      });
  }
}
