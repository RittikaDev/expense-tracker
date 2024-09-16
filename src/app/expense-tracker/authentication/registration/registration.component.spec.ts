import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { RegistrationComponent } from './registration.component';

import { PasswordMatchValidatorService } from '../password-match-validator.service';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthenticationService } from '../../services/authentication.service';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;
  let mockRouter: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthService = jasmine.createSpyObj('AuthenticationService', [
      'register',
    ]);

    await TestBed.configureTestingModule({
      declarations: [RegistrationComponent],
      imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
      providers: [
        FormBuilder,
        PasswordMatchValidatorService, // Provide your service here
        { provide: Router, useValue: mockRouter },
        { provide: AuthenticationService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the register form with email, password, and confirm password controls', () => {
    expect(component.registerForm.contains('email')).toBeTruthy();
    expect(component.registerForm.contains('password')).toBeTruthy();
    expect(component.registerForm.contains('confirmPassword')).toBeTruthy();
  });

  it('should mark email control as required', () => {
    const emailControl = component.registerForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBeTruthy();
  });

  it('should mark password control as required', () => {
    const passControl = component.registerForm.get('password');
    passControl?.setValue('');
    expect(passControl?.hasError('required')).toBeTruthy();
  });

  it('should mark confirm password control as required', () => {
    const confirmPassControl = component.registerForm.get('confirmPassword');
    confirmPassControl?.setValue('');
    expect(confirmPassControl?.hasError('required')).toBeTruthy();
  });

  it('should require password to be at least 6 characters long', () => {
    const passControl = component.registerForm.get('password');
    passControl?.setValue('12345');
    expect(passControl?.hasError('minlength')).toBeTruthy();
  });

  it('should limit password to a maximum of 20 characters', () => {
    const passControl = component.registerForm.get('password');
    passControl?.setValue('a'.repeat(21));
    expect(passControl?.hasError('maxlength')).toBeTruthy();
  });

  it('should check if passwords match', () => {
    const passControl = component.registerForm.get('password');
    const confirmPassControl = component.registerForm.get('confirmPassword');
    passControl?.setValue('password123');
    confirmPassControl?.setValue('password1234');
    component.registerForm.updateValueAndValidity();
    expect(confirmPassControl?.hasError('passwordMismatch')).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    const initialHideState = component.hide();
    component.showHidePass(new MouseEvent('click'));
    expect(component.hide()).toBe(!initialHideState);
  });

  it('should toggle confirm password visibility', () => {
    const initialHideState = component.hideConPass();
    component.showHideConPass(new MouseEvent('click'));
    expect(component.hideConPass()).toBe(!initialHideState);
  });

  it('should navigate to login page when navigateToLogin is called', () => {
    component.navigateToLogin();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/expense-tracker/login',
    ]);
  });
});
