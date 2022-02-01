/*
 * Copyright (c) Akveo 2019. All Rights Reserved.
 * Licensed under the Single Application / Multi Application License.
 * See LICENSE_SINGLE_APP / LICENSE_MULTI_APP in the 'docs' folder for license information on type of purchased license.
 */

import {Component, Input, forwardRef} from '@angular/core';
import {AbstractControl, NG_VALUE_ACCESSOR, ValidationErrors, ValidatorFn} from '@angular/forms';

@Component({
  selector: 'ngx-validation-message',
  styleUrls: ['./validation-message.component.scss'],
  template: `
      <div class="warning">
          <span class="caption status-danger"
             *ngIf="showMinLength"> Must be at least {{ minLength }} characters long<br></span>
          <span class="caption status-danger"
             *ngIf="showMaxLength"> Must be at most {{ maxLength }} characters long<br></span>
          <span class="caption status-danger" *ngIf="showPattern"> Incorrect {{ label }}<br> </span>
          <span class="caption status-danger" *ngIf="showRequired"> {{ label }} is required<br></span>
          <span class="caption status-danger" *ngIf="showMin">Min value of {{ label }} is {{ min }}<br></span>
          <span class="caption status-danger" *ngIf="showMax">Max value of {{ label }} is {{ max }}<br></span>
          <span class="caption status-danger" *ngIf="noUppercaseOrLowercase">Must have Uppercase and Lowercase Letter<br></span>
          <span class="caption status-danger" *ngIf="invalidTimeout">Invalid Timeout Format<br></span>
          <span class="caption status-danger" *ngIf="noNumeric">Must use a Number<br></span>
          <span class="caption status-danger" *ngIf="notMatch">Password do not match<br></span>
      </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxValidationMessageComponent),
      multi: true,
    },
  ],
})

export class NgxValidationMessageComponent {
  @Input()
  label: string = '';

  @Input()
  showRequired?: boolean;

  @Input()
  min?: number;

  @Input()
  showMin?: boolean;

  @Input()
  max?: number;

  @Input()
  showMax: boolean;

  @Input()
  minLength?: number;

  @Input()
  showMinLength?: boolean;

  @Input()
  maxLength?: number;

  @Input()
  showMaxLength?: boolean;

  @Input()
  showPattern?: boolean;

  @Input()
  noUppercaseOrLowercase?: boolean;

  @Input()
  invalidTimeout?: boolean;

  @Input()
  noNumeric?: boolean;

  @Input()
  notMatch: boolean;
}

export function createPasswordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl) : ValidationErrors | null => {
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

export function createTimeoutValidator(): ValidatorFn {
  return (control: AbstractControl) : ValidationErrors | null => {
      const value = control.value
      if (!value) {
          return null
      }
      const timeout = value.toString().split(":");
      if (timeout.length != 2) {
        return {
          invalidTimeout: true
        }
      }
      const hourTest = /^\d+$/.test(timeout[0]);
      const minuteTest = /^\d+$/.test(timeout[1]);

      if (!hourTest || !minuteTest) {
        return {
          invalidTimeout: true
        }
      }
      if (parseInt(timeout[1]) > 60) {
        return {
          invalidTimeout: true
        }
      }
      return null;
  }
}