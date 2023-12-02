import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { getAuth, updatePassword } from "@firebase/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    constructor(private afAuth: AngularFireAuth) {}

    async register(username: string, password: string): Promise<any> {
        return await this.afAuth.createUserWithEmailAndPassword(
            username,
            password
        );
    }
    async login(username: string, password: string): Promise<any> {
        return await this.afAuth.signInWithEmailAndPassword(username, password);
    }
    async logout(): Promise<any> {
        return await this.afAuth.signOut();
    }
    get currentUser() {
        return this.afAuth.authState;
    }

    async changeUserPassword(
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        const auth = getAuth();
        const user = auth.currentUser;

        console.log(user);
        if (!user) {
            throw new Error("No user currently logged in.");
        }
        updatePassword(user, newPassword)
            .then(() => {
                console.log("Password Updated");
            })
            .catch((error) => {
                console.log("Error" + error);
            });
    }
}
