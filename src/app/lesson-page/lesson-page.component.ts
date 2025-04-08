import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import {
    Storage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "@angular/fire/storage";

import { ExperienceLessonPlanService } from "../experience-lesson-plan-service/experience-lesson-plan.service";
import { PdfReaderService } from "../pdf-reader-service/pdf-reader.service";
import { Experience } from "../experience";
import { AlertDialogComponent } from "../alert-dialog/alert-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
    selector: "app-lesson-page",
    templateUrl: "./lesson-page.component.html",
    styleUrls: ["./lesson-page.component.css"],
})
export class LessonPageComponent implements OnInit, OnDestroy {
    startNavigationFromExperiences: boolean = false;
    selectedFile: File | null = null;
    uploadStatus: string = "";
    uploadProgress: number = 0;
    fileDownloadURL: string | null = null;
    labelText: string = "No file selected";
    uploadInProgress: boolean = false;
    loading: boolean = false;
    topicName: string = "";

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
        userIntData.push({
            Action: "Visited",
            Target: "'Upload Lesson Plan' page",
            Result: "",
            Time: this.timeStart.toLocaleString(),
        });
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
        userIntData.push({
            Action: "Left",
            Target: "'Upload Lesson Plan' page",
            Result: "",
            Time: this.timeEnd.toLocaleString(),
        });
        userIntData.push({
            Action: "Time spent",
            Target: "'Upload Lesson Plan' page",
            Result: "",
            Time: duration + " seconds",
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onPreviousPageButtonClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Previous Page' button",
            Result: "Navigate to 'Create Lesson Plan' page",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.router.navigate(["/instructions"]);
    }

    onNextPageButtonClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Next Page' button",
            Result:
                "Navigate to '" + this.startNavigationFromExperiences
                    ? "Customize Lesson Plan"
                    : "Browse Experiences" + "' page",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        if (!this.startNavigationFromExperiences) {
            this.router.navigate(["/experience"]);
        } else {
            this.router.navigate(["/display"]);
        }
    }

    onTopicInputClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Enter a science topic' input",
            Result: "Enter the science topic name",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onTopicInput() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Typed",
            Target: "'Enter a science topic' input",
            Result: this.topicName,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onFileSelected(event: any) {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Browse Files...' button",
            Result: "Open window to browse files",
            Time: time.toLocaleString(),
        });
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
        userIntData.push({
            Action: "Clicked",
            Target: "'Upload' button",
            Result: "Upload selected lesson plan file",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        //if (!this.selectedMainTopic) {
        /*if(!this.topicName) {
            if (!this.selectedFile) {
                this.uploadStatus =
                    "Please enter a science topic and your lesson plan file";
                console.log(this.uploadStatus);
                return;
            } else {
                this.uploadStatus = "Please enter a science topic";
                return;
            }
        }*/

        if (!this.topicName && !this.selectedFile) {
            this.openAlertDialog(
                "Incomplete Data",
                "Please enter a science topic and select the PDF of your lesson plan to upload."
            );
            this.resetUploadState();
            return;
        }

        if (!this.topicName) {
            this.openAlertDialog(
                "Incomplete Data",
                "Please enter a science topic."
            );
            this.resetUploadState();
            return;
        }

        if (!this.selectedFile) {
            //this.uploadStatus = "No file selected";
            //this.uploadInProgress = true;
            //console.log(this.uploadStatus);
            //return;
            this.openAlertDialog(
                "Incomplete Data",
                "Please select the PDF of your lesson plan to upload."
            );
            this.resetUploadState();
            return;
        }

        //this.expLessonPlanService.changeMainTopic(this.selectedMainTopic); // deliver selected main topic to other components
        this.expLessonPlanService.changeMainTopic(this.topicName); // deliver selected main topic to other components

        const username = sessionStorage.getItem("username");
        //const filePath = `${this.selectedMainTopic}/${username}/${this.selectedFile.name}`;
        const filePath = `${this.topicName}/${username}/${this.selectedFile.name}`;
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
                this.loading = true;

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
                                        createdAt: new Date(),
                                        integrated_experiences: [
                                            ...multipleIntegrate,
                                        ],
                                    };

                                    //console.log(
                                    //    "At Upload, Main Topic: ",
                                    //    mainTopic
                                    //);
                                    //console.log(
                                    //    "At Upload, Created At: ",
                                    //    new Date()
                                    //);
                                    //console.log(
                                    //    "At Upload, Integrated Experiences: ",
                                    //    multipleIntegrate
                                    //);
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
                                        createdAt: new Date(),
                                        integrated_experiences: [],
                                    };

                                    //console.log(
                                    //    "At Upload, Main Topic: ",
                                    //    mainTopic
                                    //);
                                    //console.log(
                                    //    "At Upload, Created At: ",
                                    //    new Date()
                                    //);
                                    //console.log(
                                    //    "At Upload, Integrated Experiences: ",
                                    //    []
                                    //);
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
                                        this.loading = false;
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
        this.topicName = "";
    }

    openAlertDialog(title: string, message: string): void {
        this.dialog.open(AlertDialogComponent, {
            width: "600px",
            data: { title: title, message: message },
        });
    }
}
