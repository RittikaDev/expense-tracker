import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: [
    './forgot-password.component.scss',
    '../login/login.component.scss',
  ],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPassword: FormGroup = new FormGroup({});

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.forgotPassword = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  reset() {
    this.authService.forgotPassword(this.forgotPassword.value.email);
  }
  navigateToLogin() {
    this.router.navigate(['/expense-tracker/login']);
  }
}
