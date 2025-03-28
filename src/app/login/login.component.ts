import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { collection, Firestore, getDocs } from "@angular/fire/firestore";
import { AuthService } from "../auth-service/auth.service";

@Component({
    selector: "app-login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.css"],
})
export class LoginComponent {
    username: string = "";
    password: string = "";
    errorMessage: string = "";

    constructor(
        private router: Router,
        private angularFireStore: Firestore,
        private authService: AuthService
    ) {}

    async login() {
        // Check for valid email
        if (!this.isValidEmail(this.username)) {
            this.errorMessage = "Invalid email address.";
            this.resetForm();
            return;
        }

        this.authService
            .login(this.username, this.password)
            .then(async () => {
                if (sessionStorage.getItem("userInteractionData")) {
                    sessionStorage.removeItem("userInteractionData");
                }
                sessionStorage.setItem("username", this.username);

                //Get UID from Firebase auth
                this.authService.currentUser.subscribe((user) => {
                    if (user) {
                        const currUserID = user?.uid || "";
                        if (currUserID !== undefined) {
                            sessionStorage.setItem("userID", currUserID);
                        }
                    } else {
                        console.log("No data for user!");
                    }
                });

                //Get the teacher data from list of all teachers (Firebase collection)
                //using UID and get classroom name from the teacher's data
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
                    (item: any) =>
                        item.user_id === sessionStorage.getItem("userID")
                );

                const currTeacher = allTeachers[index];
                //Stores the path to the current teacher's classroom document in Firestore (Classroom/ClassroomName)
                //sessionStorage.setItem(
                //    "classroom",
                //    currTeacher["classroom"]["path"]
                //);
                let allClassrooms: string[] = [];

                for (const classroom of currTeacher["classroom"]) {
                    allClassrooms.push(classroom["path"]);
                }

                sessionStorage.setItem(
                    "allClassrooms",
                    JSON.stringify(allClassrooms)
                );

                //sessionStorage.setItem(
                //    "passwordReset",
                //    currTeacher["password_reset"]
                //);

                //if (currTeacher["password_reset"] === false) {
                //    this.router.navigate(["/account"]);
                //} else {
                //    this.router.navigate(["/landing"]);
                //}
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
