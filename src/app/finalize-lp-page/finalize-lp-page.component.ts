import { Component, OnDestroy, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { Router } from "@angular/router";

import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

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
    currFieldNum: number = 0;

    fields = [
        {
            name: "Grade",
            key: "Grade",
        },
        {
            name: "Subject",
            key: "Subject",
        },
        {
            name: "Duration",
            key: "Duration",
        },
        {
            name: "Lesson Standards & Objectives",
            key: "Lesson Standards & Objectives",
        },
        {
            name: "Materials",
            key: "Materials",
        },
        {
            name: "Warm-Up",
            key: "Warm-Up",
        },
        {
            name: "Teacher-Led Instruction",
            key: "Teacher-Led Instruction",
        },
        {
            name: "Student-Led Learning",
            key: "Student-Led Learning",
        },
        {
            name: "Wrap-Up/Closure",
            key: "Wrap-Up/Closure",
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
        userIntData.push({
            Action: "Visited",
            Target: "Finalize LP page",
            Result: "",
            Time: this.timeStart.toLocaleString(),
        });
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
        userIntData.push({
            Action: "Left",
            Target: "Finalize LP page",
            Result: "",
            Time: this.timeEnd.toLocaleString(),
        });
        userIntData.push({
            Action: "Time spent",
            Target: "Finalize LP page",
            Result: "",
            Time: duration + " seconds",
        });
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
            case "Grade":
                return "Grade";
            case "Subject":
                return "Subject";
            case "Duration":
                return "Duration";
            case "Lesson Standards & Objectives":
                return "Lesson Standards & Objectives";
            case "Materials":
                return "Materials";
            case "Warm-Up":
                return "Warm-Up";
            case "Teacher-Led Instruction":
                return "Teacher-Led Instruction";
            case "Student-Led Learning":
                return "Student-Led Learning";
            case "Wrap-Up/Closure":
                return "Wrap-Up/Closure";
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

    countNumberOfSections() {
        let totalFieldCount = 0;

        for (const field of this.fields) {
            const fieldData = this.pdfData[field.key];
            if (fieldData) {
                totalFieldCount += 1;
                for (const key in fieldData) {
                    if (
                        key !== "content" &&
                        key !== "integrated_experiences" &&
                        key !== "title" &&
                        fieldData[key].list
                    ) {
                        totalFieldCount += 1;
                    }
                }
            }
        }
        sessionStorage.setItem("totalFieldCount", totalFieldCount.toString());
    }

    generateSection(): Paragraph {
        this.currFieldNum += 1;

        if (
            this.currFieldNum <=
            parseInt(sessionStorage.getItem("totalFieldCount") || "0")
        ) {
            const fieldData =
                this.pdfData[this.fields[this.currFieldNum - 1].key];
            let hasTitle = fieldData.title ? true : false;
            let hasContent = fieldData.content.content ? true : false;
            let hasExperiences: boolean = false;
            let isContentString =
                typeof fieldData.content.content === "string" ? true : false;
            let experiences = [];
            let titleParagraph = new Paragraph("");
            let contentParagraph = new Paragraph("");
            let experiencesParagraph = new Paragraph("");

            // Check if any experiences were integrated in the current section
            if (
                fieldData.integrated_experiences &&
                fieldData.integrated_experiences.length
            ) {
                hasExperiences = true;
                experiences = fieldData.integrated_experiences.map(
                    (exp: any) => exp
                );
            }

            // Generate the title paragraph a.k.a. the title of the current section
            if (hasTitle) {
                titleParagraph = new Paragraph({
                    text: fieldData.title,
                    heading: HeadingLevel.HEADING_1,
                });
            }

            // Generate the content paragraph a.k.a. the content of the current section
            if (hasContent) {
                if (isContentString) {
                    contentParagraph = new Paragraph(fieldData.content.content);
                } else if (fieldData.content.content.length === 1) {
                    contentParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: fieldData.content.content[0],
                            }),
                        ],
                    });
                } else if (fieldData.content.content.length === 2) {
                    contentParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: fieldData.content.content[0],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[1],
                            }),
                        ],
                    });
                } else if (fieldData.content.content.length === 3) {
                    contentParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: fieldData.content.content[0],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[1],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[2],
                            }),
                        ],
                    });
                } else if (fieldData.content.content.length === 4) {
                    contentParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: fieldData.content.content[0],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[1],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[2],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[3],
                            }),
                        ],
                    });
                } else if (fieldData.content.content.length === 5) {
                    contentParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: fieldData.content.content[0],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[1],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[2],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[3],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[4],
                            }),
                        ],
                    });
                } else if (fieldData.content.content.length === 6) {
                    contentParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: fieldData.content.content[0],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[1],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[2],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[3],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[4],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[5],
                            }),
                        ],
                    });
                } else if (fieldData.content.content.length === 7) {
                    contentParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: fieldData.content.content[0],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[1],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[2],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[3],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[4],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[5],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[6],
                            }),
                        ],
                    });
                } else if (fieldData.content.content.length === 8) {
                    contentParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: fieldData.content.content[0],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[1],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[2],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[3],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[4],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[5],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[6],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[7],
                            }),
                        ],
                    });
                } else if (fieldData.content.content.length === 9) {
                    contentParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: fieldData.content.content[0],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[1],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[2],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[3],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[4],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[5],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[6],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[7],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[8],
                            }),
                        ],
                    });
                } else if (fieldData.content.content.length === 10) {
                    contentParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: fieldData.content.content[0],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[1],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[2],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[3],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[4],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[5],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[6],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[7],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[8],
                            }),
                            new Paragraph({
                                text: fieldData.content.content[9],
                            }),
                        ],
                    });
                }
            }

            // Generate the experiences paragraph a.k.a. the integrated experiences of the current section
            if (hasExperiences) {
                if (experiences.length === 1) {
                    experiencesParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: experiences[0],
                                bullet: { level: 0 },
                            }),
                        ],
                    });
                } else if (experiences.length === 2) {
                    experiencesParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: experiences[0],
                                bullet: { level: 0 },
                            }),
                            new Paragraph({
                                text: experiences[1],
                                bullet: { level: 0 },
                            }),
                        ],
                    });
                } else if (experiences.length === 3) {
                    experiencesParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: experiences[0],
                                bullet: { level: 0 },
                            }),
                            new Paragraph({
                                text: experiences[1],
                                bullet: { level: 0 },
                            }),
                            new Paragraph({
                                text: experiences[2],
                                bullet: { level: 0 },
                            }),
                        ],
                    });
                } else if (experiences.length === 4) {
                    experiencesParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: experiences[0],
                                bullet: { level: 0 },
                            }),
                            new Paragraph({
                                text: experiences[1],
                                bullet: { level: 0 },
                            }),
                            new Paragraph({
                                text: experiences[2],
                                bullet: { level: 0 },
                            }),
                            new Paragraph({
                                text: experiences[3],
                                bullet: { level: 0 },
                            }),
                        ],
                    });
                } else if (experiences.length === 5) {
                    experiencesParagraph = new Paragraph({
                        children: [
                            new Paragraph({
                                text: experiences[0],
                                bullet: { level: 0 },
                            }),
                            new Paragraph({
                                text: experiences[1],
                                bullet: { level: 0 },
                            }),
                            new Paragraph({
                                text: experiences[2],
                                bullet: { level: 0 },
                            }),
                            new Paragraph({
                                text: experiences[3],
                                bullet: { level: 0 },
                            }),
                            new Paragraph({
                                text: experiences[4],
                                bullet: { level: 0 },
                            }),
                        ],
                    });
                }
            }

            // Generate the entire current section of the document
            if (hasTitle && hasContent && hasExperiences) {
                return new Paragraph({
                    children: [
                        titleParagraph,
                        contentParagraph,
                        experiencesParagraph,
                    ],
                });
            } else if (hasTitle && hasContent) {
                return new Paragraph({
                    children: [titleParagraph, contentParagraph],
                });
            } else if (hasTitle && hasExperiences) {
                return new Paragraph({
                    children: [titleParagraph, experiencesParagraph],
                });
            } else if (hasTitle) {
                return titleParagraph;
            } else {
                return new Paragraph("");
            }
        } else {
            return new Paragraph("");
        }
    }

    htmlToDOCX() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Download Lesson Plan (as DOCX)' button",
            Result: "Download DOCX finalized LP",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.countNumberOfSections();

        const document = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            text: "Lesson Plan",
                            heading: HeadingLevel.TITLE,
                        }),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                        this.generateSection(),
                    ],
                },
            ],
        });

        Packer.toBlob(document).then((blob) => {
            console.log(blob);
            saveAs(blob, "Lesson_Plan_DOCX.docx");
            console.log("Document created successfully");
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
                if (fieldData.content.content) {
                    content.push(fieldData.content.content);
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
        userIntData.push({
            Action: "Clicked",
            Target: "'Download Lesson Plan (as PDF)' button",
            Result: "Download PDF finalized LP",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        const documentDefinition = this.getDocumentDefinition();
        pdfMake.createPdf(documentDefinition).download("Lesson_Plan_PDF.pdf");
    }

    onBackClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Back' button",
            Result: "Navigate to Display LP page",
            Time: time.toLocaleString(),
        });
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
        userIntData.push({
            Action: "Clicked",
            Target: "'Home' button",
            Result: "Navigate to Landing page to start new LP contextualization",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        this.router.navigate(["/landing"]);
    }
}
