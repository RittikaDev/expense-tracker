import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LoginComponent } from './login.component';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter: any;
  // SETTING UP THE TESTING MODULE AND ASYNCHRONOUS INITIALIZATION
  beforeEach(async () => {
    // MOCK ROUTER WITH A SPY FOR navigate
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    // console.log('call beforeEach');

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatInputModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
      providers: [FormBuilder, { provide: Router, useValue: mockRouter }],
    }).compileComponents();

    // INSTANCE-SPECIFIC SETUP AND RUNNING INITIALIZATION CODE FOR THE COMPONENT
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    component.ngOnInit();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the login form with email and password controls', () => {
    expect(component.loginForm.contains('email')).toBeTruthy();
    expect(component.loginForm.contains('password')).toBeTruthy();
  });

  it('should mark email control as required', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('');
    expect(emailControl?.hasError('required')).toBeTruthy();
  });

  it('should mark passowrd control as required', () => {
    const passControl = component.loginForm.get('password');
    passControl?.setValue('');
    expect(passControl?.hasError('required')).toBeTruthy();
  });

  it('should navigate to register page when navigateToRegister is called', () => {
    component.navigateToRegister();
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/expense-tracker/register',
    ]);
  });

  it('should log the form values on logIn function', () => {
    spyOn(console, 'log');

    component.loginForm.setValue({
      email: 'test@example.com',
      password: '123456',
    });

    component.logIn();

    expect(console.log).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: '123456',
    });
  });

  it('should toggle password visibility when clickEvent is called', () => {
    expect(component.hide()).toBeTrue();

    const event = new MouseEvent('click');
    component.clickEvent(event);

    expect(component.hide()).toBeFalse();

    component.clickEvent(event);
    expect(component.hide()).toBeTrue();
  });
});
