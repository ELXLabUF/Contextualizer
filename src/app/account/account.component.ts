import { Component, OnDestroy, OnInit } from "@angular/core";
import {
    Firestore,
    collection,
    doc,
    getDocs,
    setDoc,
} from "@angular/fire/firestore";
import { AuthService } from "../auth-service/auth.service";

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
    passwordReset: boolean = false;
    timeStart!: Date;
    timeEnd!: Date;

    constructor(
        private angularFireStore: Firestore,
        private authService: AuthService
    ) {}

    ngOnInit() {
        this.timeStart = new Date();
        let userIntData: any = [];
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Visited",
            Target: "'Account' page",
            Result: "",
            Time: this.timeStart.toLocaleString(),
        });
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

        //if (sessionStorage.getItem("passwordReset") === "true") {
        //    this.passwordReset = true;
        //} else if (sessionStorage.getItem("passwordReset") === "false") {
        //    this.passwordReset = false;
        //}
    }

    ngOnDestroy() {
        this.timeEnd = new Date();
        let userIntData: any = [];
        let duration =
            (this.timeEnd.valueOf() - this.timeStart.valueOf()) / 1000;
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Left",
            Target: "'Account' page",
            Result: "",
            Time: this.timeEnd.toLocaleString(),
        });
        userIntData.push({
            Action: "Time spent",
            Target: "'Account' page",
            Result: "",
            Time: duration + " seconds",
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    changePassword() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Submit' button",
            Result: "Submit the form to change the account's password",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        if (this.newPassword !== this.confirmPassword) {
            this.errorMessage = "Passwords do not match.";
            return;
        }

        if (!this.isPasswordValid(this.newPassword)) {
            this.errorMessage =
                "Password does not meet all the required conditions.";
            return;
        }

        this.authService
            .changeUserPassword(this.newPassword)
            .then(() => {
                this.errorMessage = "Password updated successfully!";
                this.resetForm();
                //if (!this.passwordReset) {
                //    this.setPasswordResetFlagInFirestore();
                //}
            })
            .catch((error: any) => {
                this.errorMessage = "Failed to update password: " + error;
            });
    }

    /*async setPasswordResetFlagInFirestore() {
        const teachersCollectionRef = collection(
            this.angularFireStore,
            "Teachers"
        );
        const collectionSnapshot = await getDocs(teachersCollectionRef);

        const allTeachers = collectionSnapshot.docs.map((doc) => ({
            id: doc.id,
            classroom: doc.data()["classroom"],
            name: doc.data()["name"],
            user_id: doc.data()["user_id"],
            password_reset: doc.data()["password_reset"],
        }));

        const index = allTeachers.findIndex(
            (item: any) => item.user_id === sessionStorage.getItem("userID")
        );

        const currTeacher = allTeachers[index];
        currTeacher["password_reset"] = true;
        sessionStorage.setItem("passwordReset", currTeacher["password_reset"]);

        console.log(currTeacher);

        //Rewrite classroom data to reflect end of capture
        await setDoc(doc(this.angularFireStore, currTeacher["id"]), {
            classroom: currTeacher["classroom"],
            name: currTeacher["name"],
            user_id: currTeacher["user_id"],
            password_reset: currTeacher["password_reset"],
        });
    }*/

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
