import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { PasswordMatchValidatorService } from './../password-match-validator.service';

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
    private fb: FormBuilder,
    private passValidator: PasswordMatchValidatorService
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group(
      {
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
      ? 'Please confirm the  password'
      : control?.hasError('passwordMismatch')
      ? 'The passwords do not match'
      : '';
  }

  register() {
    console.log(this.registerForm.value);
  }
}
