import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export function createPasswordStrengthValidator(): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {
      const value = control.value
      if (!value) {
          return null
      }
      const hasUpperCase = /[A-Z]+/.test(value)
      const hasLowerCase = /[a-z]+/.test(value)
      const hasNumeric = /[0-9]+/.test(value)
      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric
      return !passwordValid ? (
        {
          noUppercaseOrLowercase : (!hasUpperCase || !hasLowerCase),
          noNumeric : !hasNumeric
        }
      ) : null
  }
}

export function checkPasswords(): ValidatorFn {
  return (group:AbstractControl) : ValidationErrors | null => {
    let pass = group.get('password').value;
    let confirmPass = group.get('confirm').value
    return pass === confirmPass ? null : { notMatch: true }
  }
}

@Component({
  selector: 'ngx-reset-password-component',
  templateUrl: 'reset-password.html',
  styleUrls: ['reset-password.scss'],
})
export class ResetPasswordComponent {

  form: FormGroup

  get password() { return this.form.get('password') }
  get confirm() { return this.form.get('confirm') }

  constructor(
    protected ref: NbDialogRef<ResetPasswordComponent>,
    private fb: FormBuilder,  
  ) {}

  ngOnInit(): void {
    const passwordValidators = [
      Validators.minLength(6),
      Validators.required,
      createPasswordStrengthValidator()
    ]
    this.form = this.fb.group({
      password: this.fb.control('', [...passwordValidators]),
      confirm: this.fb.control('', [...passwordValidators]),
    }, { validators: checkPasswords() })
  }

  cancel() {
    this.ref.close()
  }

  save() {
    let password = this.password.value
    this.ref.close(password)
  }
}
