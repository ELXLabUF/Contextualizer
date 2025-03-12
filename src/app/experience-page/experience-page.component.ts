import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
//import { FormBuilder, FormGroup, Validators } from "@angular/forms";
//import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/compat/firestore";
//import { Storage, getDownloadURL, ref, uploadBytesResumable } from "@angular/fire/storage";
import {
    Firestore,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "@angular/fire/firestore";
import { ExperienceLessonPlanService } from "../experience-lesson-plan-service/experience-lesson-plan.service";
//import { ExperienceService } from "../experience-service/experience-service.service";
import { DocumentData } from "../documentData";
//import { Experience } from "../experience";
//import { Student } from "../student";

import { MatDialog } from "@angular/material/dialog";
import { AlertDialogComponent } from "../alert-dialog/alert-dialog.component";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
//import { Papa } from "ngx-papaparse";

@Component({
    selector: "app-experience-page",
    templateUrl: "./experience-page.component.html",
    styleUrls: ["./experience-page.component.css"],
})
export class ExperiencePageComponent implements OnInit, OnDestroy {
    //experienceForm!: FormGroup;
    //editForm!: FormGroup;

    //experienceDetails: any;
    experiences: any = [];
    currCapExperiences: any = [];
    prevCapExperiences: any = [];
    filteredExp: any = [];
    allExperiences: any = [];
    multipleIntegrate: any = [];

    noActiveCapture: boolean = false;

    toggleAllExp: boolean = false;
    togglePrevCap: boolean = false;

    students: any = {};

    /*clickedExperience: Experience = {
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
    };*/

    studentData: any = {};

    prevCaptureName: string = "";
    previousCaptures: any = [];

    //selectedExperienceFile: File | null = null;
    //selectStudentFile: File | null = null;
    //experienceLabelText: string = "Choose a file";
    //studentLabelText: string = "Choose a file";

    id: string = "";

    keywordSearchTerm: string = "";
    studentSearchTerm: string = "";
    //dateSearchTerm!: string;  // For normal HTML
    //dateSearchTerm!: Date; // For mat-form-field mat-input mat-datepicker
    //dateTerm!: string; // For mat-form-field mat-input mat-datepicker
    //startDateSearchTerm: Date | null = null;
    //startDateTerm!: string;
    //endDateSearchTerm: Date | null = null;
    //endDateTerm!: string;
    startDateSearchTerm!: string;
    endDateSearchTerm!: string;
    startDateTerm!: string;
    endDateTerm!: string;

    selectedFemale: boolean = false;
    selectedMale: boolean = false;
    selectedGrade6: boolean = false;
    selectedGrade7: boolean = false;
    selectedGrade8: boolean = false;
    //selectedLastTestGradeA: boolean = false;
    //selectedLastTestGradeB: boolean = false;
    //selectedLastTestGradeC: boolean = false;
    //selectedLastTestGradeD: boolean = false;
    //selectedLastTestGradeF: boolean = false;
    //selectedOverallGradeA: boolean = false;
    //selectedOverallGradeB: boolean = false;
    //selectedOverallGradeC: boolean = false;
    //selectedOverallGradeD: boolean = false;
    //selectedOverallGradeF: boolean = false;
    //selectedADHD: boolean = false;
    //selectedAutism: boolean = false;
    //selectedDyslexia: boolean = false;
    //selectedDyscalculia: boolean = false;
    //selectedNone: boolean = false;
    //selectedAfricanAmerican: boolean = false;
    //selectedAsian: boolean = false;
    //selectedHispanic: boolean = false;
    //selectedWhite: boolean = false;
    //selected80to84: boolean = false;
    //selected85to89: boolean = false;
    //selected90to94: boolean = false;
    //selected95to99: boolean = false;
    //selected100: boolean = false;
    //selectedLow: boolean = false;
    //selectedMid: boolean = false;
    //selectedHigh: boolean = false;
    //selectedPurple: boolean = false;
    //selectedPink: boolean = false;
    //selectedGreen: boolean = false;
    //selectedBlue: boolean = false;
    //selectedYellow: boolean = false;
    //selectedOrange: boolean = false;
    sortOldToNew: boolean = false;
    sortNewToOld: boolean = false;

    selectedExperiences: number = 0;
    totalExperiencesLength: number = 0;

    startNavigationFromExperiences: boolean = false;

    timeStart!: Date;
    timeEnd!: Date;

    /*experienceObject: Experience = {
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
    };*/

    /*studentObject: Student = {
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
    };*/

    constructor(
        private angularFirestore: AngularFirestore,
        private firestore: Firestore,
        //private experience_service: ExperienceService,
        private expLessonPlanService: ExperienceLessonPlanService,
        private cdr: ChangeDetectorRef,
        //private formBuilder: FormBuilder,
        //private datePipe: DatePipe,
        private router: Router,
        //private storage: Storage,
        //private papa: Papa,
        public dialog: MatDialog
    ) {
        //this.experienceForm = this.formBuilder.group({
        //    title: ["", Validators.required],
        //    description: ["", Validators.required],
        //    student_name: ["", Validators.required],
        //    date: ["", Validators.required],
        //});
        //this.editForm = this.formBuilder.group({
        //    edited_title: ["", Validators.required],
        //    edited_description: ["", Validators.required],
        //    edited_student_name: ["", Validators.required],
        //    edited_date: ["", Validators.required],
        //});
    }

    openAlertDialog(title: string, message: string): void {
        this.dialog.open(AlertDialogComponent, {
            width: "600px",
            data: { title: title, message: message },
        });
    }

    openConfirmDialog(title: string, message: string): Observable<boolean> {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: "600px",
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
        userIntData.push({
            Action: "Visited",
            Target: "Experiences page",
            Result: "",
            Time: this.timeStart.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        sessionStorage.setItem("timeStart", this.timeStart.toString());

        this.getCurrentCaptureExperiences();
        this.getPreviousCaptures();

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
            Target: "Experiences page",
            Result: "",
            Time: this.timeEnd.toLocaleString(),
        });
        userIntData.push({
            Action: "Time spent",
            Target: "Experiences page",
            Result: "",
            Time: duration + " seconds",
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    async getCurrentCaptureExperiences() {
        //this.experience_service
        //    .getExperience()
        //    .subscribe((res: Experience[]) => {
        //        this.experiences = res;
        //        this.filteredExp = [...this.experiences];
        //        this.allExperiences = [...this.experiences];
        //    });

        //Get Classroom doc
        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.firestore, classroom);
        const classroomDocSnap = await getDoc(currClassroomDocRef);
        this.students = {};
        let capture_id: string = "";
        let previous_captures: any = {};
        let currSelectedTopic: string = "";

        //Get all Students
        if (classroomDocSnap.exists()) {
            this.students = classroomDocSnap.data()["students"] || {};
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || {};
            currSelectedTopic = classroomDocSnap.data()["selected_topic"] || "";
            if (classroomDocSnap.data()["capture"] !== undefined) {
                capture_id = classroomDocSnap.data()["capture"];
            } else {
                this.noActiveCapture = true;
            }
        } else {
            console.log("No such document!");
        }

        //If no active capture, this.experiences should be empty
        if (!this.noActiveCapture) {
            this.experiences = [];

            //Get all exp with Capture ID equal to the value above and
            //Show Teacher field as true
            this.experiences = await getDocs(
                query(
                    collection(this.firestore, "NewExperiences"),
                    where("capture", "==", capture_id),
                    where("show_to_teacher", "==", true)
                )
            ).then((qDoc: any) => qDoc.docs.map((doc: any) => doc.data()));

            //Convert date into correct format for display and
            //assign each experience the correct student name
            //based on the Device ID associated with it
            this.experiences.forEach((exp: any) => {
                let date = exp["creation_date"];
                exp["creation_date"] = new Date(
                    date.seconds * 1000 + date.nanoseconds / 1000000
                ).toLocaleDateString();
                exp["name"] = this.students[exp["device_id"]]["name"];
                exp["grade"] = this.students[exp["device_id"]]["grade"];
                exp["gender"] = this.students[exp["device_id"]]["gender"];
                exp["title"] = currSelectedTopic;
            });

            this.totalExperiencesLength = Object.keys(this.experiences).length;
            this.selectedExperiences = Object.keys(this.experiences).length;
            this.currCapExperiences = [...this.experiences];
            this.filteredExp = [...this.experiences];
        }

        //Retrieve all experiences irrespective of noActiveCapture value

        //Get all previous capture IDs and store in an array
        let allCaptureIDs: any = [];
        let allSelectedTopics: string[] = [];
        Object.keys(previous_captures).forEach((key: string) => {
            allCaptureIDs.push(key);
            allSelectedTopics.push(previous_captures[key]["name"]);
        });

        //Add current active capture ID to list of all capture IDs
        allCaptureIDs.push(capture_id);
        allSelectedTopics.push(currSelectedTopic);

        this.allExperiences = await getDocs(
            query(
                collection(this.firestore, "NewExperiences"),
                where("capture", "in", allCaptureIDs),
                where("show_to_teacher", "==", true)
            )
        ).then((qDoc: any) => qDoc.docs.map((doc: any) => doc.data()));

        this.allExperiences.forEach((exp: any) => {
            let date = exp["creation_date"];
            exp["creation_date"] = new Date(
                date.seconds * 1000 + date.nanoseconds / 1000000
            ).toLocaleDateString();
            exp["name"] = this.students[exp["device_id"]]["name"];
            exp["grade"] = this.students[exp["device_id"]]["grade"];
            exp["gender"] = this.students[exp["device_id"]]["gender"];
            if (exp["capture"] !== capture_id) {
                exp["title"] = previous_captures[exp["capture"]]["name"];
            } else {
                exp["title"] = currSelectedTopic;
            }
        });

        this.prevCaptureName = "";
    }

    getAllExperiences() {
        this.keywordSearchTerm = "";
        this.startDateSearchTerm = "";
        this.endDateSearchTerm = "";
        this.startDateTerm = "";
        this.endDateTerm = "";
        this.togglePrevCap = false;
        this.prevCaptureName = "";
        this.toggleAllExp = !this.toggleAllExp;

        if (!this.toggleAllExp) {
            this.experiences = [...this.currCapExperiences];
        } else {
            this.filteredExp = [...this.experiences];
            this.experiences = [...this.allExperiences];
        }

        this.selectedExperiences = Object.keys(this.experiences).length;
        this.totalExperiencesLength = Object.keys(this.experiences).length;
    }

    async getPreviousCaptures() {
        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.firestore, classroom);
        const classroomDocSnap = await getDoc(currClassroomDocRef);
        let previous_captures: any = {};

        //Get previous captures
        if (classroomDocSnap.exists()) {
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || {};
        } else {
            console.log("No such document!");
        }

        for (const key of Object.keys(previous_captures)) {
            //const arr = key.split(" ");
            //const idx = Number(arr[arr.length - 1]);
            const numbersOnly = key.replace(/[^0-9]/g, ""); // Remove non-numeric characters
            const trailingNumbersMatch = key.match(/(\d+)$/); // Match digits at the end of the string
            let num = trailingNumbersMatch ? trailingNumbersMatch[0] : "1"; // Return the matched digits or an empty string if no match
            const idx = Number(num);
            let startDate = new Date(
                previous_captures[key]["start_date"].seconds * 1000 +
                    previous_captures[key]["start_date"].nanoseconds / 1000000
            ).toLocaleDateString();
            let endDate = new Date(
                previous_captures[key]["due_date"].seconds * 1000 +
                    previous_captures[key]["due_date"].nanoseconds / 1000000
            ).toLocaleDateString();
            const captureObject = {
                capture: classroom + idx.toString(),
                name: previous_captures[key]["name"],
                start_date: startDate,
                due_date: endDate,
            };
            this.previousCaptures.push(captureObject);
        }
    }

    async getPreviousCaptureExperiences() {
        this.togglePrevCap = true;
        this.toggleAllExp = false;
        this.keywordSearchTerm = "";
        this.startDateSearchTerm = "";
        this.endDateSearchTerm = "";
        this.startDateTerm = "";
        this.endDateTerm = "";
        const capture_id = this.prevCaptureName.slice(10);

        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.firestore, classroom);
        const classroomDocSnap = await getDoc(currClassroomDocRef);
        let previous_captures: any = {};

        //Get previous captures
        if (classroomDocSnap.exists()) {
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || {};
        } else {
            console.log("No such document!");
        }

        //Get experiences with correct capture ID
        this.experiences = await getDocs(
            query(
                collection(this.firestore, "NewExperiences"),
                where("capture", "==", capture_id),
                where("show_to_teacher", "==", true)
            )
        ).then((qDoc: any) => qDoc.docs.map((doc: any) => doc.data()));

        //Convert date into correct format for display and
        //assign each experience the correct student name
        //based on the Device ID associated with it
        this.experiences.forEach((exp: any) => {
            let date = exp["creation_date"];
            exp["creation_date"] = new Date(
                date.seconds * 1000 + date.nanoseconds / 1000000
            ).toLocaleDateString();
            exp["name"] = this.students[exp["device_id"]]["name"];
            exp["grade"] = this.students[exp["device_id"]]["grade"];
            exp["gender"] = this.students[exp["device_id"]]["gender"];
            exp["title"] = previous_captures[capture_id]["name"];
        });

        this.prevCapExperiences = [...this.experiences];
        this.selectedExperiences = Object.keys(this.experiences).length;
        this.totalExperiencesLength = Object.keys(this.experiences).length;
    }

    /*addExperience() {
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
	}*/

    /*deleteExperience(experience: Experience) {
		let decision = confirm(
			"Are you sure you want to delete this experience?"
		);

		if (decision === true) {
			this.experience_service.deleteExperience(experience);
		}
	}*/

    /*updateExperience(experience: Experience) {
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
	}*/

    /*getExperienceDetails(experience: Experience) {
		this.experienceDetails = experience;
		console.log(this.experienceDetails);
	}*/

    /*integrateExperience(expToIntegrate: Experience) {
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
						this.angularFirestore
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
									return this.angularFirestore
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
	}*/

    /*resetUploadState() {
        this.selectedExperienceFile = null;
        this.experienceLabelText = "Choose a file";
        this.studentLabelText = "Choose a file";
    }*/

    /*onExperienceFileSelect(event: any) {
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

        // console.log(this.selectedExperienceFile);
        // console.log(this.experienceLabelText);
    }*/

    /*onExperienceFileUpload() {
        if (!this.selectedExperienceFile) {
            alert("No file selected.");
            return;
        } else if (this.selectedExperienceFile) {
            alert(
                this.selectedExperienceFile.name + " was successfully uploaded."
            );
            // console.log(this.selectedExperienceFile.name + " was successfully uploaded.");
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
                // console.log("Upload is " + progress + "% done");
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
    }*/

    /*parseExperienceCSVContent(file: File) {
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
    }*/

    /*onStudentFileSelect(event: any) {
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

        // console.log(this.selectStudentFile);
        // console.log(this.studentLabelText);
    }*/

    /*onStudentFileUpload() {
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
                // console.log("Upload is " + progress + "% done");
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
    }*/

    /*parseStudentCSVContent(file: File) {
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
    }*/

    // Add multiple experiences
    addRemoveMultipleExp(exp: any) {
        if (this.multipleIntegrate.includes(exp)) {
            let userIntData: any = [];
            let time = new Date();
            userIntData = JSON.parse(
                sessionStorage.getItem("userInteractionData") || "[]"
            );
            userIntData.push({
                Action: "Clicked",
                Target:
                    "Checkbox for experience with title " +
                    //exp.experience_title,
                    exp.title,
                Result: "De-select the experience",
                Time: time.toLocaleString(),
            });
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
            userIntData.push({
                Action: "Clicked",
                Target:
                    "Checkbox for experience with title " +
                    //exp.experience_title,
                    exp.title,
                Result: "Select the experience",
                Time: time.toLocaleString(),
            });
            sessionStorage.setItem(
                "userInteractionData",
                JSON.stringify(userIntData)
            );

            this.multipleIntegrate.push(exp);
        }
    }

    // Check candidacy of element to set checkbox attribute
    checkCandidacy(exp: any) {
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
            userIntData.push({
                Action: "Clicked",
                Target: "'Ok' button",
                Result: "Close alert dialog box",
                Time: time.toLocaleString(),
            });
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
                userIntData.push({
                    Action: "Clicked",
                    Target: "'Yes, Confirm' button",
                    Result: "Integrate selected experiences with LP",
                    Time: time.toLocaleString(),
                });
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
                    // console.log("Clicked OK");
                    this.expLessonPlanService.currentDocumentId
                        .pipe(take(1))
                        .subscribe((id) => {
                            // console.log("Inside subscribe callback");
                            if (id) {
                                this.id = id;
                                // console.log("Document ID:", this.id);
                                // console.log("Experience to integrate:", this.multipleIntegrate);
                                // Now, we have the ID, so let's try to update Firestore.
                                this.angularFirestore
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
                                            return this.angularFirestore
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
                userIntData.push({
                    Action: "Clicked",
                    Target: "'No, Go Back' button",
                    Result: "Deny integration of selected experiences",
                    Time: time.toLocaleString(),
                });
                sessionStorage.setItem(
                    "userInteractionData",
                    JSON.stringify(userIntData)
                );
            }
        });
    }

    displayStudentData(event: any, experience: any) {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked on",
            Target: "Student: " + experience.student_name,
            Result: "Display student details",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        //this.clickedExperience = experience;
        this.studentData = this.students[experience["device_id"]];
        event.target.click();
    }

    onFilterByKeywordClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Search Keyword' filter",
            Result: "Filter experiences",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    filterExperiencesByKeyword() {
        if (this.toggleAllExp) {
            this.experiences = [...this.allExperiences];
        } else if (this.togglePrevCap) {
            this.experiences = [...this.prevCapExperiences];
        } else {
            this.experiences = [...this.currCapExperiences];
        }

        this.selectedExperiences = this.experiences.length;

        if (!this.keywordSearchTerm) {
            return;
        }

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Typed",
            Target: "'Search Keyword' filter",
            Result: this.keywordSearchTerm,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.filteredExp = [...this.experiences];

        this.experiences = this.filteredExp.filter((exp: any) =>
            // exp.experience_title
            //     .toLowerCase()
            //     .includes(this.keywordSearchTerm.toLowerCase()) ||
            //exp.experience_description
            exp.transcript
                .toLowerCase()
                .includes(this.keywordSearchTerm.toLowerCase())
        );

        // this.experiences.forEach((experience: any) => {
        //     console.log(
        //         experience.experience_title,
        //         experience.experience_description
        //     );
        // });

        this.selectedExperiences = this.experiences.length;
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

    /*onFilterByDateClick() {
		let userIntData: any = [];
		let time = new Date();
		userIntData = JSON.parse(
			sessionStorage.getItem("userInteractionData") || "[]"
		);
		userIntData.push({
			Action: "Clicked",
			Target: "'Search Date' filter",
			Result: "Filter experiences",
			Time: time.toLocaleString(),
		});
		sessionStorage.setItem(
			"userInteractionData",
			JSON.stringify(userIntData)
		);
	}*/

    /*filterExperiencesByDate() {
		if (!this.dateSearchTerm) {
			this.experiences = [...this.filteredExp];
			this.selectedExperiences = this.experiences.length;
			return;
		}

		let userIntData: any = [];
		let time = new Date();
		userIntData = JSON.parse(
			sessionStorage.getItem("userInteractionData") || "[]"
		);
		userIntData.push({
			Action: "Typed",
			Target: "'Search Date' filter",
			Result: this.dateSearchTerm,
			Time: time.toLocaleString(),
		});
		sessionStorage.setItem(
			"userInteractionData",
			JSON.stringify(userIntData)
		);

		this.dateTerm = this.changeDateFormat(this.dateSearchTerm); // For mat-form-field mat-input mat-datepicker

		this.experiences = this.filteredExp.filter((value: Experience) =>
			value.date.includes(this.dateTerm)
		);

		// this.experiences.forEach((experience: any) => {
		//     console.log(experience.date);
		// });

		this.selectedExperiences = this.experiences.length;
		this.cdr.detectChanges();
	}*/

    onFilterByDateRangeClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Search Date Range' filter",
            Result: "Filter experiences",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    removeTimeZoneOffset(inputDate: string) {
        const date = new Date(inputDate);
        const tzOffset = date.getTimezoneOffset() * 60000;
        const offsetDate = new Date(date.getTime() + tzOffset);
        return offsetDate.toLocaleDateString();
    }

    filterExperiencesByDateRange() {
        if (this.toggleAllExp) {
            this.experiences = [...this.allExperiences];
        } else if (this.togglePrevCap) {
            this.experiences = [...this.prevCapExperiences];
        } else {
            this.experiences = [...this.currCapExperiences];
        }

        this.selectedExperiences = this.experiences.length;

        if (!this.startDateSearchTerm) {
            return;
        }

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Typed",
            Target: "'Search Date Range' filter",
            Result: this.startDateSearchTerm,
            Time: time.toLocaleString(),
        });
        userIntData.push({
            Action: "Typed",
            Target: "'Search Date Range' filter",
            Result: this.endDateSearchTerm,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        // Change format of start and end dates
        //this.startDateTerm = this.changeDateFormat(this.startDateSearchTerm);
        //this.startDateTerm = this.changeDateFormat(
        //    this.startDateSearchTerm.toLocaleDateString().split("/")
        //);
        //this.endDateSearchTerm === null
        //    ? this.startDateSearchTerm
        //    : this.endDateSearchTerm;
        //this.endDateTerm = this.changeDateFormat(
        //    //this.endDateSearchTerm || this.startDateSearchTerm
        //    this.endDateSearchTerm?.toLocaleDateString().split("/") ||
        //        this.startDateSearchTerm.toLocaleDateString().split("/")
        //);

        //this.startDateTerm = this.startDateSearchTerm.toLocaleDateString();
        //if (
        //    this.endDateSearchTerm !== null &&
        //    this.endDateSearchTerm !== undefined
        //) {
        //    this.endDateTerm = this.endDateSearchTerm.toLocaleDateString();
        //}

        this.startDateTerm = this.removeTimeZoneOffset(
            this.startDateSearchTerm
        );

        if (
            this.endDateSearchTerm !== null &&
            this.endDateSearchTerm !== undefined &&
            this.endDateSearchTerm !== ""
        ) {
            this.endDateTerm = this.removeTimeZoneOffset(
                this.endDateSearchTerm
            );
        }

        this.filteredExp = [...this.experiences];

        if (
            this.endDateTerm !== null &&
            this.endDateTerm !== undefined &&
            this.endDateTerm !== ""
        ) {
            this.experiences = this.filteredExp.filter((exp: any) => {
                return (
                    new Date(exp.creation_date).getTime() >=
                        new Date(this.startDateTerm).getTime() &&
                    new Date(exp.creation_date).getTime() <=
                        new Date(this.endDateTerm).getTime()
                );
            });
        } else {
            this.experiences = this.filteredExp.filter((exp: any) => {
                return (
                    new Date(exp.creation_date).getTime() >=
                    new Date(this.startDateTerm).getTime()
                );
            });
        }

        //this.endDateSearchTerm = "";
        //this.endDateTerm = "";
        this.selectedExperiences = this.experiences.length;
        this.cdr.detectChanges();
    }

    onAdvancedSearchFilterButtonClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Advanced Search and Filter' button",
            Result: "Open advanced search and filter dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onFilterByStudentClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Search Student' filter",
            Result: "Filter experiences",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    filterByStudentName() {
        if (!this.studentSearchTerm) {
            // this.experiences = [...this.filteredExp]; // restore original list when search is cleared
            return;
        }

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Typed",
            Target: "'Search Student' filter",
            Result: this.studentSearchTerm,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        // this.experiences = this.filteredExp.filter((value: Experience) =>
        //     value.student_name
        //         .toLowerCase()
        //         .includes(this.studentSearchTerm.toLowerCase())
        // );

        // this.experiences.forEach((experience: any) => {
        //     console.log(experience.student_name);
        // });

        // this.cdr.detectChanges();
    }

    /*filterExperiencesByStudentGender(event: any): void {
		if (!event || event.length === 0) {
			// this.experiences = [...this.filteredExp];
			this.containsFemale = false;
			this.containsMale = false;
			return;
		}

		let userIntData: any = [];
		let time = new Date();
		userIntData = JSON.parse(
			sessionStorage.getItem("userInteractionData") || "[]"
		);
		userIntData.push({
			Action: "Clicked",
			Target: "'Search Student Gender' filter",
			Result:
				"Select value(s) " +
				event[0] +
				(event[1] ? " and " + event[1] : ""),
			Time: time.toLocaleString(),
		});
		sessionStorage.setItem(
			"userInteractionData",
			JSON.stringify(userIntData)
		);

		this.containsFemale = event.some(
			(element: any) => element === "female"
		);
		this.containsMale = event.some((element: any) => element === "male");

		// this.experiences = this.filteredExp.filter(
		//     (value: Experience) =>
		//         value.student_data.student_gender ===
		//             (containsFemale ? "F" : "") ||
		//         value.student_data.student_gender === (containsMale ? "M" : "")
		// );
		// this.cdr.detectChanges();
	}*/

    /*filterExperiencesByStudentLastTestGrade(event: any): void {
		if (!event || event.length === 0) {
			// this.experiences = [...this.filteredExp];
			this.containsLastTestGradeA = false;
			this.containsLastTestGradeB = false;
			this.containsLastTestGradeC = false;
			this.containsLastTestGradeD = false;
			this.containsLastTestGradeF = false;
			return;
		}

		let userIntData: any = [];
		let time = new Date();
		userIntData = JSON.parse(
			sessionStorage.getItem("userInteractionData") || "[]"
		);
		userIntData.push({
			Action: "Clicked",
			Target: "'Search Student Last Test Grade' filter",
			Result:
				"Select value(s) " +
				event[0] +
				(event[1] ? " and " + event[1] : "") +
				(event[2] ? " and " + event[2] : "") +
				(event[3] ? " and " + event[3] : "") +
				(event[4] ? " and " + event[4] : ""),
			Time: time.toLocaleString(),
		});
		sessionStorage.setItem(
			"userInteractionData",
			JSON.stringify(userIntData)
		);

		this.containsLastTestGradeA = event.some(
			(element: any) => element === "lastTestGradeA"
		);
		this.containsLastTestGradeB = event.some(
			(element: any) => element === "lastTestGradeB"
		);
		this.containsLastTestGradeC = event.some(
			(element: any) => element === "lastTestGradeC"
		);
		this.containsLastTestGradeD = event.some(
			(element: any) => element === "lastTestGradeD"
		);
		this.containsLastTestGradeF = event.some(
			(element: any) => element === "lastTestGradeF"
		);

		// this.experiences = this.filteredExp.filter(
		//     (value: Experience) =>
		//         value.student_data.student_last_test_grade ===
		//             (containsGradeA ? "A" : "") ||
		//         value.student_data.student_last_test_grade ===
		//             (containsGradeB ? "B" : "") ||
		//         value.student_data.student_last_test_grade ===
		//             (containsGradeC ? "C" : "") ||
		//         value.student_data.student_last_test_grade ===
		//             (containsGradeD ? "D" : "") ||
		//         value.student_data.student_last_test_grade ===
		//             (containsGradeF ? "F" : "")
		// );
		// this.cdr.detectChanges();
	}*/

    /*filterExperiencesByStudentTable(event: any): void {
		if (!event || event.length === 0) {
			this.experiences = [...this.filteredExp];
			return;
		}

		let userIntData: any = [];
		let time = new Date();
		userIntData = JSON.parse(
			sessionStorage.getItem("userInteractionData") || "[]"
		);
		userIntData.push({
			Action: "Clicked",
			Target: "'Search Student Table' filter",
			Result:
				"Select value(s) " +
				event[0] +
				(event[1] ? " and " + event[1] : "") +
				(event[2] ? " and " + event[2] : "") +
				(event[3] ? " and " + event[3] : "") +
				(event[4] ? " and " + event[4] : ""),
			Time: time.toLocaleString(),
		});
		sessionStorage.setItem(
			"userInteractionData",
			JSON.stringify(userIntData)
		);

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
	}*/

    /*filterExperiencesByStudentOverallPerformance(event: any): void {
		if (!event || event.length === 0) {
			// this.experiences = [...this.filteredExp];
			this.containsOverallGradeA = false;
			this.containsOverallGradeB = false;
			this.containsOverallGradeC = false;
			this.containsOverallGradeD = false;
			this.containsOverallGradeF = false;
			return;
		}

		let userIntData: any = [];
		let time = new Date();
		userIntData = JSON.parse(
			sessionStorage.getItem("userInteractionData") || "[]"
		);
		userIntData.push({
			Action: "Clicked",
			Target: "'Search Student Overall Performance' filter",
			Result:
				"Select value(s) " +
				event[0] +
				(event[1] ? " and " + event[1] : "") +
				(event[2] ? " and " + event[2] : "") +
				(event[3] ? " and " + event[3] : "") +
				(event[4] ? " and " + event[4] : ""),
			Time: time.toLocaleString(),
		});
		sessionStorage.setItem(
			"userInteractionData",
			JSON.stringify(userIntData)
		);

		this.containsOverallGradeA = event.some(
			(element: any) => element === "overallGradeA"
		);
		this.containsOverallGradeB = event.some(
			(element: any) => element === "overallGradeB"
		);
		this.containsOverallGradeC = event.some(
			(element: any) => element === "overallGradeC"
		);
		this.containsOverallGradeD = event.some(
			(element: any) => element === "overallGradeD"
		);
		this.containsOverallGradeF = event.some(
			(element: any) => element === "overallGradeF"
		);

		// this.experiences = this.filteredExp.filter(
		//     (value: Experience) =>
		//         value.student_data.student_overall_performance ===
		//             (containsGradeA ? "A" : "") ||
		//         value.student_data.student_overall_performance ===
		//             (containsGradeB ? "B" : "") ||
		//         value.student_data.student_overall_performance ===
		//             (containsGradeC ? "C" : "") ||
		//         value.student_data.student_overall_performance ===
		//             (containsGradeD ? "D" : "") ||
		//         value.student_data.student_overall_performance ===
		//             (containsGradeF ? "F" : "")
		// );
		// this.cdr.detectChanges();
	}*/

    /*filterExperiencesByStudentLearningDisability(event: any): void {
		if (!event || event.length === 0) {
			// this.experiences = [...this.filteredExp];
			this.containsADHD = false;
			this.containsAutism = false;
			this.containsDyslexia = false;
			this.containsDyscalculia = false;
			this.containsNone = false;
			return;
		}

		let userIntData: any = [];
		let time = new Date();
		userIntData = JSON.parse(
			sessionStorage.getItem("userInteractionData") || "[]"
		);
		userIntData.push({
			Action: "Clicked",
			Target: "'Search Student Learning Disability' filter",
			Result:
				"Select value(s) " +
				event[0] +
				(event[1] ? " and " + event[1] : "") +
				(event[2] ? " and " + event[2] : "") +
				(event[3] ? " and " + event[3] : "") +
				(event[4] ? " and " + event[4] : ""),
			Time: time.toLocaleString(),
		});
		sessionStorage.setItem(
			"userInteractionData",
			JSON.stringify(userIntData)
		);

		this.containsADHD = event.some((element: any) => element === "adhd");
		this.containsAutism = event.some(
			(element: any) => element === "autism"
		);
		this.containsDyslexia = event.some(
			(element: any) => element === "dyslexia"
		);
		this.containsDyscalculia = event.some(
			(element: any) => element === "dyscalculia"
		);
		this.containsNone = event.some((element: any) => element === "none");

		// this.experiences = this.filteredExp.filter(
		//     (value: Experience) =>
		//         value.student_data.student_learning_disability ===
		//             (containsADHD ? "ADHD" : "") ||
		//         value.student_data.student_learning_disability ===
		//             (containsAutism ? "Autism" : "") ||
		//         value.student_data.student_learning_disability ===
		//             (containsDyslexia ? "Dyslexia" : "") ||
		//         value.student_data.student_learning_disability ===
		//             (containsDyscalculia ? "Dyscalculia" : "") ||
		//         value.student_data.student_learning_disability ===
		//             (containsNone ? "None reported" : "")
		// );
		// this.cdr.detectChanges();
	}*/

    /*filterExperiencesByStudentRaceOrEthnicity(event: any): void {
		if (!event || event.length === 0) {
			// this.experiences = [...this.filteredExp];
			this.containsAfricanAmerican = false;
			this.containsAsian = false;
			this.containsHispanic = false;
			this.containsWhite = false;
			return;
		}

		let userIntData: any = [];
		let time = new Date();
		userIntData = JSON.parse(
			sessionStorage.getItem("userInteractionData") || "[]"
		);
		userIntData.push({
			Action: "Clicked",
			Target: "'Search Student Race/Ethnicity' filter",
			Result:
				"Select value(s) " +
				event[0] +
				(event[1] ? " and " + event[1] : "") +
				(event[2] ? " and " + event[2] : "") +
				(event[3] ? " and " + event[3] : ""),
			Time: time.toLocaleString(),
		});
		sessionStorage.setItem(
			"userInteractionData",
			JSON.stringify(userIntData)
		);

		this.containsAfricanAmerican = event.some(
			(element: any) => element === "african-american"
		);
		this.containsAsian = event.some((element: any) => element === "asian");
		this.containsHispanic = event.some(
			(element: any) => element === "hispanic"
		);
		this.containsWhite = event.some((element: any) => element === "white");

		// this.experiences = this.filteredExp.filter(
		//     (value: Experience) =>
		//         value.student_data.student_race_ethnicity ===
		//             (containsAfricanAmerican ? "African-American" : "") ||
		//         value.student_data.student_race_ethnicity ===
		//             (containsAsian ? "Asian" : "") ||
		//         value.student_data.student_race_ethnicity ===
		//             (containsHispanic ? "Hispanic" : "") ||
		//         value.student_data.student_race_ethnicity ===
		//             (containsWhite ? "White" : "")
		// );
		// this.cdr.detectChanges();
	}*/

    /*filterExperiencesByStudentAttendance(event: any): void {
		if (!event || event.length === 0) {
			// this.experiences = [...this.filteredExp];
			this.contains80to84 = false;
			this.contains85to89 = false;
			this.contains90to94 = false;
			this.contains95to99 = false;
			this.contains100 = false;
			return;
		}

		let userIntData: any = [];
		let time = new Date();
		userIntData = JSON.parse(
			sessionStorage.getItem("userInteractionData") || "[]"
		);
		userIntData.push({
			Action: "Clicked",
			Target: "'Search Student Attendance' filter",
			Result:
				"Select value(s) " +
				event[0] +
				(event[1] ? " and " + event[1] : "") +
				(event[2] ? " and " + event[2] : "") +
				(event[3] ? " and " + event[3] : "") +
				(event[4] ? " and " + event[4] : "") +
				(event[5] ? " and " + event[5] : ""),
			// + (event[6] ? " and " + event[6] : "") +
			// (event[7] ? " and " + event[7] : "") +
			// (event[8] ? " and " + event[8] : ""),
			Time: time.toLocaleString(),
		});
		sessionStorage.setItem(
			"userInteractionData",
			JSON.stringify(userIntData)
		);

		this.contains80to84 = event.some((element: any) => element === "80-84");
		// const containsAbove80 = event.some(
		//     (element: any) => element === "above80"
		// );
		this.contains85to89 = event.some((element: any) => element === "85-89");
		// const containsAbove85 = event.some(
		//     (element: any) => element === "above85"
		// );
		this.contains90to94 = event.some((element: any) => element === "90-94");
		// const containsAbove90 = event.some(
		//     (element: any) => element === "above90"
		// );
		this.contains95to99 = event.some((element: any) => element === "95-99");
		// const containsAbove95 = event.some(
		//     (element: any) => element === "above95"
		// );
		this.contains100 = event.some((element: any) => element === "100");

		// this.experiences = this.filteredExp.filter(
		//     (value: Experience) =>
		//         (contains80to84
		//             ? parseInt(value.student_data.student_attendance) >= 80 &&
		//               parseInt(value.student_data.student_attendance) <= 84
		//             : null) ||
		//         // (containsAbove80
		//         //     ? parseInt(value.student_data.student_attendance) >= 80
		//         //     : null) ||
		//         (contains85to89
		//             ? parseInt(value.student_data.student_attendance) >= 85 &&
		//               parseInt(value.student_data.student_attendance) <= 89
		//             : null) ||
		//         // (containsAbove85
		//         //     ? parseInt(value.student_data.student_attendance) >= 85
		//         //     : null) ||
		//         (contains90to94
		//             ? parseInt(value.student_data.student_attendance) >= 90 &&
		//               parseInt(value.student_data.student_attendance) <= 94
		//             : null) ||
		//         // (containsAbove90
		//         //     ? parseInt(value.student_data.student_attendance) >= 90
		//         //     : null) ||
		//         (contains95to99
		//             ? parseInt(value.student_data.student_attendance) >= 95 &&
		//               parseInt(value.student_data.student_attendance) <= 99
		//             : null) ||
		//         // (containsAbove95
		//         //     ? parseInt(value.student_data.student_attendance) >= 95
		//         //     : null) ||
		//         (contains100
		//             ? parseInt(value.student_data.student_attendance) === 100
		//             : null)
		// );
		// this.cdr.detectChanges();
	}*/

    /*filterExperiencesByStudentClassParticipation(event: any): void {
		if (!event || event.length === 0) {
			// this.experiences = [...this.filteredExp];
			this.containsLow = false;
			this.containsMid = false;
			this.containsHigh = false;
			return;
		}

		let userIntData: any = [];
		let time = new Date();
		userIntData = JSON.parse(
			sessionStorage.getItem("userInteractionData") || "[]"
		);
		userIntData.push({
			Action: "Clicked",
			Target: "'Search Student In-Class Participation' filter",
			Result:
				"Select value(s) " +
				event[0] +
				(event[1] ? " and " + event[1] : "") +
				(event[2] ? " and " + event[2] : ""),
			Time: time.toLocaleString(),
		});
		sessionStorage.setItem(
			"userInteractionData",
			JSON.stringify(userIntData)
		);

		this.containsLow = event.some((element: any) => element === "low");
		this.containsMid = event.some((element: any) => element === "mid");
		this.containsHigh = event.some((element: any) => element === "high");

		// this.experiences = this.filteredExp.filter(
		//     (value: Experience) =>
		//         value.student_data.student_class_participation ===
		//             (containsLow ? "Low" : "") ||
		//         value.student_data.student_class_participation ===
		//             (containsMid ? "Mid" : "") ||
		//         value.student_data.student_class_participation ===
		//             (containsHigh ? "High" : "")
		// );
		// this.cdr.detectChanges();
	}*/

    filterByGenderFemale(event: any) {
        this.selectedFemale = event.target.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for gender 'Female'",
            Result: event.target.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    filterByGenderMale(event: any) {
        this.selectedMale = event.target.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for gender 'Male'",
            Result: event.target.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    filterByGrade6(event: any) {
        this.selectedGrade6 = event.target.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for grade 6",
            Result: event.target.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    filterByGrade7(event: any) {
        this.selectedGrade7 = event.target.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for grade 7",
            Result: event.target.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    filterByGrade8(event: any) {
        this.selectedGrade8 = event.target.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for grade 8",
            Result: event.target.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    /*filterByLastTestGradeA(event: any) {
        this.selectedLastTestGradeA = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for last test grade 'A'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByLastTestGradeB(event: any) {
        this.selectedLastTestGradeB = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for last test grade 'B'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByLastTestGradeC(event: any) {
        this.selectedLastTestGradeC = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for last test grade 'C'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByLastTestGradeD(event: any) {
        this.selectedLastTestGradeD = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for last test grade 'D'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByLastTestGradeF(event: any) {
        this.selectedLastTestGradeF = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for last test grade 'F'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByOverallGradeA(event: any) {
        this.selectedOverallGradeA = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for overall grade 'A'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByOverallGradeB(event: any) {
        this.selectedOverallGradeB = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for overall grade 'B'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByOverallGradeC(event: any) {
        this.selectedOverallGradeC = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for overall grade 'C'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByOverallGradeD(event: any) {
        this.selectedOverallGradeD = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for overall grade 'D'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByOverallGradeF(event: any) {
        this.selectedOverallGradeF = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for overall grade 'F'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByDisabilityADHD(event: any) {
        this.selectedADHD = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for disability 'ADHD'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByDisabilityAutism(event: any) {
        this.selectedAutism = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for disability 'Autism'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByDisabilityDyslexia(event: any) {
        this.selectedDyslexia = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for disability 'Dyslexia'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByDisabilityDyscalculia(event: any) {
        this.selectedDyscalculia = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for disability 'Dyscalculia'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByDisabilityNone(event: any) {
        this.selectedNone = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for disability 'None Reported'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByEthnicityAfricanAmerican(event: any) {
        this.selectedAfricanAmerican = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for ethnicity 'African-American'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByEthnicityAsian(event: any) {
        this.selectedAsian = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for ethnicity 'Asian'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByEthnicityHispanic(event: any) {
        this.selectedHispanic = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for ethnicity 'Hispanic'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByEthnicityWhite(event: any) {
        this.selectedWhite = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for ethnicity 'White'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByAttendance80to84(event: any) {
        this.selected80to84 = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for attendance '80%-84%'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByAttendance85to89(event: any) {
        this.selected85to89 = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for attendance '85%-89%'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByAttendance90to94(event: any) {
        this.selected90to94 = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for attendance '90%-94%'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByAttendance95to99(event: any) {
        this.selected95to99 = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for attendance '95%-99%'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByAttendance100(event: any) {
        this.selected100 = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for attendance '100%'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByParticipationLow(event: any) {
        this.selectedLow = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for participation 'Low'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByParticipationMid(event: any) {
        this.selectedMid = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for participation 'Mid'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByParticipationHigh(event: any) {
        this.selectedHigh = event.checked;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Checkbox for participation 'High'",
            Result: event.checked
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByBlue() {
        this.selectedBlue = !this.selectedBlue;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Table with color 'Blue'",
            Result: this.selectedBlue
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByGreen() {
        this.selectedGreen = !this.selectedGreen;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Table with color 'Green'",
            Result: this.selectedGreen
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByOrange() {
        this.selectedOrange = !this.selectedOrange;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Table with color 'Orange'",
            Result: this.selectedOrange
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByPink() {
        this.selectedPink = !this.selectedPink;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Table with color 'Pink'",
            Result: this.selectedPink
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByPurple() {
        this.selectedPurple = !this.selectedPurple;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Table with color 'Purple'",
            Result: this.selectedPurple
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*filterByYellow() {
        this.selectedYellow = !this.selectedYellow;

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "Table with color 'Yellow'",
            Result: this.selectedYellow
                ? "Select the filter"
                : "De-select the filter",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    sortByTime(event: any) {
        event.target.value === "oldToNew"
            ? (this.sortOldToNew = true)
            : (this.sortOldToNew = false);
        event.target.value === "newToOld"
            ? (this.sortNewToOld = true)
            : (this.sortNewToOld = false);

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target:
                event.target.value === "oldToNew"
                    ? "Radio button for filter 'Oldest to Newest'"
                    : "Radio button for filter 'Newest to Oldest'",
            Result:
                event.target.value === "newToOld"
                    ? "Filter experiences using date from oldest to newest"
                    : "Filter experiences using date from newest to oldest",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    applyAdvancedSearchFilters() {
        if (this.toggleAllExp) {
            this.experiences = [...this.allExperiences];
        } else if (this.togglePrevCap) {
            this.experiences = [...this.prevCapExperiences];
        } else {
            this.experiences = [...this.currCapExperiences];
        }

        this.filteredExp = [...this.experiences];

        this.experiences = this.filteredExp.filter((exp: any) =>
            exp.name
                .toLowerCase()
                .includes(this.studentSearchTerm.toLowerCase())
        );

        this.filteredExp = [...this.experiences];

        if (this.selectedFemale || this.selectedMale) {
            this.experiences = this.filteredExp.filter(
                (exp: any) =>
                    exp.gender === (this.selectedFemale ? "F" : null) ||
                    exp.gender === (this.selectedMale ? "M" : null)
            );
        }

        this.filteredExp = [...this.experiences];

        if (this.selectedGrade6 || this.selectedGrade7 || this.selectedGrade8) {
            this.experiences = this.filteredExp.filter(
                (exp: any) =>
                    exp.grade === (this.selectedGrade6 ? 6 : null) ||
                    exp.grade === (this.selectedGrade7 ? 7 : null) ||
                    exp.grade === (this.selectedGrade8 ? 8 : null)
            );
        }

        /*this.experiences = this.filteredExp.filter((value: Experience) =>
            value.student_name
                .toLowerCase()
                .includes(this.studentSearchTerm.toLowerCase())
        );

        this.filteredExp = [...this.experiences];

        if (this.selectedFemale || this.selectedMale) {
            this.experiences = this.filteredExp.filter(
                (value: Experience) =>
                    value.student_data.student_gender ===
                        (this.selectedFemale ? "F" : null) ||
                    value.student_data.student_gender ===
                        (this.selectedMale ? "M" : null)
            );
        }

        this.filteredExp = [...this.experiences];

        if (
            this.selectedLastTestGradeA ||
            this.selectedLastTestGradeB ||
            this.selectedLastTestGradeC ||
            this.selectedLastTestGradeD ||
            this.selectedLastTestGradeF
        ) {
            this.experiences = this.filteredExp.filter(
                (value: Experience) =>
                    value.student_data.student_last_test_grade ===
                        (this.selectedLastTestGradeA ? "A" : null) ||
                    value.student_data.student_last_test_grade ===
                        (this.selectedLastTestGradeB ? "B" : null) ||
                    value.student_data.student_last_test_grade ===
                        (this.selectedLastTestGradeC ? "C" : null) ||
                    value.student_data.student_last_test_grade ===
                        (this.selectedLastTestGradeD ? "D" : null) ||
                    value.student_data.student_last_test_grade ===
                        (this.selectedLastTestGradeF ? "F" : null)
            );
        }

        this.filteredExp = [...this.experiences];

        if (
            this.selectedOverallGradeA ||
            this.selectedOverallGradeB ||
            this.selectedOverallGradeC ||
            this.selectedOverallGradeD ||
            this.selectedOverallGradeF
        ) {
            this.experiences = this.filteredExp.filter(
                (value: Experience) =>
                    value.student_data.student_overall_performance ===
                        (this.selectedOverallGradeA ? "A" : null) ||
                    value.student_data.student_overall_performance ===
                        (this.selectedOverallGradeB ? "B" : null) ||
                    value.student_data.student_overall_performance ===
                        (this.selectedOverallGradeC ? "C" : null) ||
                    value.student_data.student_overall_performance ===
                        (this.selectedOverallGradeD ? "D" : null) ||
                    value.student_data.student_overall_performance ===
                        (this.selectedOverallGradeF ? "F" : null)
            );
        }

        this.filteredExp = [...this.experiences];

        if (
            this.selectedADHD ||
            this.selectedAutism ||
            this.selectedDyslexia ||
            this.selectedDyscalculia ||
            this.selectedNone
        ) {
            this.experiences = this.filteredExp.filter(
                (value: Experience) =>
                    value.student_data.student_learning_disability ===
                        (this.selectedADHD ? "ADHD" : null) ||
                    value.student_data.student_learning_disability ===
                        (this.selectedAutism ? "Autism" : null) ||
                    value.student_data.student_learning_disability ===
                        (this.selectedDyslexia ? "Dyslexia" : null) ||
                    value.student_data.student_learning_disability ===
                        (this.selectedDyscalculia ? "Dyscalculia" : null) ||
                    value.student_data.student_learning_disability ===
                        (this.selectedNone ? "None reported" : null)
            );
        }

        this.filteredExp = [...this.experiences];

        if (
            this.selectedAfricanAmerican ||
            this.selectedAsian ||
            this.selectedHispanic ||
            this.selectedWhite
        ) {
            this.experiences = this.filteredExp.filter(
                (value: Experience) =>
                    value.student_data.student_race_ethnicity ===
                        (this.selectedAfricanAmerican
                            ? "African-American"
                            : null) ||
                    value.student_data.student_race_ethnicity ===
                        (this.selectedAsian ? "Asian" : null) ||
                    value.student_data.student_race_ethnicity ===
                        (this.selectedHispanic ? "Hispanic" : null) ||
                    value.student_data.student_race_ethnicity ===
                        (this.selectedWhite ? "White" : null)
            );
        }

        this.filteredExp = [...this.experiences];

        if (
            this.selected80to84 ||
            this.selected85to89 ||
            this.selected90to94 ||
            this.selected95to99 ||
            this.selected100
        ) {
            this.experiences = this.filteredExp.filter(
                (value: Experience) =>
                    (this.selected80to84
                        ? parseInt(value.student_data.student_attendance) >=
                              80 &&
                          parseInt(value.student_data.student_attendance) <= 84
                        : null) ||
                    (this.selected85to89
                        ? parseInt(value.student_data.student_attendance) >=
                              85 &&
                          parseInt(value.student_data.student_attendance) <= 89
                        : null) ||
                    (this.selected90to94
                        ? parseInt(value.student_data.student_attendance) >=
                              90 &&
                          parseInt(value.student_data.student_attendance) <= 94
                        : null) ||
                    (this.selected95to99
                        ? parseInt(value.student_data.student_attendance) >=
                              95 &&
                          parseInt(value.student_data.student_attendance) <= 99
                        : null) ||
                    (this.selected100
                        ? parseInt(value.student_data.student_attendance) ===
                          100
                        : null)
            );
        }

        this.filteredExp = [...this.experiences];

        if (this.selectedLow || this.selectedMid || this.selectedHigh) {
            this.experiences = this.filteredExp.filter(
                (value: Experience) =>
                    value.student_data.student_class_participation ===
                        (this.selectedLow ? "Low" : null) ||
                    value.student_data.student_class_participation ===
                        (this.selectedMid ? "Mid" : null) ||
                    value.student_data.student_class_participation ===
                        (this.selectedHigh ? "High" : null)
            );
        }

        this.filteredExp = [...this.experiences];

        if (
            this.selectedBlue ||
            this.selectedGreen ||
            this.selectedOrange ||
            this.selectedPink ||
            this.selectedPurple ||
            this.selectedYellow
        ) {
            this.experiences = this.filteredExp.filter(
                (value: Experience) =>
                    value.student_data.student_table ===
                        (this.selectedBlue ? "Blue" : null) ||
                    value.student_data.student_table ===
                        (this.selectedGreen ? "Green" : null) ||
                    value.student_data.student_table ===
                        (this.selectedOrange ? "Orange" : null) ||
                    value.student_data.student_table ===
                        (this.selectedPink ? "Pink" : null) ||
                    value.student_data.student_table ===
                        (this.selectedPurple ? "Purple" : null) ||
                    value.student_data.student_table ===
                        (this.selectedYellow ? "Yellow" : null)
            );
        }*/

        this.selectedExperiences = this.experiences.length;

        if (this.sortOldToNew) {
            this.experiences.sort(
                (a: any, b: any) =>
                    new Date(a.creation_date).getTime() -
                    new Date(b.creation_date).getTime()
            );
        }

        if (this.sortNewToOld) {
            this.experiences.sort(
                (a: any, b: any) =>
                    new Date(b.creation_date).getTime() -
                    new Date(a.creation_date).getTime()
            );
        }

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Apply' button",
            Result: "Apply all selected advanced filters",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.cdr.detectChanges();
    }

    /*sortExperiences(event: any): void {
		let userIntData: any = [];
		let time = new Date();
		userIntData = JSON.parse(
			sessionStorage.getItem("userInteractionData") || "[]"
		);
		userIntData.push({
			Action: "Clicked",
			Target: "'Sort By' filter",
			Result: "Sort experiences",
			Time: time.toLocaleString(),
		});
		sessionStorage.setItem(
			"userInteractionData",
			JSON.stringify(userIntData)
		);

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
		}
	}*/
}
