import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = "";
  password: string = "";
  confirmPassword: string = "";
  errorMessage: string = "";

  constructor(private authService: AuthService, private router: Router) {}
  
  register() {
    // Check for valid email
    if (!this.isValidEmail(this.username)) {
      this.errorMessage = "Invalid email address.";
      this.resetForm();
      return;
    }

    // Check password confirmation
    if (this.password !== this.confirmPassword) {
      this.errorMessage = "Password confirmation doesn't match.";
      this.resetForm();
      return;
    }

    // Check password conditions
    if (!this.isPasswordValid()) {
      this.errorMessage = "Password doesn't meet the required conditions.";
      this.resetForm();
      return;
    }

    // Registration
      this.authService.register(this.username, this.password)
      .then(() => {
        this.router.navigate(['/login']);
      }).catch((error) => {
        console.error("Registration failed:", error);
        if (error.code === 'auth/email-already-in-use') {
          this.errorMessage = "The email address is already in use by another account.";
        } else {
          this.errorMessage = "Registration failed. " + error.message;
        }
        this.resetForm();
      });
  }
  
  isPasswordValid(): boolean {
    return this.password?.length > 8 &&
           /[A-Z]/.test(this.password) &&
           /[0-9]/.test(this.password) &&
           /[!@#$%^&*]/.test(this.password);
  }

  isValidEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  }

  resetForm() {
    this.username = "";
    this.password = "";
    this.confirmPassword = "";
    setTimeout(() => {
      this.errorMessage = "";
    }, 3000);
    // No need to reset errorMessage here because it's set when errors occur.
  }
}
