import { Component, OnDestroy, OnInit } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { Router } from "@angular/router";

@Component({
    selector: "app-lesson-plan-instructions",
    templateUrl: "./lesson-plan-instructions.component.html",
    styleUrls: ["./lesson-plan-instructions.component.css"],
})
export class LessonPlanInstructionsComponent implements OnInit, OnDestroy {
    startNavigationFromExperiences: boolean = false;
    timeStart!: Date;
    timeEnd!: Date;

    constructor(private storage: AngularFireStorage, private router: Router) {}

    ngOnInit() {
        this.timeStart = new Date();
        let userIntData: any = [];
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Visited",
                Target: "LP Instructions page",
                Result: "",
                Time: this.timeStart.toLocaleString(),
            }
            // "Visited LP Instructions Page at " + this.timeStart.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        sessionStorage.setItem("timeStart", this.timeStart.toString());

        if (
            sessionStorage.getItem("altNavigation") === "false" ||
            (sessionStorage.getItem("fileUploadSuccess") !== null &&
                sessionStorage.getItem("fileUploadSuccess") === "true")
        ) {
            this.startNavigationFromExperiences = false;
        } else if (sessionStorage.getItem("altNavigation") === "true") {
            this.startNavigationFromExperiences = true;
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
        userIntData.push(
            {
                Action: "Left",
                Target: "LP Instructions page",
                Result: "",
                Time: this.timeEnd.toLocaleString(),
            }
            // "Left LP Instructions Page at " + this.timeEnd.toLocaleString()
        );
        userIntData.push(
            {
                Action: "Time spent",
                Target: "LP Instructions page",
                Result: "",
                Time: duration + " seconds",
            }
            // "Time spent on LP Instructions Page: " + duration + " seconds"
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    downloadFile() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Download Lesson Plan Template' button",
                Result: "Download LP template",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Download Lesson Plan Template' at " +
            // time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        //const fileName = "Template.pdf";
        const fileName = "Template.docx";
        const fileRef = this.storage.ref(fileName);

        fileRef.getDownloadURL().subscribe((url) => {
            console.log(url);
            const link = document.createElement("a");
            link.setAttribute("target", "_blank");
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        });
    }
}
