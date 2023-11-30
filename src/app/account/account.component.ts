import { Component, OnDestroy, OnInit } from "@angular/core";
import { AuthService } from "../auth.service";

@Component({
    selector: "app-account",
    templateUrl: "./account.component.html",
    styleUrls: ["./account.component.css"],
})
export class AccountComponent implements OnInit, OnDestroy {
    currentUsername: string = "";
    newUsername: string = "";
    currentPassword: string = "";
    newPassword: string = "";
    confirmPassword: string = "";
    errorMessage: string = "";
    showForm: boolean = false;
    timeStart!: Date;
    timeEnd!: Date;

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.timeStart = new Date();
        let userIntData: any = [];
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Visited",
                Target: "Account page",
                Result: "",
                Time: this.timeStart.toLocaleString(),
            }
            // "Visited Account Page at " + this.timeStart.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        sessionStorage.setItem("timeStart", this.timeStart.toString());

        this.authService.currentUser.subscribe((user) => {
            if (user) {
                this.currentUsername = user.email || ""; // Assuming email as the username.
            }
        });
    }

    ngOnDestroy() {
        this.timeEnd = new Date();
        let userIntData: any = [];
        let duration =
            (this.timeEnd.valueOf() - this.timeStart.valueOf()) / 1000;
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Left",
                Target: "Account page",
                Result: "",
                Time: this.timeEnd.toLocaleString(),
            }
            // "Left Account Page at " + this.timeEnd.toLocaleString()
        );
        userIntData.push(
            {
                Action: "Time spent",
                Target: "Account page",
                Result: "",
                Time: duration + " seconds",
            }
            // "Time spent on Account Page: " + duration + " seconds"
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    async changePassword() {
        if (this.newPassword !== this.confirmPassword) {
            this.errorMessage = "Password confirmation doesn't match.";
            return;
        }

        if (!this.isPasswordValid(this.newPassword)) {
            this.errorMessage =
                "Password doesn't meet the required conditions.";
            return;
        }

        this.authService
            .changeUserPassword(this.currentPassword, this.newPassword)
            .then(() => {
                this.errorMessage = "Password updated successfully.";
                this.resetForm();
            })
            .catch((error: any) => {
                this.errorMessage = "Failed to update password: " + error;
            });
    }

    isValidEmail(email: string): boolean {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return regex.test(email);
    }

    isPasswordValid(password: string): boolean {
        return (
            password?.length > 8 &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[!@#$%^&*]/.test(password)
        );
    }

    resetForm() {
        this.currentPassword = "";
        this.newPassword = "";
        this.confirmPassword = "";
        setTimeout(() => {
            this.errorMessage = "";
        }, 3000);
    }
}
