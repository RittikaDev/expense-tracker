import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let mockRouter: any;

  beforeEach(async () => {
    // MOCK ROUTER WITH A SPY FOR navigate
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

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
  });
  beforeEach(() => {
    // CREATE COMPOENNT AND FIXTURE
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    component.ngOnInit();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
