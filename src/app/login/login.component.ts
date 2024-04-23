import { Component } from "@angular/core";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"],
})
export class LoginComponent {
    username: string = "";
    password: string = "";
    errorMessage: string = "";

    constructor(private authService: AuthService, private router: Router) {}

    login() {
        // Check for valid email
        if (!this.isValidEmail(this.username)) {
            this.errorMessage = "Invalid email address.";
            this.resetForm();
            return;
        }

        this.authService
            .login(this.username, this.password)
            .then(() => {
                if (sessionStorage.getItem("userInteractionData")) {
                    sessionStorage.removeItem("userInteractionData");
                }
                sessionStorage.setItem("username", this.username);
                this.router.navigate(["/landing"]);
            })
            .catch((error) => {
                switch (error.code) {
                    case "auth/user-not-found":
                        this.errorMessage = "User not found. Please register.";
                        this.resetForm();
                        break;
                    case "auth/wrong-password":
                        this.errorMessage =
                            "Password did not match. Please try again.";
                        this.resetForm();
                        break;
                    case "auth/invalid-email":
                        this.errorMessage = "Invalid email format.";
                        this.resetForm();
                        break;
                    default:
                        this.errorMessage =
                            "Authentication failed. Please check your credentials.";
                        this.resetForm();
                        break;
                }
            });
    }

    isValidEmail(email: string): boolean {
        // Simple email regex for validation
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    }

    resetForm() {
        this.username = "";
        this.password = "";
        setTimeout(() => {
            this.errorMessage = "";
        }, 3000);
        // No need to reset errorMessage here because it's set when errors occur.
    }
}
