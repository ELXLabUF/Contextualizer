import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../auth-service/auth.service";
import { MatDialog } from "@angular/material/dialog";
import { AlertDialogComponent } from "../alert-dialog/alert-dialog.component";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { Observable } from "rxjs";

@Component({
    selector: "app-landing-page",
    templateUrl: "./landing-page.component.html",
    styleUrls: ["./landing-page.component.css"],
})
export class LandingPageComponent implements OnInit, OnDestroy {
    allClassrooms: string[] = [];
    classroom: string = "";
    //startNavigationFromExperiences: boolean = false;
    timeStart!: Date;
    timeEnd!: Date;

    constructor(
        private router: Router,
        public authService: AuthService,
        public dialog: MatDialog
    ) {}

    async ngOnInit() {
        this.timeStart = new Date();
        let userIntData: any = [];
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Visited",
            Target: "'Main Menu' page",
            Result: "",
            Time: this.timeStart.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        sessionStorage.setItem("timeStart", this.timeStart.toString());

        //Get all classrooms assocaited with current user
        this.allClassrooms = JSON.parse(
            sessionStorage.getItem("allClassrooms") || ""
        );

        if (
            sessionStorage.getItem("classroom") &&
            sessionStorage.getItem("classroom") !== ""
        ) {
            this.classroom =
                sessionStorage.getItem("classroom")?.slice(10) || "";
        }
    }

    ngOnDestroy() {
        this.timeEnd = new Date();
        let userIntData: any = [];
        let duration =
            (this.timeEnd.valueOf() - this.timeStart.valueOf()) / 1000;
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Left",
            Target: "'Main Menu' page",
            Result: "",
            Time: this.timeEnd.toLocaleString(),
        });
        userIntData.push({
            Action: "Time spent",
            Target: "'Main Menu' page",
            Result: "",
            Time: duration + " seconds",
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onClassroomDropdownClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Select A Classroom' dropdown",
            Result: "Open a dropdown with all the classrooms for the current user",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    setClassroom() {
        for (const clroom of this.allClassrooms) {
            if (clroom.slice(10) === this.classroom) {
                let userIntData: any = [];
                let time = new Date();
                userIntData = JSON.parse(
                    sessionStorage.getItem("userInteractionData") || "[]"
                );
                userIntData.push({
                    Action: "Selected",
                    Target: "'" + this.classroom + "' option",
                    Result: "Set the current classroom for the user",
                    Time: time.toLocaleString(),
                });
                sessionStorage.setItem(
                    "userInteractionData",
                    JSON.stringify(userIntData)
                );

                sessionStorage.setItem("classroom", clroom);
            }
        }
    }

    onExperienceCapturesClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Student Experience Capture' button",
            Result: "Navigate to 'Current Capture' page",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        if (
            !sessionStorage.getItem("classroom") ||
            sessionStorage.getItem("classroom") === "" ||
            sessionStorage.getItem("classroom") === null ||
            sessionStorage.getItem("classroom") === undefined
        ) {
            this.openAlertDialog(
                "Warning: No Classroom Selected",
                "Please select a classroom to proceed further."
            );
        } else {
            this.router.navigate(["/captures"]);
        }
    }

    /*onPersonalizeLessonClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Personalize Lesson' button",
            Result: "Navigate to 'Create Lesson Plan' page",
            Time: time.toLocaleString(),
        });
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
                    userIntData.push({
                        Action: "Clicked",
                        Target: "'Yes, Confirm' button on dialog box",
                        Result: "Navigate to 'Create Lesson Plan' page",
                        Time: time.toLocaleString(),
                    });
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
                    userIntData.push({
                        Action: "Clicked",
                        Target: "'No, Go Back' button on dialog box",
                        Result: "Deny start of new lesson plan contextualization",
                        Time: time.toLocaleString(),
                    });
                    sessionStorage.setItem(
                        "userInteractionData",
                        JSON.stringify(userIntData)
                    );
                }
            });
        } else {
            if (
                !sessionStorage.getItem("classroom") ||
                sessionStorage.getItem("classroom") === "" ||
                sessionStorage.getItem("classroom") === null ||
                sessionStorage.getItem("classroom") === undefined
            ) {
                this.openAlertDialog(
                    "Warning: No Classroom Selected",
                    "Please select a classroom to proceed further."
                );
            } else {
                this.router.navigate(["/instructions"]);
            }
        }
    }*/

    onBrowseExperiencesClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Browse Experiences' button",
            Result: "Navigate to 'Browse Experiences' page",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        //sessionStorage.setItem("altNavigation", "true");

        //if (
        //    sessionStorage.getItem("instructionsDot") !== null ||
        //    sessionStorage.getItem("uploadFileDot") !== null ||
        //    sessionStorage.getItem("experiencesDot") !== null ||
        //    sessionStorage.getItem("displayPageDot") !== null ||
        //    sessionStorage.getItem("finalizePageDot") !== null ||
        //    sessionStorage.getItem("fileUploadSuccess") !== null
        //) {
        //    this.openConfirmDialog(
        //        "New Lesson Plan Confirmation",
        //        "Are you sure you want to contextualize a new lesson plan? All your previous data will be lost."
        //    ).subscribe((decision: boolean) => {
        //        if (decision) {
        //            sessionStorage.removeItem("instructionsDot");
        //            sessionStorage.removeItem("uploadFileDot");
        //            sessionStorage.removeItem("experiencesDot");
        //            sessionStorage.removeItem("displayPageDot");
        //            sessionStorage.removeItem("finalizePageDot");
        //            sessionStorage.removeItem("fileUploadSuccess");
        //            sessionStorage.removeItem("fileURL");
        //            sessionStorage.removeItem("documentId");

        //            userIntData = [];
        //            time = new Date();
        //            userIntData = JSON.parse(
        //                sessionStorage.getItem("userInteractionData") || "[]"
        //            );
        //            userIntData.push({
        //                Action: "Clicked",
        //                Target: "'Yes, Confirm' button on dialog box",
        //                Result: "Navigate to 'Browse Experiences' page",
        //                Time: time.toLocaleString(),
        //            });
        //            sessionStorage.setItem(
        //                "userInteractionData",
        //                JSON.stringify(userIntData)
        //            );
        //            this.router.navigate(["/experience"]);
        //        } else {
        //            userIntData = [];
        //            time = new Date();
        //            userIntData = JSON.parse(
        //                sessionStorage.getItem("userInteractionData") || "[]"
        //            );
        //            userIntData.push({
        //                Action: "Clicked",
        //                Target: "'No, Go Back' button on dialog box",
        //                Result: "Deny start of new lesson plan contextualization",
        //                Time: time.toLocaleString(),
        //            });
        //            sessionStorage.setItem(
        //                "userInteractionData",
        //                JSON.stringify(userIntData)
        //            );
        //        }
        //    });
        //} else {
        if (
            !sessionStorage.getItem("classroom") ||
            sessionStorage.getItem("classroom") === "" ||
            sessionStorage.getItem("classroom") === null ||
            sessionStorage.getItem("classroom") === undefined
        ) {
            this.openAlertDialog(
                "Warning: No Classroom Selected",
                "Please select a classroom to proceed further."
            );
        } else {
            this.router.navigate(["/experience"]);
        }
        //}
    }

    openAlertDialog(title: string, message: string): void {
        this.dialog.open(AlertDialogComponent, {
            width: "600px",
            data: { title: title, message: message },
        });
    }

    openConfirmDialog(title: string, message: string): Observable<boolean> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: "600px",
            data: { title, message },
        });

        return dialogRef.afterClosed();
    }
}
