import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { PdfReaderService } from "../pdf-reader-service/pdf-reader.service";
import {
    Storage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "@angular/fire/storage";

import { ExperienceLessonPlanService } from "../experience-lesson-plan-service/experience-lesson-plan.service";
import { Experience } from "../experience";
import { AlertDialogComponent } from "../alert-dialog/alert-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: "app-lesson-page",
    templateUrl: "./lesson-page.component.html",
    styleUrls: ["./lesson-page.component.css"],
})
export class LessonPageComponent implements OnInit, OnDestroy {
    selectedFile: File | null = null;
    uploadStatus: string = "";
    uploadProgress: number = 0;
    fileDownloadURL: string | null = null;
    labelText: string = "No file selected";
    uploadInProgress: boolean = false;

    mainTopics: string[] = [
        "Life Science",
        "Physical Science",
        "Earth and Space Science",
        "Nature of Science",
    ];

    subTopics: { [key: string]: string[] } = {
        "Life Science": [
            "Organization and Development of Living Organisms",
            "Diversity and Evolution of Living Organism",
            "Interdependence",
        ],
        "Physical Science": [
            "Properties of Matter",
            "Changes in Matter",
            "Forms of Energy",
            "Energy Transfer and Transformations",
            "Forces and Changes in Motion",
        ],
        "Earth and Space Science": [
            "Earth in Space and Time",
            "Earth Systems and Patterns",
        ],
        "Nature of Science": [
            "The Practice of Science",
            "The Characteristics of Scientific Knowledge",
        ],
    };

    selectedMainTopic: string = "";
    selectedSubTopic: string = "";

    timeStart!: Date;
    timeEnd!: Date;

    constructor(
        private storage: Storage,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private expLessonPlanService: ExperienceLessonPlanService,
        private firestore: AngularFirestore, // inject Firestore
        private pdfReaderService: PdfReaderService, // Inject your service to convert PDF to JSON
        public dialog: MatDialog
    ) {}

    ngOnInit() {
        this.timeStart = new Date();
        let userIntData: any = [];
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Visited",
                Target: "Upload LP page",
                Result: "",
                Time: this.timeStart.toLocaleString(),
            }
            // "Visited Upload LP Page at " + this.timeStart.toLocaleString()
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
                Target: "Upload LP page",
                Result: "",
                Time: this.timeEnd.toLocaleString(),
            }
            // "Left Upload LP Page at " + this.timeEnd.toLocaleString()
        );
        userIntData.push(
            {
                Action: "Time spent",
                Target: "Upload LP page",
                Result: "",
                Time: duration + " seconds",
            }
            // "Time spent on Upload LP Page: " + duration + " seconds"
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onMainTopicDropdownClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Select a science unit' dropdown menu",
                Result: "Select the main topic",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Select a science unit' at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onSubTopicDropdownClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Select a sub-topic' dropdown menu",
                Result: "Select the sub-topic",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Select a sub-topic' at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    openAlertDialog(title: string, message: string): void {
        this.dialog.open(AlertDialogComponent, {
            width: "250px",
            data: { title: title, message: message },
        });
    }

    onFileSelected(event: any) {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Browse Files...' button",
                Result: "Open window to browse files",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Browse Files...' at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.selectedFile = event.target.files[0];
        this.labelText = this.selectedFile
            ? this.selectedFile.name
            : "No file selected";
        if (!this.selectedFile || !this.selectedFile.name) {
            this.openAlertDialog(
                "Error",
                "No file selected or file name is not valid."
            );
            return;
        }

        const fileExtension = this.selectedFile.name
            .split(".")
            .pop()
            ?.toLowerCase();

        if (fileExtension === "pdf") {
        } else if (fileExtension === "doc" || fileExtension === "docx") {
            this.openAlertDialog(
                "File Format Error",
                "Please convert your Word file to PDF and then upload."
            );
            this.resetUploadState();
            return;
        } else {
            this.openAlertDialog(
                "Unsupported Format",
                "The selected file format is not supported. Please upload a PDF."
            );
            this.resetUploadState();
            return;
        }
        console.log(this.selectedFile);
        console.log(this.labelText);
    }

    onUpload() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Upload' button",
                Result: "Upload selected LP file",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Upload' at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        if (!this.selectedMainTopic || !this.selectedSubTopic) {
            if (!this.selectedFile) {
                this.uploadStatus =
                    "Please select both topic and sub-topic and a file";
                console.log(this.uploadStatus);
                return;
            } else {
                this.uploadStatus = "Please select both topic and sub-topic";
                return;
            }
        }

        if (!this.selectedFile) {
            this.uploadStatus = "No file selected";
            this.uploadInProgress = true;
            console.log(this.uploadStatus);
            return;
        }

        this.expLessonPlanService.changeMainTopic(this.selectedMainTopic); // deliver selected main topic to other components
        this.expLessonPlanService.changeSubTopic(this.selectedSubTopic); // deliver selected sub topic to other components

        const filePath = `${this.selectedMainTopic}/${this.selectedSubTopic}/${this.selectedFile.name}`;
        const fileRef = ref(this.storage, `lesson-files/${filePath}`);
        const uploadTask = uploadBytesResumable(fileRef, this.selectedFile);

        // observe percentage changes
        uploadTask.on(
            "state_changed",
            (snapshot: any) => {
                console.log(snapshot);
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                this.uploadProgress = progress;

                if (snapshot.state === "running" && progress < 100) {
                    this.uploadStatus = "Uploading...";
                }
            },
            (error) => {
                // Handle unsuccessful uploads
                console.error("Error uploading file:", error);
                this.uploadStatus = "Error during upload";
                this.uploadInProgress = false;
            },
            () => {
                // On success
                this.uploadStatus = "Uploaded";

                getDownloadURL(fileRef)
                    .then((downloadURL: string) => {
                        console.log("File available at", downloadURL);
                        this.fileDownloadURL = downloadURL;

                        // Save the file URL to sessionStorage for accessing it in DisplayPageComponent
                        sessionStorage.setItem("fileURL", downloadURL);

                        this.pdfReaderService
                            .convertPdfToJson(this.fileDownloadURL)
                            .then((jsonData) => {
                                const mainTopic =
                                    this.expLessonPlanService
                                        .currentMainTopicValue;
                                const subTopic =
                                    this.expLessonPlanService
                                        .currentSubTopicValue;

                                if (
                                    sessionStorage.getItem("altNavigation") ===
                                        "true" &&
                                    sessionStorage.getItem(
                                        "numIntegratedExperiences"
                                    ) !== null &&
                                    Number(
                                        sessionStorage.getItem(
                                            "numIntegratedExperiences"
                                        )
                                    ) > 0
                                ) {
                                    let multipleIntegrate: any = [];
                                    let numIntegratedExperiences = Number(
                                        sessionStorage.getItem(
                                            "numIntegratedExperiences"
                                        )
                                    );

                                    [
                                        ...Array(numIntegratedExperiences),
                                    ].forEach((_, index) => {
                                        let exp: Experience = JSON.parse(
                                            sessionStorage.getItem(
                                                "integratedExp".concat(
                                                    (index + 1).toString()
                                                )
                                            ) || "{}"
                                        );
                                        sessionStorage.removeItem(
                                            "integratedExp".concat(
                                                (index + 1).toString()
                                            )
                                        );
                                        multipleIntegrate.push(exp);
                                    });
                                    sessionStorage.removeItem(
                                        "numIntegratedExperiences"
                                    );

                                    jsonData = {
                                        Grade: {
                                            title: "Grade",
                                            content: jsonData["Grade"],
                                            integrated_experiences: [],
                                        },
                                        Subject: {
                                            title: "Subject",
                                            content: jsonData["Subject"],
                                            integrated_experiences: [],
                                        },
                                        Duration: {
                                            title: "Duration",
                                            content: jsonData["Duration"],
                                            integrated_experiences: [],
                                        },
                                        "Lesson Standards & Objectives": {
                                            title: "Lesson Standards & Objectives",
                                            content:
                                                jsonData[
                                                    "Lesson Standards & Objectives"
                                                ],
                                            integrated_experiences: [],
                                        },
                                        Materials: {
                                            title: "Materials",
                                            content: jsonData["Materials"],
                                            integrated_experiences: [],
                                        },
                                        "Warm-Up": {
                                            title: "Warm-Up",
                                            content: jsonData["Warm-Up"],
                                            integrated_experiences: [],
                                        },
                                        "Teacher-Led Instruction": {
                                            title: "Teacher-Led Instruction",
                                            content:
                                                jsonData[
                                                    "Teacher-Led Instruction"
                                                ],
                                            integrated_experiences: [],
                                        },
                                        "Student-Led Learning": {
                                            title: "Student-Led Learning",
                                            content:
                                                jsonData[
                                                    "Student-Led Learning"
                                                ],
                                            integrated_experiences: [],
                                        },
                                        "Wrap-Up Closure": {
                                            title: "Wrap-Up Closure",
                                            content:
                                                jsonData["Wrap-Up Closure"],
                                            integrated_experiences: [],
                                        },
                                        mainTopic: mainTopic,
                                        subTopic: subTopic,
                                        createdAt: new Date(),
                                        integrated_experiences: [
                                            ...multipleIntegrate,
                                        ],
                                    };

                                    console.log(
                                        "At Upload, Main Topic: ",
                                        mainTopic
                                    );
                                    console.log(
                                        "At Upload, Sub Topic: ",
                                        subTopic
                                    );
                                    console.log(
                                        "At Upload, Created At: ",
                                        new Date()
                                    );
                                    console.log(
                                        "At Upload, Integrated Experiences: ",
                                        multipleIntegrate
                                    );
                                } else {
                                    jsonData = {
                                        Grade: {
                                            title: "Grade",
                                            content: jsonData["Grade"],
                                            integrated_experiences: [],
                                        },
                                        Subject: {
                                            title: "Subject",
                                            content: jsonData["Subject"],
                                            integrated_experiences: [],
                                        },
                                        Duration: {
                                            title: "Duration",
                                            content: jsonData["Duration"],
                                            integrated_experiences: [],
                                        },
                                        "Lesson Standards & Objectives": {
                                            title: "Lesson Standards & Objectives",
                                            content:
                                                jsonData[
                                                    "Lesson Standards & Objectives"
                                                ],
                                            integrated_experiences: [],
                                        },
                                        Materials: {
                                            title: "Materials",
                                            content: jsonData["Materials"],
                                            integrated_experiences: [],
                                        },
                                        "Warm-Up": {
                                            title: "Warm-Up",
                                            content: jsonData["Warm-Up"],
                                            integrated_experiences: [],
                                        },
                                        "Teacher-Led Instruction": {
                                            title: "Teacher-Led Instruction",
                                            content:
                                                jsonData[
                                                    "Teacher-Led Instruction"
                                                ],
                                            integrated_experiences: [],
                                        },
                                        "Student-Led Learning": {
                                            title: "Student-Led Learning",
                                            content:
                                                jsonData[
                                                    "Student-Led Learning"
                                                ],
                                            integrated_experiences: [],
                                        },
                                        "Wrap-Up Closure": {
                                            title: "Wrap-Up Closure",
                                            content:
                                                jsonData["Wrap-Up Closure"],
                                            integrated_experiences: [],
                                        },
                                        mainTopic: mainTopic,
                                        subTopic: subTopic,
                                        createdAt: new Date(),
                                        integrated_experiences: [],
                                    };

                                    console.log(
                                        "At Upload, Main Topic: ",
                                        mainTopic
                                    );
                                    console.log(
                                        "At Upload, Sub Topic: ",
                                        subTopic
                                    );
                                    console.log(
                                        "At Upload, Created At: ",
                                        new Date()
                                    );
                                    console.log(
                                        "At Upload, Integrated Experiences: ",
                                        []
                                    );
                                }

                                this.firestore
                                    .collection("Documents")
                                    .add(jsonData)
                                    .then((documentRef) => {
                                        // Redirect to DisplayPageComponent
                                        this.expLessonPlanService.setLatestDocumentId(
                                            documentRef.id
                                        );
                                        sessionStorage.setItem(
                                            "documentId",
                                            documentRef.id
                                        );
                                        this.router.navigate(["/display"]);
                                        sessionStorage.setItem(
                                            "fileUploadSuccess",
                                            "true"
                                        );
                                        this.cdr.detectChanges();
                                    })
                                    .catch((err) =>
                                        console.error(
                                            "Error adding document: ",
                                            err
                                        )
                                    );
                            })
                            .catch((err) =>
                                console.error(
                                    "Error converting PDF to JSON: ",
                                    err
                                )
                            );
                    })
                    .catch((error: any) => {
                        console.error("Error getting download URL:", error);
                        this.uploadStatus = "Error getting download link";
                    });
                this.resetUploadState();
                this.uploadInProgress = false;
            }
        );
    }

    resetUploadState() {
        this.selectedFile = null;
        this.labelText = "No file selected";
        this.uploadStatus = "";
        this.uploadProgress = 0;
        this.fileDownloadURL = "";
        this.selectedMainTopic = "";
        this.selectedSubTopic = "";
    }
}
