import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { Observable } from "rxjs";

@Component({
    selector: "app-landing-page",
    templateUrl: "./landing-page.component.html",
    styleUrls: ["./landing-page.component.css"],
})
export class LandingPageComponent implements OnInit, OnDestroy {
    startNavigationFromExperiences: boolean = false;
    timeStart!: Date;
    timeEnd!: Date;

    constructor(public dialog: MatDialog, private router: Router) {}

    ngOnInit() {
        this.timeStart = new Date();
        let userIntData: any = [];
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Visited",
                Target: "Landing page",
                Result: "",
                Time: this.timeStart.toLocaleString(),
            }
            // "Visited Landing Page at " + this.timeStart.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        sessionStorage.setItem("timeStart", this.timeStart.toString());
    }

    ngOnDestroy() {
        this.timeEnd = new Date();
        let userIntData: any = [];
        let duration =
            (this.timeEnd.valueOf() - this.timeStart.valueOf()) / 1000;
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Left",
                Target: "Landing page",
                Result: "",
                Time: this.timeEnd.toLocaleString(),
            }
            // "Left Landing Page at " + this.timeEnd.toLocaleString()
        );
        userIntData.push(
            {
                Action: "Time spent",
                Target: "Landing page",
                Result: "",
                Time: duration + " seconds",
            }
            // "Time spent on Landing Page: " + duration + " seconds"
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onPersonalizeLessonClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Personalize Lesson' button",
                Result: "Navigate to LP Instructions page",
                Time: time.toLocaleString(),
            }
            // "Clicked on 'Personalize Lesson' at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        sessionStorage.setItem("altNavigation", "false");

        if (
            sessionStorage.getItem("instructionsDot") !== null ||
            sessionStorage.getItem("uploadFileDot") !== null ||
            sessionStorage.getItem("experiencesDot") !== null ||
            sessionStorage.getItem("displayPageDot") !== null ||
            sessionStorage.getItem("finalizePageDot") !== null ||
            sessionStorage.getItem("fileUploadSuccess") !== null
        ) {
            this.openConfirmDialog(
                "New Lesson Plan Confirmation",
                "Are you sure you want to contextualize a new lesson plan? All your previous data will be lost."
            ).subscribe((decision: boolean) => {
                if (decision) {
                    sessionStorage.removeItem("instructionsDot");
                    sessionStorage.removeItem("uploadFileDot");
                    sessionStorage.removeItem("experiencesDot");
                    sessionStorage.removeItem("displayPageDot");
                    sessionStorage.removeItem("finalizePageDot");
                    sessionStorage.removeItem("fileUploadSuccess");
                    sessionStorage.removeItem("fileURL");
                    sessionStorage.removeItem("documentId");

                    userIntData = [];
                    time = new Date();
                    userIntData = JSON.parse(
                        sessionStorage.getItem("userInteractionData") || "[]"
                    );
                    userIntData.push(
                        {
                            Action: "Clicked",
                            Target: "'Yes, Confirm' button on dialog box",
                            Result: "Navigate to LP Instructions page",
                            Time: time.toLocaleString(),
                        }
                        // "Clicked 'Yes, Confirm' at " + time.toLocaleString()
                    );
                    sessionStorage.setItem(
                        "userInteractionData",
                        JSON.stringify(userIntData)
                    );
                    this.router.navigate(["/instructions"]);
                } else {
                    userIntData = [];
                    time = new Date();
                    userIntData = JSON.parse(
                        sessionStorage.getItem("userInteractionData") || "[]"
                    );
                    userIntData.push(
                        {
                            Action: "Clicked",
                            Target: "'No, Go Back' button on dialog box",
                            Result: "Deny new LP contextualization",
                            Time: time.toLocaleString(),
                        }
                        // "Clicked 'No, Go Back' at " + time.toLocaleString()
                    );
                    sessionStorage.setItem(
                        "userInteractionData",
                        JSON.stringify(userIntData)
                    );
                }
            });
        } else {
            this.router.navigate(["/instructions"]);
        }
    }

    onBrowseExperiencesClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Browse Experiences' button",
                Result: "Navigate to Experiences page",
                Time: time.toLocaleString(),
            }
            // "Clicked on 'Browse Experiences' at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        sessionStorage.setItem("altNavigation", "true");

        if (
            sessionStorage.getItem("instructionsDot") !== null ||
            sessionStorage.getItem("uploadFileDot") !== null ||
            sessionStorage.getItem("experiencesDot") !== null ||
            sessionStorage.getItem("displayPageDot") !== null ||
            sessionStorage.getItem("finalizePageDot") !== null ||
            sessionStorage.getItem("fileUploadSuccess") !== null
        ) {
            this.openConfirmDialog(
                "New Lesson Plan Confirmation",
                "Are you sure you want to contextualize a new lesson plan? All your previous data will be lost."
            ).subscribe((decision: boolean) => {
                if (decision) {
                    sessionStorage.removeItem("instructionsDot");
                    sessionStorage.removeItem("uploadFileDot");
                    sessionStorage.removeItem("experiencesDot");
                    sessionStorage.removeItem("displayPageDot");
                    sessionStorage.removeItem("finalizePageDot");
                    sessionStorage.removeItem("fileUploadSuccess");
                    sessionStorage.removeItem("fileURL");
                    sessionStorage.removeItem("documentId");

                    userIntData = [];
                    time = new Date();
                    userIntData = JSON.parse(
                        sessionStorage.getItem("userInteractionData") || "[]"
                    );
                    userIntData.push(
                        {
                            Action: "Clicked",
                            Target: "'Yes, Confirm' button on dialog box",
                            Result: "Navigate to Experiences page",
                            Time: time.toLocaleString(),
                        }
                        // "Clicked 'Yes, Confirm' at " + time.toLocaleString()
                    );
                    sessionStorage.setItem(
                        "userInteractionData",
                        JSON.stringify(userIntData)
                    );
                    this.router.navigate(["/experience"]);
                } else {
                    userIntData = [];
                    time = new Date();
                    userIntData = JSON.parse(
                        sessionStorage.getItem("userInteractionData") || "[]"
                    );
                    userIntData.push(
                        {
                            Action: "Clicked",
                            Target: "'No, Go Back' button on dialog box",
                            Result: "Deny new LP contextualization",
                            Time: time.toLocaleString(),
                        }
                        // "Clicked 'No, Go Back' at " + time.toLocaleString()
                    );
                    sessionStorage.setItem(
                        "userInteractionData",
                        JSON.stringify(userIntData)
                    );
                }
            });
        } else {
            this.router.navigate(["/experience"]);
        }
    }

    openConfirmDialog(title: string, message: string): Observable<boolean> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: "250px",
            data: { title, message },
        });

        return dialogRef.afterClosed();
    }
}
