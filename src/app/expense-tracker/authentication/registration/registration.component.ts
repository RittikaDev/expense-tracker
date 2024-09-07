import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
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
