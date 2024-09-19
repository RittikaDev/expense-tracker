import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm: FormGroup = new FormGroup({});
  hide = signal(true); // SHOW/HIDE PASSWORD

  navigateToRegister() {
    this.router.navigate(['/expense-tracker/register']);
  }
  navigateToForgotPass() {
    this.router.navigate(['/expense-tracker/forgot-pass']);
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.preventDefault();
  }
  logIn() {
    this.spinner.show();
    const rawVal = this.loginForm.getRawValue();
    this.authService
      .login(rawVal.email, rawVal.password)
      .pipe(finalize(() => this.spinner.hide()))
      .subscribe({
        next: (res: any) =>
          this.toastr.success(`Welcome back ${res.displayName}`, 'Success'),
        error: () => this.toastr.error(`Failed to log in`, 'Error'),
      });
  }
  // admin12345
  //admin@gmail.com
}
