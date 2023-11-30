import { Component, OnDestroy, OnInit } from "@angular/core";

@Component({
    selector: "app-lesson-plan-instructions",
    templateUrl: "./lesson-plan-instructions.component.html",
    styleUrls: ["./lesson-plan-instructions.component.css"],
})
export class LessonPlanInstructionsComponent implements OnInit, OnDestroy {
    timeStart!: Date;
    timeEnd!: Date;

    constructor() {}

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

        const link = document.createElement("a");
        link.setAttribute("target", "_self");
        link.setAttribute("href", "./");
        link.setAttribute("download", `template.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}
