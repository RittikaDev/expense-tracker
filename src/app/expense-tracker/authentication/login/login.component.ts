import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private toastr: ToastrService
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
    const rawVal = this.loginForm.getRawValue();
    this.authService.login(rawVal.email, rawVal.password).subscribe({
      next: (res: any) => {
        console.log('User logged in:', res.displayName);
        this.toastr.success(`Welcome back ${res.displayName}`, 'Success');
      },
      error: (err: any) => {
        console.error('Error during login:', err);
      },
    });
  }
  // admin12345
  //admin@gmail.com
}
