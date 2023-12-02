import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { arrayUnion } from "firebase/firestore";
import { take } from "rxjs/operators";
import { DocumentData } from "../documentData";

import {
    Storage,
    getDownloadURL,
    ref,
    uploadBytesResumable,
} from "@angular/fire/storage";

import { ExperienceLessonPlanService } from "../experience-lesson-plan-service/experience-lesson-plan.service";
import { ExperienceService } from "../experience-service/experience-service.service";
import { Experience } from "../experience";
import { Student } from "../student";

import { Papa } from "ngx-papaparse";
import { Subscription } from "rxjs";

import { MatDialog } from "@angular/material/dialog";
import { AlertDialogComponent } from "../alert-dialog/alert-dialog.component";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { Observable } from "rxjs";

@Component({
    selector: "app-experience-page",
    templateUrl: "./experience-page.component.html",
    styleUrls: ["./experience-page.component.css"],
})
export class ExperiencePageComponent implements OnInit, OnDestroy {
    experienceForm!: FormGroup;
    editForm!: FormGroup;

    experienceDetails: any;
    experiences: any = [];

    selectedExperienceFile: File | null = null;
    selectStudentFile: File | null = null;
    experienceLabelText: string = "Choose a file";
    studentLabelText: string = "Choose a file";

    id: string = "";

    keywordSearchTerm!: string;
    studentSearchTerm!: string;
    // dateSearchTerm!: string;  // For normal HTML
    dateSearchTerm!: Date; // For mat-form-field mat-input mat-datepicker
    dateTerm!: string; // For mat-form-field mat-input mat-datepicker
    startDateSearchTerm!: Date;
    startDateTerm!: string;
    endDateSearchTerm!: Date;
    endDateTerm!: string;

    filteredExp: any = [];
    multipleIntegrate: any = [];

    startNavigationFromExperiences: boolean = false;

    timeStart!: Date;
    timeEnd!: Date;

    experienceObject: Experience = {
        id: "",
        experience_title: "",
        experience_description: "",
        student_name: "",
        date: "",
        student_data: {
            id: "",
            student_name: "",
            student_gender: "",
            student_last_test_grade: "",
            student_table: "",
            student_overall_performance: "",
            student_learning_disability: "",
            student_race_ethnicity: "",
            student_attendance: "",
            student_class_participation: "",
        },
    };

    studentObject: Student = {
        id: "",
        student_name: "",
        student_gender: "",
        student_last_test_grade: "",
        student_table: "",
        student_overall_performance: "",
        student_learning_disability: "",
        student_race_ethnicity: "",
        student_attendance: "",
        student_class_participation: "",
    };

    constructor(
        private firestore: AngularFirestore,
        private experience_service: ExperienceService,
        private expLessonPlanService: ExperienceLessonPlanService,
        private cdr: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private datePipe: DatePipe,
        private router: Router,
        private storage: Storage,
        private papa: Papa,
        public dialog: MatDialog
    ) {
        this.experienceForm = this.formBuilder.group({
            title: ["", Validators.required],
            description: ["", Validators.required],
            student_name: ["", Validators.required],
            date: ["", Validators.required],
        });

        this.editForm = this.formBuilder.group({
            edited_title: ["", Validators.required],
            edited_description: ["", Validators.required],
            edited_student_name: ["", Validators.required],
            edited_date: ["", Validators.required],
        });
    }

    openAlertDialog(title: string, message: string): void {
        this.dialog.open(AlertDialogComponent, {
            width: "250px",
            data: { title: title, message: message },
        });
    }

    openConfirmDialog(title: string, message: string): Observable<boolean> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: "250px",
            data: { title, message },
        });

        return dialogRef.afterClosed();
    }

    ngOnInit() {
        this.timeStart = new Date();
        let userIntData: any = [];
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Visited",
                Target: "Experiences page",
                Result: "",
                Time: this.timeStart.toLocaleString(),
            }
            // "Visited Experiences Page at " + this.timeStart.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        sessionStorage.setItem("timeStart", this.timeStart.toString());

        this.getAllExperiences();

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
                Target: "Experiences page",
                Result: "",
                Time: this.timeEnd.toLocaleString(),
            }
            // "Left Experiences Page at " + this.timeEnd.toLocaleString()
        );
        userIntData.push(
            {
                Action: "Time spent",
                Target: "Experiences page",
                Result: "",
                Time: duration + " seconds",
            }
            // "Time spent on Experiences Page: " + duration + " seconds"
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    addExperience() {
        const { value } = this.experienceForm;
        console.log(value);

        this.experienceObject.id = "";
        this.experienceObject.experience_title = value.title;
        this.experienceObject.experience_description = value.description;
        this.experienceObject.student_name = value.student_name;
        this.experienceObject.date = this.datePipe.transform(
            value.date,
            "yyyy-MM-dd"
        ) as string; // format it as you need
        console.log(this.experienceObject);
        this.experience_service
            .addExperience(this.experienceObject)
            .then((experience) => {
                if (experience) {
                    alert("Experience Added Successfully");
                    this.experienceForm.reset();
                }
            });
    }

    getAllExperiences() {
        this.experience_service
            .getExperience()
            .subscribe((res: Experience[]) => {
                this.experiences = res;
                this.filteredExp = [...this.experiences];
            });
    }

    deleteExperience(experience: Experience) {
        let decision = confirm(
            "Are you sure you want to delete this experience?"
        );

        if (decision === true) {
            this.experience_service.deleteExperience(experience);
        }
    }

    integrateExperience(expToIntegrate: Experience) {
        let decision = confirm(
            "Are you sure you want to integrate this experience with your lesson plan?"
        );

        if (decision === true) {
            // First, get the document ID.
            console.log("Clicked OK");
            this.expLessonPlanService.currentDocumentId
                .pipe(take(1))
                .subscribe((id) => {
                    console.log("Inside subscribe callback");
                    if (id) {
                        this.id = id;
                        console.log("Document ID:", this.id);
                        console.log("Experience to integrate:", expToIntegrate);
                        // Now, we have the ID, so let's try to update Firestore.
                        this.firestore
                            .collection("Documents")
                            .doc(this.id)
                            .get()
                            .toPromise()
                            .then((doc) => {
                                if (doc && doc.exists) {
                                    const data = doc.data() as DocumentData;
                                    const existingExperiences =
                                        data.integrated_experiences || [];
                                    existingExperiences.push(expToIntegrate);
                                    return this.firestore
                                        .collection("Documents")
                                        .doc(this.id)
                                        .update({
                                            integrated_experiences:
                                                existingExperiences,
                                        });
                                } else {
                                    throw new Error("Document doesn't exist");
                                }
                            })
                            .then(() => {
                                this.expLessonPlanService.changeExperience(
                                    expToIntegrate
                                );
                                this.router.navigate(["/display"]);
                            })
                            .catch((err: any) => {
                                console.error(
                                    "Error integrating experience: ",
                                    err
                                );
                            });
                    }
                });
        }
    }

    // Add multiple experiences
    addRemoveMultipleExp(exp: Experience) {
        if (this.multipleIntegrate.includes(exp)) {
            let userIntData: any = [];
            let time = new Date();
            userIntData = JSON.parse(
                sessionStorage.getItem("userInteractionData") || "[]"
            );
            userIntData.push(
                {
                    Action: "Clicked",
                    Target:
                        "Checkbox for experience with title number " +
                        this.getNumberFromTitle(exp.experience_title),
                    Result: "De-select the experience",
                    Time: time.toLocaleString(),
                }
                // "Clicked checkbox to de-select experience with title number " +
                //     this.getNumberFromTitle(exp.experience_title) +
                //     " at " +
                //     time.toLocaleString()
            );
            sessionStorage.setItem(
                "userInteractionData",
                JSON.stringify(userIntData)
            );

            const index = this.multipleIntegrate.indexOf(exp, 0);
            this.multipleIntegrate.splice(index, 1);
        } else {
            let userIntData: any = [];
            let time = new Date();
            userIntData = JSON.parse(
                sessionStorage.getItem("userInteractionData") || "[]"
            );
            userIntData.push(
                {
                    Action: "Clicked",
                    Target:
                        "Checkbox for experience with title number " +
                        this.getNumberFromTitle(exp.experience_title),
                    Result: "Select the experience",
                    Time: time.toLocaleString(),
                }
                // "Clicked checkbox to select experience with title number " +
                //     this.getNumberFromTitle(exp.experience_title) +
                //     " at " +
                //     time.toLocaleString()
            );
            sessionStorage.setItem(
                "userInteractionData",
                JSON.stringify(userIntData)
            );

            this.multipleIntegrate.push(exp);
        }
    }

    // Check candidacy of element to set checkbox attribute
    checkCandidacy(exp: Experience) {
        if (this.multipleIntegrate.includes(exp)) {
            return true;
        } else {
            return false;
        }
    }

    // Integrate multiple experiences
    integrateMultipleExp() {
        if (!this.multipleIntegrate || this.multipleIntegrate.length === 0) {
            this.openAlertDialog(
                "Integration Error",
                "Please select experiences to integrate."
            );

            let userIntData: any = [];
            let time = new Date();
            userIntData = JSON.parse(
                sessionStorage.getItem("userInteractionData") || "[]"
            );
            userIntData.push(
                {
                    Action: "Clicked",
                    Target: "'Ok' button",
                    Result: "Close alert dialog box",
                    Time: time.toLocaleString(),
                }
                // "Clicked 'Ok' at " + time.toLocaleString()
            );
            sessionStorage.setItem(
                "userInteractionData",
                JSON.stringify(userIntData)
            );

            return;
        }

        this.openConfirmDialog(
            "Integration Confirmation",
            "Are you sure you want to integrate these experiences with your lesson plan?"
        ).subscribe((decision: boolean) => {
            if (decision) {
                let userIntData: any = [];
                let time = new Date();
                userIntData = JSON.parse(
                    sessionStorage.getItem("userInteractionData") || "[]"
                );
                userIntData.push(
                    {
                        Action: "Clicked",
                        Target: "'Yes, Confirm' button",
                        Result: "Integrate selected experiences with LP",
                        Time: time.toLocaleString(),
                    }
                    // "Clicked 'Yes, Confirm' at " + time.toLocaleString()
                );
                sessionStorage.setItem(
                    "userInteractionData",
                    JSON.stringify(userIntData)
                );

                if (
                    decision === true &&
                    this.startNavigationFromExperiences === true &&
                    sessionStorage.getItem("fileUploadSuccess") === null
                ) {
                    sessionStorage.setItem("numIntegratedExperiences", "0");

                    this.multipleIntegrate.forEach((exp: any) => {
                        let numExp = sessionStorage.getItem(
                            "numIntegratedExperiences"
                        );
                        numExp = (Number(numExp) + 1).toString();
                        sessionStorage.setItem(
                            "numIntegratedExperiences",
                            numExp
                        );
                        sessionStorage.setItem(
                            "integratedExp".concat(numExp),
                            JSON.stringify(exp)
                        );
                    });

                    this.router.navigate(["/instructions"]);
                } else if (decision === true) {
                    // First, get the document ID.
                    console.log("Clicked OK");
                    this.expLessonPlanService.currentDocumentId
                        .pipe(take(1))
                        .subscribe((id) => {
                            console.log("Inside subscribe callback");
                            if (id) {
                                this.id = id;
                                console.log("Document ID:", this.id);
                                console.log(
                                    "Experience to integrate:",
                                    this.multipleIntegrate
                                );
                                // Now, we have the ID, so let's try to update Firestore.
                                this.firestore
                                    .collection("Documents")
                                    .doc(this.id)
                                    .get()
                                    .toPromise()
                                    .then((doc) => {
                                        if (doc && doc.exists) {
                                            const data =
                                                doc.data() as DocumentData;
                                            const existingExperiences =
                                                data.integrated_experiences ||
                                                [];
                                            existingExperiences.push(
                                                ...this.multipleIntegrate
                                            );
                                            return this.firestore
                                                .collection("Documents")
                                                .doc(this.id)
                                                .update({
                                                    integrated_experiences:
                                                        existingExperiences,
                                                });
                                        } else {
                                            throw new Error(
                                                "Document doesn't exist"
                                            );
                                        }
                                    })
                                    .then(() => {
                                        this.expLessonPlanService.changeExperience(
                                            this.multipleIntegrate
                                        );
                                        this.multipleIntegrate = [];
                                        this.router.navigate(["/display"]);
                                    })
                                    .catch((err: any) => {
                                        console.error(
                                            "Error integrating experience: ",
                                            err
                                        );
                                    });
                            }
                        });
                }
            } else {
                let userIntData: any = [];
                let time = new Date();
                userIntData = JSON.parse(
                    sessionStorage.getItem("userInteractionData") || "[]"
                );
                userIntData.push(
                    {
                        Action: "Clicked",
                        Target: "'No, Go Back' button",
                        Result: "Deny integration of selected experiences",
                        Time: time.toLocaleString(),
                    }
                    // "Clicked 'No, Go back' at " + time.toLocaleString()
                );
                sessionStorage.setItem(
                    "userInteractionData",
                    JSON.stringify(userIntData)
                );
            }
        });
    }

    getExperienceDetails(experience: Experience) {
        this.experienceDetails = experience;
        console.log(this.experienceDetails);
    }

    updateExperience(experience: Experience) {
        const { value } = this.editForm;
        console.log(value);

        this.experienceObject.id = experience.id;
        this.experienceObject.experience_title = value.edited_title;
        this.experienceObject.experience_description = value.edited_description;
        this.experienceObject.student_name = value.edited_student_name;
        this.experienceObject.date = this.datePipe.transform(
            value.edited_date,
            "yyyy-MM-dd"
        ) as string;

        this.experience_service
            .updateExperience(experience, this.experienceObject)
            .then(() => {
                alert("Experience Updated Successfully");
            });

        this.editForm.reset();
    }

    onExperienceFileSelect(event: any) {
        this.selectedExperienceFile = event.target.files[0];
        this.experienceLabelText = this.selectedExperienceFile
            ? this.selectedExperienceFile.name
            : "Choose a File";

        if (!this.selectedExperienceFile || !this.selectedExperienceFile.name) {
            alert("No file selected or file name is not valid.");
            return;
        }

        const fileExtension = this.selectedExperienceFile.name
            .split(".")
            .pop()
            ?.toLowerCase();

        if (fileExtension !== "csv") {
            alert(
                "The selected file format is not supported. Please upload a CSV."
            );
            this.resetUploadState();
            return;
        }

        console.log(this.selectedExperienceFile);
        console.log(this.experienceLabelText);
    }

    resetUploadState() {
        this.selectedExperienceFile = null;
        this.experienceLabelText = "Choose a file";
        this.studentLabelText = "Choose a file";
    }

    onExperienceFileUpload() {
        if (!this.selectedExperienceFile) {
            alert("No file selected.");
            return;
        } else if (this.selectedExperienceFile) {
            alert(
                this.selectedExperienceFile.name + " was successfully uploaded."
            );
            console.log(
                this.selectedExperienceFile.name + " was successfully uploaded."
            );
        }

        const storageRef = ref(
            this.storage,
            `experience_files/${this.selectedExperienceFile.name}`
        );
        const uploadTask = uploadBytesResumable(
            storageRef,
            this.selectedExperienceFile
        );

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");
            },
            (error) => {
                console.log(error.message);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log("File available at", downloadURL);
                });
                this.resetUploadState();
            }
        );

        this.parseExperienceCSVContent(this.selectedExperienceFile);
    }

    parseExperienceCSVContent(file: File) {
        this.papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                if (result.data) {
                    for (let experience of result.data) {
                        this.experienceObject.id = "";
                        this.experienceObject.experience_title = Object.values(
                            experience
                        )[0] as string;
                        this.experienceObject.student_name = Object.values(
                            experience
                        )[1] as string;
                        this.experienceObject.experience_description =
                            Object.values(experience)[2] as string;
                        this.experienceObject.date = this.datePipe.transform(
                            Object.values(experience)[3] as string,
                            "yyyy-MM-dd"
                        ) as string;
                        this.experienceObject.student_data.student_name =
                            Object.values(experience)[1] as string;
                        this.experienceObject.student_data.student_gender =
                            Object.values(experience)[4] as string;
                        this.experienceObject.student_data.student_last_test_grade =
                            Object.values(experience)[5] as string;
                        this.experienceObject.student_data.student_table =
                            Object.values(experience)[6] as string;
                        this.experienceObject.student_data.student_overall_performance =
                            Object.values(experience)[7] as string;
                        this.experienceObject.student_data.student_learning_disability =
                            Object.values(experience)[8] as string;
                        this.experienceObject.student_data.student_race_ethnicity =
                            Object.values(experience)[9] as string;
                        this.experienceObject.student_data.student_attendance =
                            Object.values(experience)[10] as string;
                        this.experienceObject.student_data.student_class_participation =
                            Object.values(experience)[11] as string;

                        this.experience_service
                            .parseExperienceCSVContent(this.experienceObject)
                            .then((experience) => {
                                if (experience) {
                                    console.log(
                                        "Experience with title " +
                                            Object.values(experience)[0] +
                                            " was added successfully!"
                                    );
                                }
                            });
                    }
                }
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
            },
        });
    }

    onStudentFileSelect(event: any) {
        this.selectStudentFile = event.target.files[0];
        this.studentLabelText = this.selectStudentFile
            ? this.selectStudentFile.name
            : "Choose a File";

        if (!this.selectStudentFile || !this.selectStudentFile.name) {
            alert("No file selected or file name is not valid.");
            return;
        }

        const fileExtension = this.selectStudentFile.name
            .split(".")
            .pop()
            ?.toLowerCase();

        if (fileExtension !== "csv") {
            alert(
                "The selected file format is not supported. Please upload a CSV."
            );
            this.resetUploadState();
            return;
        }

        console.log(this.selectStudentFile);
        console.log(this.studentLabelText);
    }

    onStudentFileUpload() {
        if (!this.selectStudentFile) {
            alert("No file selected.");
            return;
        } else if (this.selectStudentFile) {
            alert(this.selectStudentFile.name + " was successfully uploaded.");
            console.log(
                this.selectStudentFile.name + " was successfully uploaded."
            );
        }

        const storageRef = ref(
            this.storage,
            `student_files/${this.selectStudentFile.name}`
        );
        const uploadTask = uploadBytesResumable(
            storageRef,
            this.selectStudentFile
        );

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress =
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log("Upload is " + progress + "% done");
            },
            (error) => {
                console.log(error.message);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    console.log("File available at", downloadURL);
                });
                this.resetUploadState();
            }
        );

        this.parseStudentCSVContent(this.selectStudentFile);
    }

    parseStudentCSVContent(file: File) {
        this.papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                if (result.data) {
                    for (let student of result.data) {
                        this.studentObject.id = "";
                        this.studentObject.student_name = Object.values(
                            student
                        )[0] as string;
                        this.studentObject.student_gender = Object.values(
                            student
                        )[1] as string;
                        this.studentObject.student_last_test_grade =
                            Object.values(student)[2] as string;
                        this.studentObject.student_table = Object.values(
                            student
                        )[3] as string;
                        this.studentObject.student_overall_performance =
                            Object.values(student)[4] as string;
                        this.studentObject.student_learning_disability =
                            Object.values(student)[5] as string;
                        this.studentObject.student_race_ethnicity =
                            Object.values(student)[6] as string;
                        this.studentObject.student_attendance = Object.values(
                            student
                        )[7] as string;
                        this.studentObject.student_class_participation =
                            Object.values(student)[8] as string;

                        this.experience_service
                            .parseStudentCSVContent(this.studentObject)
                            .then((student) => {
                                if (student) {
                                    console.log(
                                        "Student with name " +
                                            Object.values(student)[0] +
                                            " was added successfully!"
                                    );
                                }
                            });
                    }
                }
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
            },
        });
    }

    onFilterByStudentClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Search Student' filter",
                Result: "Filter experiences",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Search Student' filter at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    filterExperiencesByStudent() {
        if (!this.studentSearchTerm) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Typed",
                Target: "'Search Student' filter",
                Result: this.studentSearchTerm,
                Time: time.toLocaleString(),
            }
            // "'Search Student' filter search term is " +
            //     this.studentSearchTerm +
            //     " at " +
            //     time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.experiences = this.filteredExp.filter((value: Experience) =>
            value.student_name
                .toLowerCase()
                .includes(this.studentSearchTerm.toLowerCase())
        );

        this.experiences.forEach((experience: any) => {
            console.log(experience.student_name);
        });

        this.cdr.detectChanges();
    }

    onFilterByKeywordClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Search Keyword' filter",
                Result: "Filter experiences",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Search Keyword' filter at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    filterExperiencesByKeyword() {
        if (!this.keywordSearchTerm) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Typed",
                Target: "'Search Keyword' filter",
                Result: this.keywordSearchTerm,
                Time: time.toLocaleString(),
            }
            // "'Search Keyword' filter search term is " +
            //     this.keywordSearchTerm +
            //     " at " +
            //     time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.experiences = this.filteredExp.filter(
            (value: Experience) =>
                value.experience_title
                    .toLowerCase()
                    .includes(this.keywordSearchTerm.toLowerCase()) ||
                value.experience_description
                    .toLowerCase()
                    .includes(this.keywordSearchTerm.toLowerCase())
        );

        this.experiences.forEach((experience: any) => {
            console.log(
                experience.experience_title,
                experience.experience_description
            );
        });

        this.cdr.detectChanges();
    }

    onFilterByDateClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Search Date' filter",
                Result: "Filter experiences",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Search Date' filter at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    filterExperiencesByDate() {
        if (!this.dateSearchTerm) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Typed",
                Target: "'Search Date' filter",
                Result: this.dateSearchTerm,
                Time: time.toLocaleString(),
            }
            // "'Search Date' filter search term is " +
            //     this.dateSearchTerm +
            //     " at " +
            //     time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.dateTerm = this.changeDateFormat(this.dateSearchTerm); // For mat-form-field mat-input mat-datepicker

        this.experiences = this.filteredExp.filter((value: Experience) =>
            value.date.includes(this.dateTerm)
        );

        this.experiences.forEach((experience: any) => {
            console.log(experience.date);
        });

        this.cdr.detectChanges();
    }

    filterExperiencesByDateRange() {
        if (!this.startDateSearchTerm || !this.endDateSearchTerm) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        // Change format of start and end dates
        this.startDateTerm = this.changeDateFormat(this.startDateSearchTerm);
        this.endDateTerm = this.changeDateFormat(this.endDateSearchTerm);

        this.experiences = this.filteredExp.filter(
            (value: Experience) =>
                value.date >= this.startDateTerm &&
                value.date <= this.endDateTerm
        );

        this.experiences.forEach((experience: any) => {
            console.log(experience.date);
        });

        this.cdr.detectChanges();
    }

    changeDateFormat(filterDateTerm: Date) {
        const dateArray = filterDateTerm.toLocaleDateString().split("/");
        dateArray[0] =
            dateArray[0].length === 1 ? "0" + dateArray[0] : dateArray[0];
        dateArray[1] =
            dateArray[1].length === 1 ? "0" + dateArray[1] : dateArray[1];
        const formattedDateTerm =
            dateArray[2] + "-" + dateArray[0] + "-" + dateArray[1];
        return formattedDateTerm;
    }

    filterExperiencesByStudentGender(event: any): void {
        if (!event || event.length === 0) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        // const criteria = (event.target as HTMLSelectElement).value;
        const containsFemale = event.some(
            (element: any) => element === "female"
        );
        const containsMale = event.some((element: any) => element === "male");

        this.experiences = this.filteredExp.filter(
            (value: Experience) =>
                value.student_data.student_gender ===
                    (containsFemale ? "F" : "") ||
                value.student_data.student_gender === (containsMale ? "M" : "")
        );
        this.cdr.detectChanges();
    }

    filterExperiencesByStudentLastTestGrade(event: any): void {
        if (!event || event.length === 0) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        const containsGradeA = event.some(
            (element: any) => element === "gradeA"
        );
        const containsGradeB = event.some(
            (element: any) => element === "gradeB"
        );
        const containsGradeC = event.some(
            (element: any) => element === "gradeC"
        );
        const containsGradeD = event.some(
            (element: any) => element === "gradeD"
        );
        const containsGradeF = event.some(
            (element: any) => element === "gradeF"
        );

        this.experiences = this.filteredExp.filter(
            (value: Experience) =>
                value.student_data.student_last_test_grade ===
                    (containsGradeA ? "A" : "") ||
                value.student_data.student_last_test_grade ===
                    (containsGradeB ? "B" : "") ||
                value.student_data.student_last_test_grade ===
                    (containsGradeC ? "C" : "") ||
                value.student_data.student_last_test_grade ===
                    (containsGradeD ? "D" : "") ||
                value.student_data.student_last_test_grade ===
                    (containsGradeF ? "F" : "")
        );
        this.cdr.detectChanges();
    }

    filterExperiencesByStudentTable(event: any): void {
        if (!event || event.length === 0) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        const containsBlue = event.some((element: any) => element === "blue");
        const containsGreen = event.some((element: any) => element === "green");
        const containsOrange = event.some(
            (element: any) => element === "orange"
        );
        const containsPink = event.some((element: any) => element === "pink");
        const containsPurple = event.some(
            (element: any) => element === "purple"
        );

        this.experiences = this.filteredExp.filter(
            (value: Experience) =>
                value.student_data.student_table ===
                    (containsBlue ? "Blue" : "") ||
                value.student_data.student_table ===
                    (containsGreen ? "Green" : "") ||
                value.student_data.student_table ===
                    (containsOrange ? "Orange" : "") ||
                value.student_data.student_table ===
                    (containsPink ? "Pink" : "") ||
                value.student_data.student_table ===
                    (containsPurple ? "Purple" : "")
        );
        this.cdr.detectChanges();
    }

    filterExperiencesByStudentOverallPerformance(event: any): void {
        if (!event || event.length === 0) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        const containsGradeA = event.some(
            (element: any) => element === "gradeA"
        );
        const containsGradeB = event.some(
            (element: any) => element === "gradeB"
        );
        const containsGradeC = event.some(
            (element: any) => element === "gradeC"
        );
        const containsGradeD = event.some(
            (element: any) => element === "gradeD"
        );
        const containsGradeF = event.some(
            (element: any) => element === "gradeF"
        );

        this.experiences = this.filteredExp.filter(
            (value: Experience) =>
                value.student_data.student_overall_performance ===
                    (containsGradeA ? "A" : "") ||
                value.student_data.student_overall_performance ===
                    (containsGradeB ? "B" : "") ||
                value.student_data.student_overall_performance ===
                    (containsGradeC ? "C" : "") ||
                value.student_data.student_overall_performance ===
                    (containsGradeD ? "D" : "") ||
                value.student_data.student_overall_performance ===
                    (containsGradeF ? "F" : "")
        );
        this.cdr.detectChanges();
    }

    filterExperiencesByStudentLearningDisability(event: any): void {
        if (!event || event.length === 0) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        const containsADHD = event.some((element: any) => element === "adhd");
        const containsAutism = event.some(
            (element: any) => element === "autism"
        );
        const containsDyslexia = event.some(
            (element: any) => element === "dyslexia"
        );
        const containsDyscalculiaD = event.some(
            (element: any) => element === "dyscalculia"
        );
        const containsNone = event.some((element: any) => element === "none");

        this.experiences = this.filteredExp.filter(
            (value: Experience) =>
                value.student_data.student_learning_disability ===
                    (containsADHD ? "ADHD" : "") ||
                value.student_data.student_learning_disability ===
                    (containsAutism ? "Autism" : "") ||
                value.student_data.student_learning_disability ===
                    (containsDyslexia ? "Dyslexia" : "") ||
                value.student_data.student_learning_disability ===
                    (containsDyscalculiaD ? "Dyscalculia" : "") ||
                value.student_data.student_learning_disability ===
                    (containsNone ? "None reported" : "")
        );
        this.cdr.detectChanges();
    }

    filterExperiencesByStudentRaceOrEthnicity(event: any): void {
        if (!event || event.length === 0) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        const containsAfricanAmerican = event.some(
            (element: any) => element === "african-american"
        );
        const containsAsian = event.some((element: any) => element === "asian");
        const containsHispanic = event.some(
            (element: any) => element === "hispanic"
        );
        const containsWhite = event.some((element: any) => element === "white");

        this.experiences = this.filteredExp.filter(
            (value: Experience) =>
                value.student_data.student_race_ethnicity ===
                    (containsAfricanAmerican ? "African-American" : "") ||
                value.student_data.student_race_ethnicity ===
                    (containsAsian ? "Asian" : "") ||
                value.student_data.student_race_ethnicity ===
                    (containsHispanic ? "Hispanic" : "") ||
                value.student_data.student_race_ethnicity ===
                    (containsWhite ? "White" : "")
        );
        this.cdr.detectChanges();
    }

    filterExperiencesByStudentAttendance(event: any): void {
        if (!event || event.length === 0) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        const contains80to84 = event.some(
            (element: any) => element === "80-84"
        );
        const containsAbove80 = event.some(
            (element: any) => element === "above80"
        );
        const contains85to89 = event.some(
            (element: any) => element === "85-89"
        );
        const containsAbove85 = event.some(
            (element: any) => element === "above85"
        );
        const contains90to94 = event.some(
            (element: any) => element === "90-94"
        );
        const containsAbove90 = event.some(
            (element: any) => element === "above90"
        );
        const contains95to99 = event.some(
            (element: any) => element === "95-99"
        );
        const containsAbove95 = event.some(
            (element: any) => element === "above95"
        );
        const contains100 = event.some((element: any) => element === "100");

        this.experiences = this.filteredExp.filter(
            (value: Experience) =>
                (contains80to84
                    ? parseInt(value.student_data.student_attendance) >= 80 &&
                      parseInt(value.student_data.student_attendance) <= 84
                    : null) ||
                (containsAbove80
                    ? parseInt(value.student_data.student_attendance) >= 80
                    : null) ||
                (contains85to89
                    ? parseInt(value.student_data.student_attendance) >= 85 &&
                      parseInt(value.student_data.student_attendance) <= 89
                    : null) ||
                (containsAbove85
                    ? parseInt(value.student_data.student_attendance) >= 85
                    : null) ||
                (contains90to94
                    ? parseInt(value.student_data.student_attendance) >= 90 &&
                      parseInt(value.student_data.student_attendance) <= 94
                    : null) ||
                (containsAbove90
                    ? parseInt(value.student_data.student_attendance) >= 90
                    : null) ||
                (contains95to99
                    ? parseInt(value.student_data.student_attendance) >= 95 &&
                      parseInt(value.student_data.student_attendance) <= 99
                    : null) ||
                (containsAbove95
                    ? parseInt(value.student_data.student_attendance) >= 95
                    : null) ||
                (contains100
                    ? parseInt(value.student_data.student_attendance) === 100
                    : null)
        );
        this.cdr.detectChanges();
    }

    filterExperiencesByStudentClassParticipation(event: any): void {
        if (!event || event.length === 0) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        const containsLow = event.some((element: any) => element === "low");
        const containsMid = event.some((element: any) => element === "mid");
        const containsHigh = event.some((element: any) => element === "high");

        this.experiences = this.filteredExp.filter(
            (value: Experience) =>
                value.student_data.student_class_participation ===
                    (containsLow ? "Low" : "") ||
                value.student_data.student_class_participation ===
                    (containsMid ? "Mid" : "") ||
                value.student_data.student_class_participation ===
                    (containsHigh ? "High" : "")
        );
        this.cdr.detectChanges();
    }

    sortExperiences(event: any): void {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push(
            {
                Action: "Clicked",
                Target: "'Sort By' filter",
                Result: "Sort experiences",
                Time: time.toLocaleString(),
            }
            // "Clicked 'Sort By' filter at " + time.toLocaleString()
        );
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        // const criteria = (event.target as HTMLSelectElement).value;

        switch (event) {
            case "timeNewest":
                this.experiences.sort(
                    (a: Experience, b: Experience) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                );
                break;

            case "timeOldest":
                this.experiences.sort(
                    (a: Experience, b: Experience) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                break;

            // case "titleHighest":
            //     this.experiences.sort(
            //         (a: Experience, b: Experience) =>
            //             this.getNumberFromTitle(b.experience_title) -
            //             this.getNumberFromTitle(a.experience_title)
            //     );
            //     break;

            // case "titleLowest":
            //     this.experiences.sort(
            //         (a: Experience, b: Experience) =>
            //             this.getNumberFromTitle(a.experience_title) -
            //             this.getNumberFromTitle(b.experience_title)
            //     );
            //     break;

            // case "studentHighest":
            //     this.experiences.sort(
            //         (a: Experience, b: Experience) =>
            //             this.getNumberFromTitle(b.student_name) -
            //             this.getNumberFromTitle(a.student_name)
            //     );
            //     break;

            // case "studentLowest":
            //     this.experiences.sort(
            //         (a: Experience, b: Experience) =>
            //             this.getNumberFromTitle(a.student_name) -
            //             this.getNumberFromTitle(b.student_name)
            //     );
            //     break;
        }
    }

    private getNumberFromTitle(title: string): number {
        const match = title.match(/\d+/); // This regex finds numbers in a string
        return match ? parseInt(match[0]) : 0; // Convert the matched number string to an integer
    }
}
