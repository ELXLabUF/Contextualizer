import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector: "app-dot-navigation",
    templateUrl: "./dot-navigation.component.html",
    styleUrls: ["./dot-navigation.component.css"],
})
export class DotNavigationComponent implements OnInit {
    instructionsDot: boolean = false;
    uploadFileDot: boolean = false;
    experiencesDot: boolean = false;
    displayPageDot: boolean = false;
    finalizePageDot: boolean = false;
    startNavigationFromExperiences: boolean = false;

    constructor(private router: Router) {}

    ngOnInit(): void {
        // if (sessionStorage.getItem("instructionsDot") !== null) {
        //     this.instructionsDot = true;
        // }

        // if (sessionStorage.getItem("uploadFileDot") !== null) {
        //     this.uploadFileDot = true;
        // }

        // if (sessionStorage.getItem("experiencesDot") !== null) {
        //     this.experiencesDot = true;
        // }

        // if (sessionStorage.getItem("displayPageDot") !== null) {
        //     this.displayPageDot = true;
        // }

        // if (sessionStorage.getItem("finalizePageDot") !== null) {
        //     this.finalizePageDot = true;
        // }

        this.instructionsDot =
            sessionStorage.getItem("instructionsDot") === "true" ? true : false;
        this.uploadFileDot =
            sessionStorage.getItem("uploadFileDot") === "true" ? true : false;
        this.experiencesDot =
            sessionStorage.getItem("experiencesDot") === "true" ? true : false;
        this.displayPageDot =
            sessionStorage.getItem("displayPageDot") === "true" ? true : false;
        this.finalizePageDot =
            sessionStorage.getItem("finalizePageDot") === "true" ? true : false;

        if (sessionStorage.getItem("altNavigation") === "true") {
            this.startNavigationFromExperiences = true;
        } else if (sessionStorage.getItem("altNavigation") === "false") {
            this.startNavigationFromExperiences = false;
        }

        if (this.router.url === "/instructions") {
            this.instructionsDot = true;
            this.uploadFileDot = false;
            this.experiencesDot = this.startNavigationFromExperiences
                ? true
                : false;
            this.displayPageDot = false;
            this.finalizePageDot = false;
            sessionStorage.setItem("instructionsDot", "true");
            sessionStorage.setItem("uploadFileDot", "false");
            sessionStorage.setItem(
                "experiencesDot",
                this.startNavigationFromExperiences ? "true" : "false"
            );
            sessionStorage.setItem("displayPageDot", "false");
            sessionStorage.setItem("finalizePageDot", "false");
        } else if (this.router.url === "/lesson") {
            this.instructionsDot = true;
            this.uploadFileDot = true;
            this.experiencesDot = this.startNavigationFromExperiences
                ? true
                : false;
            this.displayPageDot = false;
            this.finalizePageDot = false;
            sessionStorage.setItem("instructionsDot", "true");
            sessionStorage.setItem("uploadFileDot", "true");
            sessionStorage.setItem(
                "experiencesDot",
                this.startNavigationFromExperiences ? "true" : "false"
            );
            sessionStorage.setItem("displayPageDot", "false");
            sessionStorage.setItem("finalizePageDot", "false");
        } else if (this.router.url === "/experience") {
            this.instructionsDot = this.startNavigationFromExperiences
                ? false
                : true;
            this.uploadFileDot = this.startNavigationFromExperiences
                ? false
                : true;
            this.experiencesDot = true;
            this.displayPageDot = false;
            this.finalizePageDot = false;
            sessionStorage.setItem(
                "instructionsDot",
                this.startNavigationFromExperiences ? "false" : "true"
            );
            sessionStorage.setItem(
                "uploadFileDot",
                this.startNavigationFromExperiences ? "false" : "true"
            );
            sessionStorage.setItem("experiencesDot", "true");
            sessionStorage.setItem("displayPageDot", "false");
            sessionStorage.setItem("finalizePageDot", "false");
        } else if (this.router.url === "/display") {
            this.instructionsDot = true;
            this.uploadFileDot = true;
            this.experiencesDot = true;
            this.displayPageDot = true;
            this.finalizePageDot = false;
            sessionStorage.setItem("instructionsDot", "true");
            sessionStorage.setItem("uploadFileDot", "true");
            sessionStorage.setItem("experiencesDot", "true");
            sessionStorage.setItem("displayPageDot", "true");
            sessionStorage.setItem("finalizePageDot", "false");
        } else if (this.router.url === "/finalize") {
            this.instructionsDot = true;
            this.uploadFileDot = true;
            this.experiencesDot = true;
            this.displayPageDot = true;
            this.finalizePageDot = true;
            sessionStorage.setItem("instructionsDot", "true");
            sessionStorage.setItem("uploadFileDot", "true");
            sessionStorage.setItem("experiencesDot", "true");
            sessionStorage.setItem("displayPageDot", "true");
            sessionStorage.setItem("finalizePageDot", "true");
        }
    }

    navigateToInstructions() {
        let userIntData: any = [];
        let time = new Date();
        let dotNumber = this.startNavigationFromExperiences
            ? "second"
            : "first";
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: dotNumber + " navigation dot",
                Result: "Navigate to LP Instructions page",
                Time: time.toLocaleString(),
            }
            // "Clicked " +
            //     dotNumber +
            //     " navigation dot to navigate to LP Instructions page at " +
            //     time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.instructionsDot = true;
        this.uploadFileDot = false;
        this.experiencesDot = this.startNavigationFromExperiences
            ? true
            : false;
        this.displayPageDot = false;
        this.finalizePageDot = false;
        this.router.navigate(["/instructions"]);
    }

    navigateToUploadFile() {
        let userIntData: any = [];
        let time = new Date();
        let dotNumber = this.startNavigationFromExperiences
            ? "third"
            : "second";
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: dotNumber + " navigation dot",
                Result: "Navigate to Upload LP page",
                Time: time.toLocaleString(),
            }
            // "Clicked " +
            //     dotNumber +
            //     " navigation dot to navigate to Upload LP page at " +
            //     time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.instructionsDot = true;
        this.uploadFileDot = true;
        this.experiencesDot = this.startNavigationFromExperiences
            ? true
            : false;
        this.displayPageDot = false;
        this.finalizePageDot = false;
        this.router.navigate(["/lesson"]);
    }

    navigateToExperiences() {
        let userIntData: any = [];
        let time = new Date();
        let dotNumber = this.startNavigationFromExperiences ? "first" : "third";
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: dotNumber + " navigation dot",
                Result: "Navigate to Experiences page",
                Time: time.toLocaleString(),
            }
            // "Clicked " +
            //     dotNumber +
            //     " navigation dot to navigate to Experience page at " +
            //     time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.instructionsDot = this.startNavigationFromExperiences
            ? false
            : true;
        this.uploadFileDot = this.startNavigationFromExperiences ? false : true;
        this.experiencesDot = true;
        this.displayPageDot = false;
        this.finalizePageDot = false;
        this.router.navigate(["/experience"]);
    }

    navigateToDisplayPage() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "Fourth navigation dot",
                Result: "Navigate to Display LP page",
                Time: time.toLocaleString(),
            }
            // "Clicked fourth navigation dot to navigate to Display LP page at " +
            //     time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.instructionsDot = true;
        this.uploadFileDot = true;
        this.experiencesDot = true;
        this.displayPageDot = true;
        this.finalizePageDot = false;
        this.router.navigate(["/display"]);
    }

    navigateToFinalizePage() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "Fifth navigation dot",
                Result: "Navigate to Finalize LP page",
                Time: time.toLocaleString(),
            }
            // "Clicked fifth navigation dot to navigate to Finalize LP page at " +
            //     time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.instructionsDot = true;
        this.uploadFileDot = true;
        this.experiencesDot = true;
        this.displayPageDot = true;
        this.finalizePageDot = true;
        this.router.navigate(["/finalize"]);
    }
}
