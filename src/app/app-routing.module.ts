import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { LandingPageComponent } from "./landing-page/landing-page.component";
import { CapturesPageComponent } from "./captures-page/captures-page.component";
import { LessonPlanInstructionsComponent } from "./lesson-plan-instructions/lesson-plan-instructions.component";
import { LessonPageComponent } from "./lesson-page/lesson-page.component";
import { ExperiencePageComponent } from "./experience-page/experience-page.component";
import { DisplayPageComponent } from "./display-page/display-page.component";
import { FinalizeLpPageComponent } from "./finalize-lp-page/finalize-lp-page.component";
import { AboutComponent } from "./about/about.component";
import { AccountComponent } from "./account/account.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { authGuard } from "./auth-guard/auth.guard";
import { loginGuard } from "./login-guard/login.guard";

const routes: Routes = [
    { path: "", redirectTo: "/login", pathMatch: "full" },
    { path: "login", component: LoginComponent, canActivate: [loginGuard] },
    {
        path: "register",
        component: RegisterComponent,
        canActivate: [loginGuard],
    },
    {
        path: "landing",
        component: LandingPageComponent,
        canActivate: [authGuard],
    },
    {
        path: "captures",
        component: CapturesPageComponent,
        canActivate: [authGuard],
    },
    {
        path: "instructions",
        component: LessonPlanInstructionsComponent,
        canActivate: [authGuard],
    },
    {
        path: "lesson",
        component: LessonPageComponent,
        canActivate: [authGuard],
    },
    {
        path: "experience",
        component: ExperiencePageComponent,
        canActivate: [authGuard],
    },
    {
        path: "display",
        component: DisplayPageComponent,
        canActivate: [authGuard],
    },
    {
        path: "finalize",
        component: FinalizeLpPageComponent,
        canActivate: [authGuard],
    },
    { path: "about", component: AboutComponent },
    { path: "account", component: AccountComponent, canActivate: [authGuard] },
    {
        path: "not-found",
        component: PageNotFoundComponent,
        canActivate: [authGuard],
    },
    { path: "**", redirectTo: "/not-found" },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
