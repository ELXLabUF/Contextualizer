import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { map, take, tap } from "rxjs/operators";
import { AuthService } from "../auth-service/auth.service";

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.currentUser.pipe(
        take(1),
        map((user) => !!user), // map to a boolean
        tap((loggedIn) => {
            if (!loggedIn) {
                console.log("Access denied");
                router.navigate(["/login"]);
            }
        })
    );
};
