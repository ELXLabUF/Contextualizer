import { Component, OnDestroy, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { IntegrateExperienceService } from "../integrate-experience-service/integrate-experience.service";
import { PdfReaderService } from "../pdf-reader-service/pdf-reader.service";

import { NgZone } from "@angular/core";

import { Experience } from "../experience";
import { ExpIntegratedPDF } from "../expIntegratedPDF";

import { Subscription, timestamp } from "rxjs";
import { AngularFirestore } from "@angular/fire/compat/firestore"; // import Firestore
import firebase from "@firebase/app-compat";
import "@firebase/firestore-compat";
import { ChangeDetectorRef } from "@angular/core";
import {
    CdkDragDrop,
    CdkDragEnter,
    CdkDragExit,
    moveItemInArray,
    transferArrayItem,
} from "@angular/cdk/drag-drop";

import { MatDialog } from "@angular/material/dialog";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { InputDialogComponent } from "../input-dialog/input-dialog.component";
import { AlertDialogComponent } from "../alert-dialog/alert-dialog.component";

@Component({
    selector: "app-display-page",
    templateUrl: "./display-page.component.html",
    styleUrls: ["./display-page.component.css"],
})
export class DisplayPageComponent implements OnInit, OnDestroy {
    fileDownloadURL: string | null = null;
    pdfText: string = "";
    fieldKey: string = "";
    pdfData: any = null;
    isHighlighted = false;
    editableFields = [
        {
            name: "Grade",
            key: "Grade",
            editing: false,
            editValue: "",
            labelEditing: false,
            labelEditValue: "",
            experiencesEditingIndex: -1,
            experiencesEditValue: "",
        },
        {
            name: "Subject",
            key: "Subject",
            editing: false,
            editValue: "",
            labelEditing: false,
            labelEditValue: "",
            experiencesEditingIndex: -1,
            experiencesEditValue: "",
        },
        {
            name: "Duration",
            key: "Duration",
            editing: false,
            editValue: "",
            labelEditing: false,
            labelEditValue: "",
            experiencesEditingIndex: -1,
            experiencesEditValue: "",
        },
        {
            name: "Lesson Standards & Objectives",
            key: "Lesson Standards & Objectives",
            editing: false,
            editValue: "",
            labelEditing: false,
            labelEditValue: "",
            experiencesEditingIndex: -1,
            experiencesEditValue: "",
        },
        {
            name: "Materials",
            key: "Materials",
            editing: false,
            editValue: "",
            labelEditing: false,
            labelEditValue: "",
            experiencesEditingIndex: -1,
            experiencesEditValue: "",
        },
        {
            name: "Warm-Up",
            key: "Warm-Up",
            editing: false,
            editValue: "",
            labelEditing: false,
            labelEditValue: "",
            experiencesEditingIndex: -1,
            experiencesEditValue: "",
        },
        {
            name: "Teacher-Led Instruction",
            key: "Teacher-Led Instruction",
            editing: false,
            editValue: "",
            labelEditing: false,
            labelEditValue: "",
            experiencesEditingIndex: -1,
            experiencesEditValue: "",
        },
        {
            name: "Student-Led Learning",
            key: "Student-Led Learning",
            editing: false,
            editValue: "",
            labelEditing: false,
            labelEditValue: "",
            experiencesEditingIndex: -1,
            experiencesEditValue: "",
        },
        {
            name: "Wrap-Up/Closure",
            key: "Wrap-Up/Closure",
            editing: false,
            editValue: "",
            labelEditing: false,
            labelEditValue: "",
            experiencesEditingIndex: -1,
            experiencesEditValue: "",
        },
    ];

    integratedExperiences: any = [];
    integrateExpSubscription!: Subscription;

    selectedExperienceToAdd: Experience | null = null;
    selectedMainTopic: string = "";
    // selectedSubTopic: string = "";

    id: string = "";
    created_at: Date | null = null;
    mainTopicSubscription!: Subscription;
    // subTopicSubscription!: Subscription;

    integratedExperiencesForGrade: any = [];
    integratedExperiencesForSubject: any = [];
    integratedExperiencesForDuration: any = [];
    integratedExperiencesForLesson: any = [];
    integratedExperiencesForMaterials: any = [];
    integratedExperiencesForWarmUp: any = [];
    integratedExperiencesForTeacher: any = [];
    integratedExperiencesForStudent: any = [];
    integratedExperiencesForWrapUp: any = [];

    titleForGrade: string = "Grade";
    titleForSubject: string = "Subject";
    titleForDuration: string = "Duration";
    titleForLesson: string = "Lesson Standards & Objectives";
    titleForMaterials: string = "Materials";
    titleForWarmUp: string = "Warm-Up";
    titleForTeacher: string = "Teacher-Led Instruction";
    titleForStudent: string = "Student-Led Learning";
    titleForWrapUp: string = "Wrap-Up/Closure";

    currentExperienceTitle: string = "";
    currentExperienceDescription: string = "";
    currentField: any;

    currentlyEditing: { fieldKey?: string; containerKey?: string } = {};
    editableContainerValue: string = "";

    timeStart!: Date;
    timeEnd!: Date;

    expIntegratedPDF: ExpIntegratedPDF = {
        id: "",
        main_topic: "",
        sub_topic: "",
        pdf_data: new Object(),
        integrated_experiences: [],
    };

    constructor(
        private zone: NgZone,
        private sanitizer: DomSanitizer,
        private pdfReaderService: PdfReaderService,
        private integrateExpService: IntegrateExperienceService,
        private firestore: AngularFirestore,
        private router: Router,
        private cdRef: ChangeDetectorRef,
        private dialog: MatDialog
    ) {}

    get safeDownloadURL(): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
            this.fileDownloadURL || ""
        );
    }

    ngOnInit(): void {
        this.timeStart = new Date();
        let userIntData: any = [];
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Visited",
            Target: "Display LP page",
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
                        // console.log("Query Snapshot found");
                        const doc = querySnapshot.docs[0];

                        this.pdfData = doc.data();

                        console.log("PDF DATA ->", this.pdfData);

                        this.id = doc.id || "";
                        this.selectedMainTopic = this.pdfData.mainTopic || "";
                        // this.selectedSubTopic = this.pdfData.subTopic || "";
                        this.created_at = this.pdfData.createdAt.toDate() || "";

                        this.integratedExperiencesForGrade =
                            this.pdfData["Grade"]?.integrated_experiences || [];
                        this.integratedExperiencesForSubject =
                            this.pdfData["Subject"]?.integrated_experiences ||
                            [];
                        this.integratedExperiencesForDuration =
                            this.pdfData["Duration"]?.integrated_experiences ||
                            [];
                        this.integratedExperiencesForLesson =
                            this.pdfData["Lesson Standards & Objectives"]
                                ?.integrated_experiences || [];
                        this.integratedExperiencesForMaterials =
                            this.pdfData["Materials"]?.integrated_experiences ||
                            [];
                        this.integratedExperiencesForWarmUp =
                            this.pdfData["Warm-Up"]?.integrated_experiences ||
                            [];
                        this.integratedExperiencesForTeacher =
                            this.pdfData["Teacher-Led Instruction"]
                                ?.integrated_experiences || [];
                        this.integratedExperiencesForStudent =
                            this.pdfData["Student-Led Learning"]
                                ?.integrated_experiences || [];
                        this.integratedExperiencesForWrapUp =
                            this.pdfData["Wrap-Up/Closure"]
                                ?.integrated_experiences || [];

                        this.titleForGrade =
                            this.pdfData["Grade"]?.title || this.titleForGrade;
                        this.titleForSubject =
                            this.pdfData["Subject"]?.title ||
                            this.titleForSubject;
                        this.titleForDuration =
                            this.pdfData["Duration"]?.title ||
                            this.titleForDuration;
                        this.titleForLesson =
                            this.pdfData["Lesson Standards & Objectives"]
                                ?.title || this.titleForLesson;
                        this.titleForMaterials =
                            this.pdfData["Materials"]?.title ||
                            this.titleForMaterials;
                        this.titleForWarmUp =
                            this.pdfData["Warm-Up"]?.title ||
                            this.titleForWarmUp;
                        this.titleForTeacher =
                            this.pdfData["Teacher-Led Instruction"]?.title ||
                            this.titleForTeacher;
                        this.titleForStudent =
                            this.pdfData["Student-Led Learning"]?.title ||
                            this.titleForStudent;
                        this.titleForWrapUp =
                            this.pdfData["Wrap-Up/Closure"]?.title ||
                            this.titleForWrapUp;

                        this.integratedExperiences =
                            this.pdfData.integrated_experiences || "";

                        const fieldOrder =
                            (this.pdfData.fieldOrder as string[]) || [];
                        if (
                            !this.pdfData.fieldOrder ||
                            this.pdfData.fieldOrder.length === 0
                        ) {
                            this.setDefaultFieldOrder();
                        } else {
                            this.editableFields = fieldOrder.map(
                                (fieldKey) => ({
                                    name: this.getFieldName(fieldKey),
                                    key: fieldKey,
                                    editing: false,
                                    editValue: "",
                                    labelEditing: false,
                                    labelEditValue:
                                        this.pdfData[fieldKey]?.title ||
                                        "Default Title",
                                    experiencesEditingIndex: -1, // Assuming -1 indicates no experience is being edited.
                                    experiencesEditValue: "",
                                })
                            );
                        }

                        this.initializeEditValues();
                        console.log("The ID is " + this.id);
                        console.log(
                            "The main topic is " + this.selectedMainTopic
                        );
                        // console.log(
                        //     "The sub topic is " + this.selectedSubTopic
                        // );
                        console.log("The created date is " + this.created_at);
                        console.log(
                            "The Integrated Experiences are: " +
                                this.integratedExperiences
                        );
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
            Target: "Display LP page",
            Result: "",
            Time: this.timeEnd.toLocaleString(),
        });
        userIntData.push({
            Action: "Time spent",
            Target: "Display LP page",
            Result: "",
            Time: duration + " seconds",
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    private setDefaultFieldOrder() {
        const defaultFieldOrder = [
            "Grade",
            "Subject",
            "Duration",
            "Lesson Standards & Objectives",
            "Materials",
            "Warm-Up",
            "Teacher-Led Instruction",
            "Student-Led Learning",
            "Wrap-Up/Closure",
        ];

        this.editableFields = defaultFieldOrder.map((fieldKey) => ({
            name: this.getFieldName(fieldKey),
            key: fieldKey,
            editing: false,
            editValue: "",
            labelEditing: false,
            labelEditValue: this.pdfData[fieldKey]?.title || "Default Title",
            experiencesEditingIndex: -1, // Assuming -1 indicates no experience is being edited.
            experiencesEditValue: "",
        }));
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

    onBrowseExpClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Browse Experiences' button",
            Result: "Navigate to Experiences page",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        this.router.navigate(["/experience"]);
    }

    onFinalizeLPClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Finalize Lesson Plan' button",
            Result: "Navigate to Finalize LP page",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        this.router.navigate(["/finalize"]);
    }

    initializeEditValues() {
        this.editableFields.forEach((field) => {
            field.editValue = this.pdfData[field.key]?.content || ""; // assign the content or an empty string if it's falsy
        });
    }

    enableEditing(field: any) {
        field.editing = true;
        field.editValue = this.pdfData[field.key]?.content.content;
    }

    enableLabelEditing(field: any) {
        field.labelEditing = true;
        field.labelEditValue = this.pdfData[field.key]?.title;
    }

    enableExperienceEditing(field: any, index: any) {
        field.experiencesEditingIndex = index;
        field.experiencesEditValue =
            this.pdfData[field.key]?.integrated_experiences[index];
    }

    submitEdit(field: any) {
        field.editing = false;
        // Update Firestore document
        const updatedFieldData = {
            ...this.pdfData[field.key],
            content: { content: field.editValue },
        };

        this.firestore
            .doc(`Documents/${this.id}`)
            .update({ [field.key]: updatedFieldData })
            .then(() => {
                this.pdfData[field.key] = updatedFieldData;
            })
            .catch((err) => console.error("Error updating document: ", err));
    }

    submitLabelEdit(field: any) {
        field.labelEditing = false;
        // Update Firestore document
        const updatedFieldData = {
            ...this.pdfData[field.key],
            title: field.labelEditValue,
        };

        this.firestore
            .doc(`Documents/${this.id}`)
            .update({ [field.key]: updatedFieldData })
            .then(() => {
                this.pdfData[field.key] = updatedFieldData;
            })
            .catch((err) => console.error("Error updating document: ", err));
    }

    submitExperienceEdit(field: any) {
        field.experiencesEditingIndex = -1;
        // Update Firestore document
        const updatedExperiences = [
            ...this.pdfData[field.key]?.integrated_experiences,
        ];
        updatedExperiences[field.experiencesEditingIndex] =
            field.experiencesEditValue;

        const updatedFieldData = {
            ...this.pdfData[field.key],
            integrated_experiences: updatedExperiences,
        };

        this.firestore
            .doc(`Documents/${this.id}`)
            .update({ [field.key]: updatedFieldData })
            .then(() => {
                this.pdfData[field.key] = updatedFieldData;
            })
            .catch((err) => console.error("Error updating document: ", err));
    }

    openFile() {
        if (this.fileDownloadURL) {
            window.open(this.fileDownloadURL, "_blank");
        }
    }

    getFilenameFromUrl(url: string): string {
        return url.split("/").pop() || "downloaded_file";
    }

    async convertPdfToJSON(url: string) {
        try {
            this.pdfData = await this.pdfReaderService.convertPdfToJson(url);
            // console.log("PDF-JSON");
            console.log(this.pdfData);
            this.addPDFToFirestore();
        } catch (error) {
            console.error("Error converting PDF to JSON:", error);
        }
    }

    async loadPdfText() {
        try {
            if (this.fileDownloadURL) {
                // console.log("PDF-Text");
                this.pdfText = await this.pdfReaderService.readPdf(
                    this.fileDownloadURL
                );
                console.log(this.pdfText);
            }
        } catch (error) {
            console.error(
                "Error reading the PDF:",
                error,
                JSON.stringify(error)
            );
        }
    }

    addPDFToFirestore() {
        this.expIntegratedPDF.id = "user";
        this.expIntegratedPDF.main_topic = this.selectedMainTopic;
        // this.expIntegratedPDF.sub_topic = this.selectedSubTopic;
        this.expIntegratedPDF.pdf_data = this.pdfData;
        this.integrateExpService.addParsedPDF(this.expIntegratedPDF);
    }

    addIntegratedExperiences() {
        this.expIntegratedPDF.integrated_experiences =
            this.integratedExperiences;
        this.integrateExpService.addIntegratedExperience(this.expIntegratedPDF);
    }

    openAlertDialog(title: string, message: string): void {
        this.dialog.open(AlertDialogComponent, {
            width: "250px",
            data: { title: title, message: message },
        });
    }

    trackByFn(index: number, item: any): any {
        return index; // or item.id
    }

    updateFirestore(field: any, description: string) {
        this.firestore
            .collection("Documents")
            .doc(this.id)
            .get()
            .toPromise()
            .then((doc) => {
                if (doc && doc.exists) {
                    const data: any = doc.data();
                    const existingFieldExperiences =
                        data[field.key]?.integrated_experiences || [];
                    existingFieldExperiences.push(description);

                    const updatePayload: { [key: string]: any } = {};
                    updatePayload[`${field.key}.integrated_experiences`] =
                        existingFieldExperiences;

                    return this.firestore
                        .collection("Documents")
                        .doc(this.id)
                        .update(updatePayload);
                } else {
                    throw new Error("Document doesn't exist");
                }
            })
            .then(() => {
                console.log("Successfully updated Firestore!");
            })
            .catch((err) => {
                console.error("Error adding experience to field:", err);
            });
    }

    updateFirestoreDrag(key: string, description: string) {
        console.log("Attempting to update Firestore...");
        this.firestore
            .collection("Documents")
            .doc(this.id)
            .get()
            .toPromise()
            .then((doc) => {
                if (doc && doc.exists) {
                    const data: any = doc.data();
                    const existingFieldExperiences =
                        data[key]?.integrated_experiences || [];
                    existingFieldExperiences.push(description);

                    console.log("Received Key:", key);

                    const updatePayload: { [key: string]: any } = {};
                    updatePayload[`${key}.integrated_experiences`] =
                        existingFieldExperiences;

                    console.log("Update Payload:", updatePayload);

                    return this.firestore
                        .collection("Documents")
                        .doc(this.id)
                        .update(updatePayload);
                } else {
                    throw new Error("Document doesn't exist");
                }
            })
            .then(() => {
                console.log("Successfully updated Firestore!");
                if (this.pdfData[key]) {
                    if (!this.pdfData[key].integrated_experiences) {
                        this.pdfData[key].integrated_experiences = [];
                    }
                    this.pdfData[key].integrated_experiences.push(description);
                } else {
                    this.pdfData[key] = {
                        integrated_experiences: [description],
                    };
                }
                this.cdRef.detectChanges();
            })
            .catch((err) => {
                console.error("Error adding experience to field:", err);
            });
    }

    onMouseEnter(field: any) {
        this.currentField = field;
    }

    onMouseLeave(field: any) {
        this.currentField = null;
    }

    allowDrop(event: any) {
        event.preventDefault();
    }

    onDragStart(
        event: any,
        experience_title: string,
        experience_description: string
    ) {
        this.currentExperienceTitle = experience_title;
        this.currentExperienceDescription = experience_description;
        event.dataTransfer.setData("text/plain", experience_description);
    }

    onDrop(event: any, field: any) {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Added",
            Target: "Experience with title " + this.currentExperienceTitle,
            Result: "Box with title " + field.name,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        console.log(this.currentExperienceDescription);
        console.log(field.name);
        this.updateFirestoreDrag(field.key, this.currentExperienceDescription);
        event.preventDefault();
    }

    onDragStarted(event: any) {
        console.log("Dragging experience title:", event.experience_title);
    }

    async addContainer(field: any) {
        const dialogRef = this.dialog.open(InputDialogComponent, {
            width: "250px",
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                const containerName = result.trim();

                if (this.editableFields.some((f) => f.name === containerName)) {
                    this.openAlertDialog(
                        "Error",
                        "A container with this name already exists. Please choose a unique name."
                    );
                    return;
                }

                const index = this.editableFields.findIndex(
                    (f) => f.key === field.key
                );
                if (index === -1) return; // Field not found

                const newField = {
                    name: containerName,
                    key: containerName,
                    editing: false,
                    editValue: "",
                    labelEditing: false,
                    labelEditValue: containerName,
                    experiencesEditingIndex: -1,
                    experiencesEditValue: "",
                };

                // Create a new container data
                const newContainerKey = result;
                const newContainerData = {
                    title: containerName,
                    content: "",
                    integrated_experiences: [],
                };

                await this.addFieldtoFirebase(
                    newContainerKey,
                    newContainerData
                );
                // this.editableFields.splice(index + 1, 0, newField);

                const newEditableFields = [...this.editableFields];
                newEditableFields.splice(index + 1, 0, newField);
                this.editableFields = newEditableFields;

                this.cdRef.detectChanges();

                try {
                    const updatedfieldOrder =
                        await this.updateFieldOrderInFirestore();
                    console.log("Updated Field Order ->", updatedfieldOrder);

                    this.editableFields = updatedfieldOrder.map(
                        (fieldKey: any) => ({
                            name: this.getFieldName(fieldKey),
                            key: fieldKey,
                            editing: false,
                            editValue: "",
                            labelEditing: false,
                            labelEditValue:
                                this.pdfData[fieldKey]?.title ||
                                "Default Title",
                            experiencesEditingIndex: -1, // Assuming -1 indicates no experience is being edited.
                            experiencesEditValue: "",
                        })
                    );
                    this.router.navigate(["/display"]);
                    this.ngOnInit();
                } catch (error) {
                    console.error("Error while updating field order:", error);
                }
                this.cdRef.detectChanges();
            }
        });
    }

    deleteContainer(field: any) {
        if (this.pdfData[field.key]) {
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                width: "350px",
                data: {
                    title: "Delete",
                    message: `Are you sure you want to delete this box: ${
                        this.pdfData[field.key]?.title
                    }?`,
                },
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    let userIntData: any = [];
                    let time = new Date();
                    userIntData = JSON.parse(
                        sessionStorage.getItem("userInteractionData") || "[]"
                    );
                    userIntData.push({
                        Action: "Clicked",
                        Target: "'Yes, Confirm' button on dialog box",
                        Result:
                            "Delete box with title " +
                            this.pdfData[field.key]?.title,
                        Time: time.toLocaleString(),
                    });
                    sessionStorage.setItem(
                        "userInteractionData",
                        JSON.stringify(userIntData)
                    );

                    console.log(this.pdfData[field.key]);
                    this.deleteFieldFromFirebase(field.key);
                    const index = this.editableFields.findIndex(
                        (f) => f.key === field.key
                    );
                    if (index !== -1) {
                        this.editableFields.splice(index, 1);
                        this.updateFieldOrderInFirestore();
                    }
                    this.pdfData = { ...this.pdfData };
                    delete this.pdfData[field.key];
                    this.cdRef.detectChanges();
                } else {
                    let userIntData: any = [];
                    let time = new Date();
                    userIntData = JSON.parse(
                        sessionStorage.getItem("userInteractionData") || "[]"
                    );
                    userIntData.push({
                        Action: "Clicked",
                        Target: "'No, Go Back' button on dialog box",
                        Result:
                            "Deny deletion of box with title " +
                            this.pdfData[field.key]?.title,
                        Time: time.toLocaleString(),
                    });
                    sessionStorage.setItem(
                        "userInteractionData",
                        JSON.stringify(userIntData)
                    );
                }
            });
        }
    }

    async getFieldOrderFromFirestore() {
        try {
            const doc = await this.firestore
                .collection("Documents")
                .doc(this.id)
                .get()
                .toPromise();

            if (doc && doc.exists) {
                const data: any = doc.data();
                return data.fieldOrder;
            } else {
                console.error("Field 'fieldOrder' is missing or not an array.");
                return [];
            }
        } catch (error) {
            console.error("Error fetching fieldOrder:", error);
            return [];
        }
    }

    async addFieldtoFirebase(fieldKey: string, fieldData: any) {
        const docRef = this.firestore.collection("Documents").doc(this.id);
        try {
            await docRef.update({
                [fieldKey]: fieldData,
            });
            console.log(`Field ${fieldKey} added successfully.`);
        } catch (error) {
            console.error("Error adding field: ", error);
        }
    }

    async deleteFieldFromFirebase(fieldKey: string, additionalKey?: string) {
        const docRef = this.firestore.collection("Documents").doc(this.id);
        const fieldToDelete = additionalKey
            ? `${fieldKey}.${additionalKey}`
            : fieldKey;
        console.log(fieldToDelete);
        try {
            await docRef.update({
                [fieldToDelete]: firebase.firestore.FieldValue.delete(),
            });
            console.log(`Field ${fieldToDelete} deleted successfully.`);
        } catch (error) {
            console.error("Error deleting field: ", error);
        }
    }

    getNumberOfLines(content: string): number {
        const lines = content.split("\n").length;
        return lines || 1; // Ensure at least one row if content is empty
    }

    moveContainer(field: any, direction: "up" | "down"): void {
        const index = this.editableFields.indexOf(field);
        if (index < 0) return; // Field not found in array

        if (direction === "up" && index > 0) {
            let userIntData: any = [];
            let time = new Date();
            userIntData = JSON.parse(
                sessionStorage.getItem("userInteractionData") || "[]"
            );
            userIntData.push({
                Action: "Moved",
                Target: "Box with title " + this.pdfData[field.key]?.title,
                Result:
                    "Above box with title " +
                    this.pdfData[this.editableFields[index - 1].key]?.title,
                Time: time.toLocaleString(),
            });
            sessionStorage.setItem(
                "userInteractionData",
                JSON.stringify(userIntData)
            );

            // Move up the field in the array
            this.moveArrayItem(this.editableFields, index, index - 1);
            this.updateFieldOrderInFirestore();
        } else if (
            direction === "down" &&
            index < this.editableFields.length - 1
        ) {
            let userIntData: any = [];
            let time = new Date();
            userIntData = JSON.parse(
                sessionStorage.getItem("userInteractionData") || "[]"
            );
            userIntData.push({
                Action: "Moved",
                Target: "Box with title " + this.pdfData[field.key]?.title,
                Result:
                    "Below box with title " +
                    this.pdfData[this.editableFields[index + 1].key]?.title,
                Time: time.toLocaleString(),
            });
            sessionStorage.setItem(
                "userInteractionData",
                JSON.stringify(userIntData)
            );

            // Move down the field in the array
            this.moveArrayItem(this.editableFields, index, index + 1);
            this.updateFieldOrderInFirestore();
        }
    }

    private moveArrayItem(
        arr: any[],
        oldIndex: number,
        newIndex: number
    ): void {
        if (newIndex >= arr.length) {
            let k = newIndex - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    }

    private async updateFieldOrderInFirestore(): Promise<string[]> {
        const fieldOrder = this.editableFields.map((field) => field.key);
        console.log("Update Field Order in FireStore ->", fieldOrder);

        return new Promise<string[]>(async (resolve, reject) => {
            try {
                await this.firestore
                    .collection("Documents")
                    .doc(this.id)
                    .update({ fieldOrder: fieldOrder });

                console.log("Field order updated in Firestore"),
                    resolve(fieldOrder);
            } catch (error) {
                console.error(
                    "Error updating field order in Firestore:",
                    error
                );
                reject(error);
            }
        });
    }

    trackByField(index: number, field: any): string {
        return field.key;
    }
}
