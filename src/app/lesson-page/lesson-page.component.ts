import { ChangeDetectorRef, Component } from "@angular/core";
import { Router } from "@angular/router";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { PdfReaderService } from "../pdf-reader-service/pdf-reader.service";
import { ExperienceLessonPlanService } from "../experience-lesson-plan-service/experience-lesson-plan.service";

import {
    Storage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "@angular/fire/storage";

@Component({
    selector: "app-lesson-page",
    templateUrl: "./lesson-page.component.html",
    styleUrls: ["./lesson-page.component.css"],
})
export class LessonPageComponent {
    selectedFile: File | null = null;
    uploadStatus: string = "";
    uploadProgress: number = 0;
    fileDownloadURL: string | null = null;
    labelText: string = "Choose a file";
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

    constructor(
        private storage: Storage,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private expLessonPlanService: ExperienceLessonPlanService,
        private firestore: AngularFirestore, // inject Firestore
        private pdfReaderService: PdfReaderService // Inject your service to convert PDF to JSON      
    ) {}

    ngOnInit(): void {
        this.expLessonPlanService.currentMainTopic.subscribe(
            (mainTopic) => {
                console.log("Subscribed Main Topic: ", mainTopic);
                this.selectedMainTopic = mainTopic;
            }
        );
    
        this.expLessonPlanService.currentSubTopic.subscribe((subTopic) => {
            console.log("Subscribed Sub Topic: ", subTopic);
            this.selectedSubTopic = subTopic;
        });
    }
    
    onFileSelected(event: any) {
        this.selectedFile = event.target.files[0];
        this.labelText = this.selectedFile
            ? this.selectedFile.name
            : "Choose a File";
        if (!this.selectedFile || !this.selectedFile.name) {
            alert("No file selected or file name is not valid.");
            return;
        }

        const fileExtension = this.selectedFile.name
            .split(".")
            .pop()
            ?.toLowerCase();
        if (fileExtension === "pdf") {
        } else if (fileExtension === "doc" || fileExtension === "docx") {
            alert("Please convert your Word file to PDF and then upload.");
            this.resetUploadState();
            return;
        } else {
            alert(
                "The selected file format is not supported. Please upload a PDF."
            );
            this.resetUploadState();
            return;
        }
        console.log(this.selectedFile);
        console.log(this.labelText);
    }

    onUpload() {
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

        //   // observe percentage changes
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

                        // Save the file URL to localStorage for accessing it in DisplayPageComponent
                        localStorage.setItem("fileURL", downloadURL);
                        this.pdfReaderService.convertPdfToJson(this.fileDownloadURL).then((jsonData) => {
                            const mainTopic = this.expLessonPlanService.currentMainTopicValue;
                            const subTopic = this.expLessonPlanService.currentSubTopicValue;
                            
                            jsonData.mainTopic = mainTopic;
                            jsonData.subTopic = subTopic;
                            jsonData.createdAt = new Date();

                            console.log("At Upload, Main Topic: ", mainTopic);
                            console.log("At Upload, Sub Topic: ", subTopic);
                            console.log("At Upload, Created At: ", new Date());
                            
                            this.firestore.collection('Documents').add(jsonData).then(() => {
                                // Redirect to DisplayPageComponent
                                this.router.navigate(["/display"]);
                                this.cdr.detectChanges();
                            }).catch(err => console.error('Error adding document: ', err));
                        }).catch(err => console.error('Error converting PDF to JSON: ', err));
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
        this.labelText = "Choose a file";
        this.uploadStatus = "";
        this.uploadProgress = 0;
        this.fileDownloadURL = "";
        this.selectedMainTopic = "";
        this.selectedSubTopic = "";
    }
}
