import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { doc, Firestore, getDoc } from "@angular/fire/firestore";
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
    selectedCapture: string = "";
    captures: any = [];
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
        private firestore: Firestore,
        private angularFirestore: AngularFirestore, // inject Firestore
        private pdfReaderService: PdfReaderService, // Inject your service to convert PDF to JSON
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

        await this.getCaptures();
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

    async getCaptures() {
        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.firestore, classroom);
        const classroomDocSnap = await getDoc(currClassroomDocRef);
        let capture_id: any = "";
        let selected_topic: any = "";
        let start_date: any = {};
        let due_date: any = {};
        let previous_captures: any = {};
        let future_captures: any = {};

        //Get previous captures
        if (classroomDocSnap.exists()) {
            capture_id = classroomDocSnap.data()["capture"] || "";
            selected_topic = classroomDocSnap.data()["selected_topic"] || "";
            start_date = classroomDocSnap.data()["start_date"] || {};
            due_date = classroomDocSnap.data()["due_date"] || {};
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || {};
            future_captures = classroomDocSnap.data()["future_captures"] || {};
        } else {
            console.log("No such document!");
        }

        //Get all previous captures and store them
        for (const key of Object.keys(previous_captures)) {
            //const numbersOnly = key.replace(/[^0-9]/g, ""); // Remove non-numeric characters
            //const trailingNumbersMatch = key.match(/(\d+)$/); // Match digits at the end of the string
            //let num = trailingNumbersMatch ? trailingNumbersMatch[0] : "1"; // Return the matched digits or an empty string if no match
            //const idx = Number(num);

            const startDate = new Date(
                previous_captures[key]["start_date"].seconds * 1000 +
                    previous_captures[key]["start_date"].nanoseconds / 1000000
            ).toLocaleDateString();
            const endDate = new Date(
                previous_captures[key]["due_date"].seconds * 1000 +
                    previous_captures[key]["due_date"].nanoseconds / 1000000
            ).toLocaleDateString();

            const captureObject = {
                //capture: classroom + idx.toString(),
                capture: key,
                name: previous_captures[key]["name"],
                start_date: startDate,
                due_date: endDate,
            };

            this.captures.push(captureObject);
        }

        //Check if a current capture is active and store it
        if (capture_id !== "") {
            let startDate = new Date(
                start_date.seconds * 1000 + start_date.nanoseconds / 1000000
            ).toLocaleDateString();
            let endDate = new Date(
                due_date.seconds * 1000 + due_date.nanoseconds / 1000000
            ).toLocaleDateString();

            const currCapture = {
                capture: capture_id,
                name: selected_topic,
                start_date: startDate,
                due_date: endDate,
            };
            this.captures.push(currCapture);
        }

        //Get all the future captures and store them
        for (const key of Object.keys(future_captures)) {
            //const idx = this.captures.length;
            const startDate = new Date(
                future_captures[key]["start_date"].seconds * 1000 +
                    future_captures[key]["start_date"].nanoseconds / 1000000
            ).toLocaleDateString();
            const endDate = new Date(
                future_captures[key]["due_date"].seconds * 1000 +
                    future_captures[key]["due_date"].nanoseconds / 1000000
            ).toLocaleDateString();

            const captureObject = {
                //capture: classroom + idx.toString(),
                capture: future_captures[key]["capture"],
                name: future_captures[key]["name"],
                start_date: startDate,
                due_date: endDate,
            };

            this.captures.push(captureObject);
        }
    }

    onSelectCaptureDropdownClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Select A Capture' dropdown",
            Result: "Open a dropdown with all the captures for the current selected classroom",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    selectCapture() {
        let selectedCaptureName: string = "";
        let captureStartDate: string = "";
        let captureDueDate: string = "";

        for (const capture of this.captures) {
            if (capture["capture"] === this.selectedCapture) {
                selectedCaptureName = capture["name"];
                captureStartDate = capture["start_date"];
                captureDueDate = capture["due_date"];
                break;
            }
        }

        sessionStorage.setItem("selectedCapture", this.selectedCapture);

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Selected",
            Target:
                "'" +
                selectedCaptureName +
                "(" +
                captureStartDate +
                " to " +
                captureDueDate +
                ")" +
                "' option",
            Result: "Set the capture for the lesson plan to be uploaded",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
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

        //if (!this.topicName && !this.selectedFile) {
        //    this.openAlertDialog(
        //        "Incomplete Data",
        //        "Please enter a science topic and select the PDF of your lesson plan to upload."
        //    );
        //    this.resetUploadState();
        //    return;
        //}

        if (!this.selectedCapture) {
            this.openAlertDialog("Incomplete Data", "Please select a capture.");
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
                "Please select a lesson plan PDF to upload."
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
                                        capture:
                                            sessionStorage.getItem(
                                                "selectedCapture"
                                            ),
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
                                        capture:
                                            sessionStorage.getItem(
                                                "selectedCapture"
                                            ),
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

                                this.angularFirestore
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
                                        sessionStorage.setItem(
                                            "fileUploadSuccess",
                                            "true"
                                        );
                                        sessionStorage.removeItem(
                                            "selectedCapture"
                                        );
                                        this.loading = false;
                                        this.router.navigate(["/display"]);
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
        this.selectedCapture = "";
        this.topicName = "";
        this.selectedFile = null;
        this.labelText = "No file selected";
        this.uploadStatus = "";
        this.uploadProgress = 0;
        this.fileDownloadURL = "";
    }

    openAlertDialog(title: string, message: string): void {
        this.dialog.open(AlertDialogComponent, {
            width: "600px",
            data: { title: title, message: message },
        });
    }
}
