import { Component, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../auth-service/auth.service";
import { UserInteractionCsvService } from "../user-interaction-csv-service/user-interaction-csv.service";
import { first } from "rxjs/operators";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

//pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: "app-navbar",
    templateUrl: "./navbar.component.html",
    styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent {
    isDropdownOpen: boolean = false;
    //currentUser$ = this.authService.currentUser.subscribe((user) => {
    //    console.log(user);
    //});

    constructor(
        private router: Router,
        public authService: AuthService,
        private userIntCSVService: UserInteractionCsvService
    ) {}

    onLogoClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );

        this.authService.currentUser.pipe(first()).subscribe((user) => {
            if (user) {
                userIntData.push({
                    Action: "Clicked",
                    Target: "Logo on navbar",
                    Result: "Navigate to 'Main Menu' page",
                    Time: time.toLocaleString(),
                });
                sessionStorage.setItem(
                    "userInteractionData",
                    JSON.stringify(userIntData)
                );

                //if (sessionStorage.getItem("passwordReset") === "true") {
                //    this.router.navigate(["/landing"]);
                //}
                this.router.navigate(["/landing"]);
            } else {
                this.router.navigate(["/login"]);
            }
        });
    }

    /*getUserIntDocument() {
        let content: any = [];
        let timeStart = new Date(sessionStorage.getItem("timeStart") || "");
        let timeEnd = new Date();
        let pageName = "";
        content = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );

        switch (this.router.url) {
            case "/about":
                pageName = "'About' ";
                break;
            case "/account":
                pageName = "'Account' ";
                break;
            case "/landing":
                pageName = "'Main Menu' ";
                break;
            case "/instructions":
                pageName = "'Create Lesson Plan' ";
                break;
            case "/lesson":
                pageName = "'Upload Lesson Plan' ";
                break;
            case "/experience":
                pageName = "'Browse Experiences' ";
                break;
            case "/display":
                pageName = "'Customize Lesson Plan' ";
                break;
            case "/finalize":
                pageName = "'Review Lesson Plan' ";
                break;
        }

        let duration = (timeEnd.valueOf() - timeStart.valueOf()) / 1000;

        content.push({
            Action: "Clicked",
            Target: "'Log Out' on navbar",
            Result: "Logout from the website",
            Time: timeEnd.toLocaleString(),
        });
        content.push({
            Action: "Left",
            Target: pageName + "page",
            Result: "",
            Time: timeEnd.toLocaleString(),
        });
        content.push({
            Action: "Time spent",
            Target: pageName + "page",
            Result: "",
            Time: duration + " seconds",
        });

        return {
            content: content,
        };
    }*/

    getUserInteractionData() {
        let content: any = [];
        let timeStart = new Date(sessionStorage.getItem("timeStart") || "");
        let timeEnd = new Date();
        let pageName = "";
        content = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );

        switch (this.router.url) {
            case "/about":
                pageName = "'About' ";
                break;
            case "/account":
                pageName = "'Account' ";
                break;
            case "/landing":
                pageName = "'Main Menu' ";
                break;
            case "/instructions":
                pageName = "'Create Lesson Plan' ";
                break;
            case "/lesson":
                pageName = "'Upload Lesson Plan' ";
                break;
            case "/experience":
                pageName = "'Browse Experiences' ";
                break;
            case "/display":
                pageName = "'Customize Lesson Plan' ";
                break;
            case "/finalize":
                pageName = "'Review Lesson Plan' ";
                break;
        }

        let duration = (timeEnd.valueOf() - timeStart.valueOf()) / 1000;

        content.push({
            Action: "Clicked",
            Target: "'Log Out' on navbar",
            Result: "Logout from the website",
            Time: timeEnd.toLocaleString(),
        });
        content.push({
            Action: "Left",
            Target: pageName + "page",
            Result: "",
            Time: timeEnd.toLocaleString(),
        });
        content.push({
            Action: "Time spent",
            Target: pageName + "page",
            Result: "",
            Time: duration + " seconds",
        });
        return content;
    }

    async onLogout() {
        //if (sessionStorage.getItem("passwordReset") === "true") {
        try {
            await this.authService.logout();
            sessionStorage.removeItem("instructionsDot");
            sessionStorage.removeItem("uploadFileDot");
            sessionStorage.removeItem("experiencesDot");
            sessionStorage.removeItem("displayPageDot");
            sessionStorage.removeItem("finalizePageDot");
            sessionStorage.removeItem("altNavigation");
            sessionStorage.removeItem("fileUploadSuccess");
            sessionStorage.removeItem("documentId");
            sessionStorage.removeItem("fileURL");
            sessionStorage.removeItem("userID");
            sessionStorage.removeItem("allClassrooms");
            sessionStorage.removeItem("classroom");
            //sessionStorage.removeItem("passwordReset");

            let userInteractionData: any = [];
            userInteractionData = this.getUserInteractionData();
            this.userIntCSVService.exportToCsv(userInteractionData);

            sessionStorage.removeItem("userInteractionData");
            sessionStorage.removeItem("timeStart");

            this.router.navigate(["/login"]);
        } catch (error) {
            console.error("Logout error:", error);
        }
        //}
    }

    onAccountClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Account' on navbar",
            Result: "Navigate to 'Account' page",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        //if (sessionStorage.getItem("passwordReset") === "true") {
        //    this.router.navigate(["/account"]);
        //}
        this.router.navigate(["/account"]);
    }

    //Toggle dropdown open and close
    toggleDropdown(event: any) {
        event.stopPropagation(); // Prevent click from propagating to document listener
        this.isDropdownOpen = !this.isDropdownOpen;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Profile icon on navbar",
            Result: this.isDropdownOpen
                ? "Open"
                : "Close" + " profile dropdown",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    //To close dropdown on clicking anywhere else
    @HostListener("document:click", ["$event"])
    onClickOutside() {
        this.isDropdownOpen = false; // Close dropdown when clicking outside
    }

    onAboutClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'About' on navbar",
            Result: "Navigate to 'About' page",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        //if (sessionStorage.getItem("passwordReset") === "true") {
        //    this.router.navigate(["/about"]);
        //}
        this.router.navigate(["/about"]);
    }
}
