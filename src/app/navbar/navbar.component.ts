import { Component } from "@angular/core";
import { AuthService } from "../auth.service";
import { Router } from "@angular/router";
import { UserInteractionCsvService } from "../user-interaction-csv-service/user-interaction-csv.service";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: "app-navbar",
    templateUrl: "./navbar.component.html",
    styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent {
    isAboutActive: boolean = false;
    isAccountActive: boolean = false;
    isLogOutActive: boolean = false;
    currentUser$ = this.authService.currentUser.subscribe((user) => {
        console.log(user);
    });

    constructor(
        public authService: AuthService,
        private router: Router,
        private userIntCSVService: UserInteractionCsvService
    ) {}

    onLogoClick() {
        this.isLogOutActive = false;
        this.isAboutActive = false;
        this.isAccountActive = false;
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "Logo on navbar",
                Result: "Navigate to Landing page",
                Time: time.toLocaleString(),
            }
            // "Clicked logo on navbar at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        this.router.navigate(["/landing"]);
    }

    getUserIntDocument() {
        let content: any = [];
        let timeStart = new Date(sessionStorage.getItem("timeStart") || "");
        let timeEnd = new Date();
        let pageName = "";
        content = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );

        switch (this.router.url) {
            case "/about":
                pageName = " About ";
                break;
            case "/account":
                pageName = " Account ";
                break;
            case "/landing":
                pageName = " Landing ";
                break;
            case "/instructions":
                pageName = " LP Instructions ";
                break;
            case "/lesson":
                pageName = " Upload LP ";
                break;
            case "/experience":
                pageName = " Experiences ";
                break;
            case "/display":
                pageName = " LP Display ";
                break;
            case "/finalize":
                pageName = " Finalize LP ";
                break;
        }

        let duration = (timeEnd.valueOf() - timeStart.valueOf()) / 1000;

        content.push(
            {
                Action: "Clicked",
                Target: "Log Out on navbar",
                Result: "Log Out from website",
                Time: timeEnd.toLocaleString(),
            }
            // "Clicked 'Log Out' at " + timeEnd.toLocaleString()
        );
        content.push(
            {
                Action: "Left",
                Target: pageName + "page",
                Result: "",
                Time: timeEnd.toLocaleString(),
            }
            // "Left" + pageName + "Page at " + timeEnd.toLocaleString()
        );
        content.push(
            {
                Action: "Time spent",
                Target: pageName + "page",
                Result: "",
                Time: duration + " seconds",
            }
            // "Time spent on" + pageName + "Page: " + duration + " seconds"
        );

        return {
            content: content,
        };
    }

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
                pageName = " About ";
                break;
            case "/account":
                pageName = " Account ";
                break;
            case "/landing":
                pageName = " Landing ";
                break;
            case "/instructions":
                pageName = " LP Instructions ";
                break;
            case "/lesson":
                pageName = " Upload LP ";
                break;
            case "/experience":
                pageName = " Experiences ";
                break;
            case "/display":
                pageName = " LP Display ";
                break;
            case "/finalize":
                pageName = " Finalize LP ";
                break;
        }

        let duration = (timeEnd.valueOf() - timeStart.valueOf()) / 1000;

        content.push(
            {
                Action: "Clicked",
                Target: "Log Out on navbar",
                Result: "Log Out from website",
                Time: timeEnd.toLocaleString(),
            }
            // "Clicked 'Log Out' at " + timeEnd.toLocaleString()
        );
        content.push(
            {
                Action: "Left",
                Target: pageName + "page",
                Result: "",
                Time: timeEnd.toLocaleString(),
            }
            // "Left" + pageName + "Page at " + timeEnd.toLocaleString()
        );
        content.push(
            {
                Action: "Time spent",
                Target: pageName + "page",
                Result: "",
                Time: duration + " seconds",
            }
            // "Time spent on" + pageName + "Page: " + duration + " seconds"
        );

        console.log("INSIDE FINAL FUNCTION FOR USER DATA");
        console.log(content.length);
        // return {
        //     content: content,
        // };
        return content;
    }

    async onLogout() {
        try {
            this.isLogOutActive = true;
            this.isAboutActive = false;
            this.isAccountActive = false;
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

            // let userIntData = this.getUserIntDocument();
            let userInteractionData: any = [];
            userInteractionData = this.getUserInteractionData();

            // pdfMake
            //     .createPdf(userIntData)
            //     .download("User_Interaction_Data.pdf");

            console.log("BEFORE SERVICE CALL");
            console.log(userInteractionData.length);

            this.userIntCSVService.exportToCsv(
                "User_Interaction_Data.csv",
                userInteractionData
            );

            sessionStorage.removeItem("userInteractionData");
            sessionStorage.removeItem("timeStart");

            this.router.navigate(["/login"]);
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    onAccountClick() {
        this.isLogOutActive = false;
        this.isAboutActive = false;
        this.isAccountActive = true;
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Account' on navbar",
                Result: "Navigate to Account page",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Account' at " + date.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        this.router.navigate(["/account"]);
    }

    onAboutClick() {
        this.isLogOutActive = false;
        this.isAboutActive = true;
        this.isAccountActive = false;
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'About' on navbar",
                Result: "Navigate to About page",
                Time: time.toLocaleString(),
            }
            // "Clicked 'About' at " + date.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        this.router.navigate(["/about"]);
    }
}
