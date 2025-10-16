import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { map, take, tap } from "rxjs/operators";
import { AuthService } from "../auth-service/auth.service";

export const loginGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser.pipe(
        take(1),
        map((user) => !user),
        tap((notLoggedIn) => {
            if (!notLoggedIn) {
                // If the user IS logged in
                console.log("Access denied, user already logged in.");
                router.navigate(["/landing"]); // Redirect them to the main page
            }
        })
    );
};
