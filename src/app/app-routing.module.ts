import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LandingPageComponent } from "./landing-page/landing-page.component";
import { LessonPageComponent } from "./lesson-page/lesson-page.component";
import { ExperiencePageComponent } from "./experience-page/experience-page.component";
import { AboutComponent } from "./about/about.component";
import { DisplayPageComponent } from "./display-page/display-page.component";
import { LessonPlanInstructionsComponent } from "./lesson-plan-instructions/lesson-plan-instructions.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { FinalizeLpPageComponent } from "./finalize-lp-page/finalize-lp-page.component";
import { AccountComponent } from './account/account.component';

const routes: Routes = [
    { path: "", redirectTo: "/login", pathMatch: "full" },
    { path: "login", component: LoginComponent },
    { path: "register", component: RegisterComponent },
    { path: "landing", component: LandingPageComponent },
    { path: "instructions", component: LessonPlanInstructionsComponent },
    { path: "lesson", component: LessonPageComponent },
    { path: "experience", component: ExperiencePageComponent },
    { path: "about", component: AboutComponent },
    { path: "display", component: DisplayPageComponent },
    { path: "finalize", component: FinalizeLpPageComponent },
    {path: "account", component: AccountComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
