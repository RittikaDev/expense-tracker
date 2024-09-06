import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
  constructor(private router: Router, private fb: FormBuilder) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      cpassword: ['', Validators.required],
    });
  }
  register() {
    console.log(this.registerForm.value);
  }
}
