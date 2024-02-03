import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./navbar/navbar.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { LandingPageComponent } from "./landing-page/landing-page.component";
import { DotNavigationComponent } from "./dot-navigation/dot-navigation.component";
import { LessonPlanInstructionsComponent } from "./lesson-plan-instructions/lesson-plan-instructions.component";
import { LessonPageComponent } from "./lesson-page/lesson-page.component";
import { ExperiencePageComponent } from "./experience-page/experience-page.component";
import { DisplayPageComponent } from "./display-page/display-page.component";
import { FinalizeLpPageComponent } from "./finalize-lp-page/finalize-lp-page.component";
import { AboutComponent } from "./about/about.component";
import { AccountComponent } from "./account/account.component";

import { environment } from "../environments/environment";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import {
    provideAnalytics,
    getAnalytics,
    ScreenTrackingService,
    UserTrackingService,
} from "@angular/fire/analytics";
import { provideAuth, getAuth } from "@angular/fire/auth";
import { provideDatabase, getDatabase } from "@angular/fire/database";
import { provideFirestore, getFirestore } from "@angular/fire/firestore";
import { provideFunctions, getFunctions } from "@angular/fire/functions";
import { provideMessaging, getMessaging } from "@angular/fire/messaging";
import { providePerformance, getPerformance } from "@angular/fire/performance";
import {
    provideRemoteConfig,
    getRemoteConfig,
} from "@angular/fire/remote-config";
import { provideStorage, getStorage } from "@angular/fire/storage";

import { AngularFireModule } from "@angular/fire/compat";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDividerModule } from "@angular/material/divider";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { DatePipe } from "@angular/common";

import { DragDropModule } from "@angular/cdk/drag-drop";
import { PasswordPatternPipe } from "./password-pattern.pipe";
import { ConfirmationDialogComponent } from "./confirmation-dialog/confirmation-dialog.component";
import { MatDialogModule } from "@angular/material/dialog";
import { AlertDialogComponent } from "./alert-dialog/alert-dialog.component";
import { InputDialogComponent } from "./input-dialog/input-dialog.component";

@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        LoginComponent,
        RegisterComponent,
        LandingPageComponent,
        DotNavigationComponent,
        LessonPlanInstructionsComponent,
        LessonPageComponent,
        ExperiencePageComponent,
        DisplayPageComponent,
        FinalizeLpPageComponent,
        AboutComponent,
        PasswordPatternPipe,
        AccountComponent,
        ConfirmationDialogComponent,
        AlertDialogComponent,
        InputDialogComponent,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,
        AppRoutingModule,
        HttpClientModule,
        BsDatepickerModule.forRoot(),
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAnalytics(() => getAnalytics()),
        provideAuth(() => getAuth()),
        provideDatabase(() => getDatabase()),
        provideFirestore(() => getFirestore()),
        provideFunctions(() => getFunctions()),
        provideMessaging(() => getMessaging()),
        providePerformance(() => getPerformance()),
        provideRemoteConfig(() => getRemoteConfig()),
        provideStorage(() => getStorage()),
        BrowserAnimationsModule,
        MatProgressBarModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatDividerModule,
        MatTooltipModule,
        MatSelectModule,
        MatInputModule,
        MatRadioModule,
        MatCardModule,
        MatIconModule,
        DragDropModule,
        MatDialogModule,
    ],
    providers: [ScreenTrackingService, UserTrackingService, DatePipe],
    bootstrap: [AppComponent],
})
export class AppModule {}
