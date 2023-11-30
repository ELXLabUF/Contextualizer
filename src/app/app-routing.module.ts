import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LandingPageComponent } from "./landing-page/landing-page.component";
import { LessonPageComponent } from "./lesson-page/lesson-page.component";
import { ExperiencePageComponent } from "./experience-page/experience-page.component";
import { AboutComponent } from "./about/about.component";
import { DisplayPageComponent } from "./display-page/display-page.component";

const routes: Routes = [
    { path: "", component: LandingPageComponent },
    { path: "lesson", component: LessonPageComponent },
    { path: "experience", component: ExperiencePageComponent },
    { path: "about", component: AboutComponent }, // Ensure you have an AboutComponent
    { path: "display", component: DisplayPageComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
