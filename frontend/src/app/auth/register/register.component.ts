import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true, // Ensure this component is standalone
  imports: [ReactiveFormsModule], // Import ReactiveFormsModule here
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      name: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = this.registerForm.value;
      if (formData.password === formData.confirmPassword) {
        this.authService.register(formData).subscribe({
          next: (response) => {
            console.log('Registration successful:', response.message);
            alert(response.message);  // Prikaz poruke za uspešnu registraciju
          },
          error: (error) => {
            console.error('Registration error:', error.error.message);
            alert(error.error.message);  // Prikaz greške
          }
        });
      } else {
        console.error('Passwords do not match');
        alert('Passwords do not match');
      }
    }
  }
}
