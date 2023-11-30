import { Component, OnDestroy, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
    selector: "app-finalize-lp-page",
    templateUrl: "./finalize-lp-page.component.html",
    styleUrls: ["./finalize-lp-page.component.css"],
})
export class FinalizeLpPageComponent implements OnInit, OnDestroy {
    fileDownloadURL: string | null = null;
    id: string = "";
    pdfData: any = null;
    data: any = null;

    fields = [
        {
            name: "Content Area",
            key: "Content Area",
        },
        {
            name: "Grade Level",
            key: "Grade Level",
        },
        {
            name: "Topic",
            key: "Topic",
        },
        {
            name: "Duration",
            key: "Duration",
        },
        {
            name: "CCRSAE",
            key: "CCRSAE",
        },
        {
            name: "Instruction Shifts",
            key: "Instruction Shifts",
        },
        {
            name: "Objective",
            key: "Objective",
        },
        {
            name: "Assessment",
            key: "Assessment",
        },
        {
            name: "Materials",
            key: "Materials",
        },
        {
            name: "Instructions",
            key: "Instructions",
        },
        {
            name: "Home Study",
            key: "Home Study",
        },
        {
            name: "Reflection",
            key: "Reflection",
        },
    ];

    timeStart!: Date;
    timeEnd!: Date;

    constructor(private firestore: AngularFirestore, private router: Router) {}

    ngOnInit(): void {
        this.timeStart = new Date();
        let userIntData: any = [];
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Visited",
                Target: "Finalize LP page",
                Result: "",
                Time: this.timeStart.toLocaleString(),
            }
            // "Visited Finalize LP Page at " + this.timeStart.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        sessionStorage.setItem("timeStart", this.timeStart.toString());

        this.fileDownloadURL = sessionStorage.getItem("fileURL");

        if (this.fileDownloadURL) {
            this.firestore
                .collection("Documents", (ref) =>
                    ref.orderBy("createdAt", "desc").limit(1)
                )
                .get()
                .toPromise()
                .then((querySnapshot) => {
                    if (querySnapshot && !querySnapshot.empty) {
                        const doc = querySnapshot.docs[0];
                        this.pdfData = doc.data();
                        this.id = doc.id || "";

                        const fieldOrder =
                            (this.pdfData.fieldOrder as string[]) || [];
                        this.updateFieldOrder(fieldOrder);
                    }
                })
                .catch((err) =>
                    console.error("Error getting documents: ", err)
                );
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
                Target: "Finalize LP page",
                Result: "",
                Time: this.timeEnd.toLocaleString(),
            }
            // "Left Finalize LP Page at " + this.timeEnd.toLocaleString()
        );
        userIntData.push(
            {
                Action: "Time spent",
                Target: "Finalize LP page",
                Result: "",
                Time: duration + " seconds",
            }
            // "Time spent on Finalize LP Page: " + duration + " seconds"
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    private updateFieldOrder(fieldOrder: string[]) {
        if (fieldOrder.length > 0) {
            // Map the order to existing fields
            this.fields = fieldOrder.map((key) => ({
                name: this.getFieldName(key),
                key: key,
            }));
        }
    }

    private getFieldName(fieldKey: string): string {
        switch (fieldKey) {
            case "Content Area":
                return "Content Area";
            case "Grade Level":
                return "Grade Level";
            case "Topic":
                return "Topic";
            case "Duration":
                return "Duration";
            case "CCRSAE":
                return "CCRSAE";
            case "Instruction Shifts":
                return "Instruction Shifts";
            case "Objective":
                return "Objective";
            case "Assessment":
                return "Assessment";
            case "Materials":
                return "Materials";
            case "Instructions":
                return "Instructions";
            case "Home Study":
                return "Home Study";
            case "Reflection":
                return "Reflection";
            default:
                return "Unknown";
        }
    }

    // Function to get additional container keys
    getAdditionalContainerKeysForField(field: any): string[] {
        const defaultKeys = ["content", "integrated_experiences", "title"];
        const fieldData = this.pdfData[field.key] || {};

        return Object.keys(fieldData)
            .filter((key) => !defaultKeys.includes(key))
            .sort((a, b) => {
                // Fetch the createdAt timestamps for each container
                const dateA = fieldData[a]?.createdAt || 0;
                const dateB = fieldData[b]?.createdAt || 0;

                // Sort in ascending order based on the timestamps
                return dateA - dateB;
            });
    }

    getDocumentDefinition() {
        const content = [];

        for (const field of this.fields) {
            const fieldData = this.pdfData[field.key];
            if (fieldData) {
                content.push({
                    text: fieldData.title + ":",
                    fontSize: 16,
                    bold: true,
                    margin: [0, 20, 0, 0],
                });
                if (fieldData.content) {
                    content.push(fieldData.content);
                }
                if (
                    fieldData.integrated_experiences &&
                    fieldData.integrated_experiences.length
                ) {
                    const experiences = fieldData.integrated_experiences.map(
                        (exp: any) => exp
                    );
                    content.push({ ul: experiences });
                }
                for (const key in fieldData) {
                    if (
                        key !== "content" &&
                        key !== "integrated_experiences" &&
                        key !== "title" &&
                        fieldData[key].list
                    ) {
                        content.push({
                            text: key + ":",
                            fontSize: 14,
                            bold: true,
                            margin: [0, 20, 0, 0],
                        });
                        content.push({ ul: fieldData[key].list });
                    }
                }
            }
        }
        return {
            content: content,
        };
    }

    htmlToPDF() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Download Lesson Plan' button",
                Result: "Download finalized LP",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Download Lesson Plan' at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        const documentDefinition = this.getDocumentDefinition();
        pdfMake.createPdf(documentDefinition).download("Lesson_Plan.pdf");
    }

    onBackClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Back' button",
                Result: "Navigate to Display LP page",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Back' at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        this.router.navigate(["/display"]);
    }

    onHomeClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Home' button",
                Result: "Navigate to Landing page to start new LP contextualization",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Home' at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        this.router.navigate(["/landing"]);
    }
}
