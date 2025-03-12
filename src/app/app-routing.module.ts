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

const routes: Routes = [
    { path: "", redirectTo: "/login", pathMatch: "full" },
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent },
    { path: "landing", component: LandingPageComponent },
    { path: "captures", component: CapturesPageComponent },
    { path: "instructions", component: LessonPlanInstructionsComponent },
    { path: "lesson", component: LessonPageComponent },
    { path: "experience", component: ExperiencePageComponent },
    { path: "display", component: DisplayPageComponent },
    { path: "finalize", component: FinalizeLpPageComponent },
    { path: "about", component: AboutComponent },
    { path: "account", component: AccountComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
