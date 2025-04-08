import { inject, Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
//import { getAuth, updatePassword } from "@firebase/auth";
import "firebase/compat/auth";
import {
    Auth,
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
} from "@angular/fire/auth";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    firebaseAuth: Auth = inject(Auth);

    constructor(private afAuth: AngularFireAuth) {}

    //async register(username: string, password: string): Promise<any> {
    //    return await this.afAuth.createUserWithEmailAndPassword(
    //        username,
    //        password
    //    );
    //}

    async register(username: string, password: string): Promise<any> {
        return await createUserWithEmailAndPassword(
            this.firebaseAuth,
            username,
            password
        );
    }

    //async login(username: string, password: string): Promise<any> {
    //    return await this.afAuth.signInWithEmailAndPassword(username, password);
    //}

    async login(username: string, password: string): Promise<any> {
        return await signInWithEmailAndPassword(
            this.firebaseAuth,
            username,
            password
        );
    }

    //async logout(): Promise<any> {
    //    return await this.afAuth.signOut();
    //}

    async logout(): Promise<any> {
        return await signOut(this.firebaseAuth);
    }

    get currentUser() {
        return this.afAuth.authState;
    }

    //async changeUserPassword(
    //    currentPassword: string,
    //    newPassword: string
    //): Promise<void> {
    //    const auth = getAuth();
    //    const user = auth.currentUser;

    //    console.log(user);
    //    if (!user) {
    //        throw new Error("No user currently logged in.");
    //    }
    //    updatePassword(user, newPassword)
    //        .then(() => {
    //            console.log("Password Updated");
    //        })
    //        .catch((error) => {
    //            console.log("Error" + error);
    //        });
    //}

    async changeUserPassword(newPassword: string): Promise<void> {
        const auth = getAuth();
        const user = auth.currentUser!;

        if (!user) {
            throw new Error("No user currently logged in.");
        }

        updatePassword(user, newPassword)
            .then(() => {
                console.log("Password updated successfully!");
            })
            .catch((error) => {
                console.error("Error: " + error);
            });
    }
}
