import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter();
  registerForm: FormGroup;
  registerFormName: string = 'Register Name';
  itemImageUrl: string = 'https://www.creativefabrica.com/wp-content/uploads/2020/09/23/WELCOME-Graphics-5632158-1-1-580x386.jpg'
  validationErrors: string[] | undefined;

  constructor(private accountService:AccountService, private toastr:ToastrService, 
    private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm()
  {
    this.registerForm = this.fb.group({
        gender: ['male'],
        username: ['', Validators.required],
        knownAs: ['', Validators.required],
        dateOfBirth: ['', Validators.required],
        city: ['', Validators.required],
        country: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
        confirmPassword: ['', [Validators.required, this.matchValues('password')]]
    })
    this.registerForm.controls.password.valueChanges.subscribe(() =>
    {
      this.registerForm.controls.confirmPassword.updateValueAndValidity();
    })
  }

matchValues(matchTo: string):ValidatorFn
{
  return (control: AbstractControl) => {
    return control?.value === control?.parent?.controls[matchTo].value ? null : {isMatching: true}
  }
}

  register() {
    const dob = this.getDateOnly(this.registerForm.controls['dateOfBirth'].value);
    // ... - replace in "values" array dateOfBirth value by another value - dob
    const values = {...this.registerForm.value, dateOfBirth: dob};
    console.log(values);
    this.accountService.register(values).subscribe({
      next: () => {
        this.router.navigateByUrl('/members')
      }, 
      error: error => {
        this.validationErrors = error
      }
    })
  }

  cancel(){
    this.cancelRegister.emit(false);
  }

  private getDateOnly(dob: string | undefined)
  {
    if(!dob) return;
    let theDob = new Date(dob);
    return new Date(theDob.setMinutes(theDob.getMinutes() - theDob.getTimezoneOffset()))
    .toISOString().slice(0, 10);
  }

}
