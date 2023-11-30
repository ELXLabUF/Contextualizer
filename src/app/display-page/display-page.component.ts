import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

import { ExperienceLessonPlanService } from "../experience-lesson-plan-service/experience-lesson-plan.service";
import { IntegrateExperienceService } from "../integrate-experience-service/integrate-experience.service";
import { PdfReaderService } from "../pdf-reader-service/pdf-reader.service";

import { Experience } from "../experience";
import { ExpIntegratedPDF } from "../expIntegratedPDF";

import { Subscription, timestamp } from "rxjs";
import { AngularFirestore } from '@angular/fire/compat/firestore'; // import Firestore

@Component({
    selector: "app-display-page",
    templateUrl: "./display-page.component.html",
    styleUrls: ["./display-page.component.css"],
})
export class DisplayPageComponent implements OnInit {
    fileDownloadURL: string | null = null;
    pdfText: string = "";
    pdfData: any = null;
    editableFields = [
        { name: 'Content Area', key: 'Content Area', editing: false, editValue: '' },
        { name: 'Grade Level', key: 'Grade Level', editing: false, editValue: '' },
        { name: 'Topic', key: 'Topic', editing: false, editValue: '' },
        { name: 'Duration', key: 'Duration', editing: false, editValue: '' },
        { name: 'CCRSAE', key: 'CCRSAE', editing: false, editValue: '' },
        { name: 'Instruction Shifts', key: 'Instruction Shifts', editing: false, editValue: '' },
        { name: 'Objective', key: 'Objective', editing: false, editValue: '' },
        { name: 'Assessment', key: 'Assessment', editing: false, editValue: '' },
        { name: 'Materials', key: 'Materials', editing: false, editValue: '' },
        { name: 'Instructions', key: 'Instructions', editing: false, editValue: '' },
        { name: 'Home Study', key: 'Home Study', editing: false, editValue: '' },
        { name: 'Reflection', key: 'Reflection', editing: false, editValue: '' }
    ];
    integratedExperiences: any = [];
    integrateExpSubscription!: Subscription;

    selectedMainTopic: string = "";
    selectedSubTopic: string = "";
    id: string = "";
    created_at: Date | null = null;
    mainTopicSubscription!: Subscription;
    subTopicSubscription!: Subscription;

    expIntegratedPDF: ExpIntegratedPDF = {
        id: "",
        main_topic: "",
        sub_topic: "",
        pdf_data: new Object(),
        integrated_experiences: [],
    };

    constructor(
        private sanitizer: DomSanitizer,
        private pdfReaderService: PdfReaderService,
        private integrateExpService: IntegrateExperienceService,
        private expLessonPlanService: ExperienceLessonPlanService,
        private firestore: AngularFirestore
    ) {}

    get safeDownloadURL(): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(
            this.fileDownloadURL || ""
        );
    }

    ngOnInit(): void {
        // console.log("Inside ngOnInit");
        this.fileDownloadURL = localStorage.getItem("fileURL"); 
        if (this.fileDownloadURL) {
            // console.log("File URL found");
            this.firestore.collection('Documents', ref => ref.orderBy('createdAt', 'desc').limit(1))
            .get()
            .toPromise()
            .then((querySnapshot) => {
                if(querySnapshot && !querySnapshot.empty) {
                        // console.log("Query Snapshot found");
                        const doc = querySnapshot.docs[0];
                        this.pdfData = doc.data();
                        this.id = doc.id || '';
                        this.selectedMainTopic = this.pdfData.mainTopic || '';
                        this.selectedSubTopic = this.pdfData.subTopic || '';
                        this.created_at = this.pdfData.createdAt.toDate() || '';
                        this.initializeEditValues();
                        console.log("The ID is " + this.id);
                        console.log("The main topic is " + this.selectedMainTopic);
                        console.log("The sub topic is " + this.selectedSubTopic);
                        console.log("The created date is " + this.created_at);
                    }
            }).catch(err => console.error('Error getting documents: ', err));
        }
    }

    initializeEditValues() {
        this.editableFields.forEach(field => {
            field.editValue = this.pdfData[field.key] || ''; // make sure to assign a string if the value is falsy
        });
    }
    enableEditing(field: any) {
        field.editing = true;
    }
    submitEdit(field: any) {
        field.editing = false;
        // Update Firestore document
        this.firestore.doc(`Documents/${this.id}`)
            .update({ [field.key]: field.editValue })
            .then(() => {
                this.pdfData[field.key] = field.editValue;
            })
            .catch(err => console.error('Error updating document: ', err));
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
        this.expIntegratedPDF.sub_topic = this.selectedSubTopic;
        this.expIntegratedPDF.pdf_data = this.pdfData;
        this.integrateExpService.addParsedPDF(this.expIntegratedPDF);       
    }

    addIntegratedExperiences() {
        this.expIntegratedPDF.integrated_experiences =
            this.integratedExperiences;
        this.integrateExpService.addIntegratedExperience(this.expIntegratedPDF);
    }
}
