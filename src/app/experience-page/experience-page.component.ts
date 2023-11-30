import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";

import {
    Storage,
    getDownloadURL,
    ref,
    uploadBytesResumable,
} from "@angular/fire/storage";

import { ExperienceLessonPlanService } from "../experience-lesson-plan-service/experience-lesson-plan.service";
import { ExperienceService } from "../experience-service/experience-service.service";
import { Experience } from "../experience";

import { Papa } from "ngx-papaparse";
import { Subscription } from "rxjs";

@Component({
    selector: "app-experience-page",
    templateUrl: "./experience-page.component.html",
    styleUrls: ["./experience-page.component.css"],
})
export class ExperiencePageComponent implements OnInit {
    experienceForm!: FormGroup;
    editForm!: FormGroup;
    experienceDetails: any;
    experiences: any = [];
    selectedFile: File | null = null;
    labelText: string = "Choose a file";

    keywordSearchTerm!: string;
    studentSearchTerm!: string;
    dateSearchTerm!: Date;
    dateTerm!: string;
    startDateSearchTerm!: Date;
    startDateTerm!: string;
    endDateSearchTerm!: Date;
    endDateTerm!: string;

    filteredExp: any = [];

    experienceObject: Experience = {
        id: "",
        experience_title: "",
        experience_description: "",
        contributed_by: "",
        date: "",
    };

    constructor(
        private experience_service: ExperienceService,
        private expLessonPlanService: ExperienceLessonPlanService,
        private cdr: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private datePipe: DatePipe,
        private router: Router,
        private storage: Storage,
        private papa: Papa
    ) {
        this.experienceForm = this.formBuilder.group({
            title: ["", Validators.required],
            description: ["", Validators.required],
            contributed_by: ["", Validators.required],
            date: ["", Validators.required],
        });

        this.editForm = this.formBuilder.group({
            edited_title: ["", Validators.required],
            edited_description: ["", Validators.required],
            edited_contributed_by: ["", Validators.required],
            edited_date: ["", Validators.required],
        });
    }

    ngOnInit() {
        this.getAllExperiences();
    }

    addExperience() {
        const { value } = this.experienceForm;
        console.log(value);

        this.experienceObject.id = "";
        this.experienceObject.experience_title = value.title;
        this.experienceObject.experience_description = value.description;
        this.experienceObject.contributed_by = value.contributed_by;
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
            this.expLessonPlanService.changeExperience(expToIntegrate);
            this.router.navigate(["/display"]);
        }
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
        this.experienceObject.contributed_by = value.edited_contributed_by;
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

    onFileSelect(event: any) {
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

        if (fileExtension !== "csv") {
            alert(
                "The selected file format is not supported. Please upload a CSV."
            );
            this.resetUploadState();
            return;
        }

        console.log(this.selectedFile);
        console.log(this.labelText);
    }

    resetUploadState() {
        this.selectedFile = null;
        this.labelText = "Choose a file";
    }

    onFileUpload() {
        if (!this.selectedFile) {
            alert("No file selected.");
            return;
        } else if (this.selectedFile) {
            alert(this.selectedFile.name + " was successfully uploaded.");
            console.log(this.selectedFile.name + " was successfully uploaded.");
        }

        const storageRef = ref(
            this.storage,
            `experience_files/${this.selectedFile.name}`
        );
        const uploadTask = uploadBytesResumable(storageRef, this.selectedFile);

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

        this.parseCSVContent(this.selectedFile);
    }

    parseCSVContent(file: File) {
        this.papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                if (result.data) {
                    for (let story of result.data) {
                        this.experienceObject.id = "";
                        this.experienceObject.experience_title = Object.values(
                            story
                        )[0] as string;
                        this.experienceObject.experience_description =
                            Object.values(story)[1] as string;
                        this.experienceObject.contributed_by = Object.values(
                            story
                        )[2] as string;
                        this.experienceObject.date = this.datePipe.transform(
                            Object.values(story)[3] as string,
                            "yyyy-MM-dd"
                        ) as string;

                        this.experience_service
                            .parseCSVContent(this.experienceObject)
                            .then((experience) => {
                                if (experience) {
                                    console.log(
                                        "Experience with title " +
                                            Object.values(story)[0] +
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

    filterExperiencesByKeyword() {
        if (!this.keywordSearchTerm) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        console.log(this.keywordSearchTerm);

        this.experiences = this.filteredExp.filter(
            (value: Experience) =>
                value.experience_title
                    .toLowerCase()
                    .includes(this.keywordSearchTerm.toLowerCase()) ||
                value.experience_description
                    .toLowerCase()
                    .includes(this.keywordSearchTerm.toLowerCase())
        );

        console.log("INSIDE KEYWORD FILTER");

        this.experiences.forEach((experience: any) => {
            console.log(
                experience.experience_title,
                experience.experience_description
            );
        });

        this.cdr.detectChanges();
    }

    filterExperiencesByStudent() {
        if (!this.studentSearchTerm) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        console.log(this.studentSearchTerm);

        this.experiences = this.filteredExp.filter((value: Experience) =>
            value.contributed_by
                .toLowerCase()
                .includes(this.studentSearchTerm.toLowerCase())
        );

        console.log("INSIDE STUDENT FILTER");

        this.experiences.forEach((experience: any) => {
            console.log(experience.contributed_by);
        });

        this.cdr.detectChanges();
    }

    filterExperiencesByDate() {
        if (!this.dateSearchTerm) {
            this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        // Change format of date
        this.dateTerm = this.changeDateFormat(this.dateSearchTerm);

        this.experiences = this.filteredExp.filter((value: Experience) =>
            value.date.includes(this.dateTerm)
        );

        console.log("INSIDE DATE FILTER");

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

        // console.log("The Start Date Search Term Is:" + this.startDateSearchTerm);
        // console.log("The End Date Search Term Is:" + this.endDateSearchTerm);

        // Change format of start and end dates
        this.startDateTerm = this.changeDateFormat(this.startDateSearchTerm);
        this.endDateTerm = this.changeDateFormat(this.endDateSearchTerm);

        this.experiences = this.filteredExp.filter(
            (value: Experience) =>
                value.date >= this.startDateTerm &&
                value.date <= this.endDateTerm
        );

        console.log("INSIDE DATE RANGE FILTER");

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

    sortExperiences(event: any): void {
        const criteria = (event.target as HTMLSelectElement).value;

        switch (criteria) {
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

            case "titleHighest":
                this.experiences.sort(
                    (a: Experience, b: Experience) =>
                        this.getNumberFromTitle(b.experience_title) -
                        this.getNumberFromTitle(a.experience_title)
                );
                break;

            case "titleLowest":
                this.experiences.sort(
                    (a: Experience, b: Experience) =>
                        this.getNumberFromTitle(a.experience_title) -
                        this.getNumberFromTitle(b.experience_title)
                );
                break;

            case "studentHighest":
                this.experiences.sort(
                    (a: Experience, b: Experience) =>
                        this.getNumberFromTitle(b.contributed_by) -
                        this.getNumberFromTitle(a.contributed_by)
                );
                break;

            case "studentLowest":
                this.experiences.sort(
                    (a: Experience, b: Experience) =>
                        this.getNumberFromTitle(a.contributed_by) -
                        this.getNumberFromTitle(b.contributed_by)
                );
                break;
        }
    }

    private getNumberFromTitle(title: string): number {
        const match = title.match(/\d+/); // This regex finds numbers in a string
        return match ? parseInt(match[0]) : 0; // Convert the matched number string to an integer
    }
}
