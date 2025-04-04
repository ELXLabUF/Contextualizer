import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import {
    Firestore,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    where,
} from "@angular/fire/firestore";
import { AlertDialogComponent } from "../alert-dialog/alert-dialog.component";
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { Observable } from "rxjs";

@Component({
    selector: "app-captures-page",
    templateUrl: "./captures-page.component.html",
    styleUrls: ["./captures-page.component.css"],
})
export class CapturesPageComponent implements OnInit {
    currCaptureName: string = "";
    currCapturePrompt: string = "";
    currCaptureStartDate: Date = new Date();
    currCaptureEndDate: Date = new Date();

    experiences: any = [];
    experiencesLength: Number = 0;
    students: any = {};

    noActiveCapture: boolean = false;
    isCaptureActive: boolean = true;
    showRecentCapture: boolean = false;
    toggleCaptureStories: boolean = false;

    buttonText: string = "Show";

    specificSelected: boolean | null = null;
    specificTopic!: string;
    maxTopicCharacters: number = 40;
    topicCharactersLeft: number = this.maxTopicCharacters;
    maxPromptCharacters: number = 125;
    promptCharactersLeft: number = this.maxPromptCharacters;
    capturePrompt!: string;
    dateRangeStartDate!: string;
    dateRangeEndDate!: string;

    previousCaptures: any[] = [];
    activeSortColumnPastCaptures: number = 0;
    displayedColumnsPastCaptures: string[] = [
        "No.",
        "Capture Name",
        "Prompt",
        "Start Date",
        "Due Date",
        "Count",
    ];
    columnSortStatePastCaptures: string[] = [
        "asc",
        "asc",
        "asc",
        "asc",
        "asc",
        "asc",
    ];

    futureCaptures: any[] = [];
    activeSortColumnFutureCaptures: number = 0;
    displayedColumnsFutureCaptures: string[] = [
        "No.",
        "Capture Name",
        "Prompt",
        "Start Date",
        "Due Date",
    ];
    columnSortStateFutureCaptures: string[] = [
        "asc",
        "asc",
        "asc",
        "asc",
        "asc",
    ];

    futureCaptureKey!: string;
    futureCaptureSpecificSelected: boolean | null = null;
    futureCaptureSpecificTopic: string = "";
    futureCaptureTopicCharactersLeft: number =
        this.maxTopicCharacters -
        (this.futureCaptureSpecificTopic?.length ?? 0);
    futureCapturePrompt: string = "";
    futureCapturePromptCharactersLeft: number =
        this.maxPromptCharacters - (this.futureCapturePrompt?.length ?? 0);
    futureCaptureStartDate!: string;
    futureCaptureEndDate!: string;

    constructor(
        public dialog: MatDialog,
        private angularFireStore: Firestore
    ) {}

    async ngOnInit() {
        await this.getCurrentCapture();
        await this.setSubmissionOpen();
        await this.getCaptureStories();

        //Check if current capture has ended and set the correct values in Firestore
        if (
            this.currCaptureEndDate.getTime().toString().slice(0, 9) !==
                new Date("January 02, 2020 00:00:00")
                    .getTime()
                    .toString()
                    .slice(0, 9) &&
            this.currCaptureEndDate.getTime() < new Date().getTime()
        ) {
            await this.setEndCaptureDataInFirestore();
        }

        //Check if a future capture can be started if there is no active capture
        if (
            this.currCaptureEndDate.getTime().toString().slice(0, 9) ===
            new Date("January 02, 2020 00:00:00")
                .getTime()
                .toString()
                .slice(0, 9)
        ) {
            await this.setCurrentCaptureFromFutureCaptures();
        }

        //Check if there is a capture currently active
        if (
            this.currCaptureEndDate.getTime().toString().slice(0, 9) ===
            new Date("January 02, 2020 00:00:00")
                .getTime()
                .toString()
                .slice(0, 9)
        ) {
            this.isCaptureActive = false;
        } else {
            this.isCaptureActive = true;
        }
    }

    async getCurrentCapture() {
        const classroom = sessionStorage.getItem("classroom") || "";
        const classroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(classroomDocRef);

        if (classroomDocSnap.exists()) {
            this.currCaptureName = classroomDocSnap.data()["selected_topic"];
            this.currCapturePrompt = classroomDocSnap.data()["capture_prompt"];
            const start_date = classroomDocSnap.data()["start_date"];
            const end_date = classroomDocSnap.data()["due_date"];
            this.currCaptureStartDate = new Date(
                start_date.seconds * 1000 + start_date.nanoseconds / 1000000
            );
            this.currCaptureEndDate = new Date(
                end_date.seconds * 1000 + end_date.nanoseconds / 1000000
            );
            this.isCaptureActive = true;
        } else {
            console.log("No such document!");
        }
    }

    async getCaptureStories() {
        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(currClassroomDocRef);
        this.students = {};
        let capture_id: string = "";

        //Get all Students
        if (classroomDocSnap.exists()) {
            this.students = classroomDocSnap.data()["students"] || {};
            if (classroomDocSnap.data()["capture"] !== undefined) {
                capture_id = classroomDocSnap.data()["capture"];
            } else {
                this.noActiveCapture = true;
            }
        } else {
            console.log("No such document!");
        }

        //If no active capture, experiences should be empty
        if (!this.noActiveCapture) {
            this.experiences = [];

            //Get all exp with Capture ID equal to "capture_id" and
            //Show Teacher field as true
            this.experiences = await getDocs(
                query(
                    collection(this.angularFireStore, "NewExperiences"),
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
            });

            this.experiencesLength = Object.keys(this.experiences).length;
        }
    }

    async setSubmissionOpen() {
        //Get classroom data
        const classroom = sessionStorage.getItem("classroom") || "";
        const classroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(classroomDocRef);
        let captureID: string = "";
        let selectedTopic: string = "";
        let capturePrompt: string = "";
        let startDate: Date = new Date();
        let endDate: Date = new Date();
        let future_captures: any = {};
        let previous_captures: any = {};
        let submissionOpen: boolean = false;
        let students: any = {};
        let teacher: any = {};
        const classroomApp = classroom + "App";

        if (classroomDocSnap.exists()) {
            captureID = classroomDocSnap.data()["capture"] || "";
            selectedTopic = classroomDocSnap.data()["selected_topic"] || "";
            capturePrompt = classroomDocSnap.data()["capture_prompt"] || "";
            startDate = classroomDocSnap.data()["start_date"] || new Date();
            endDate = classroomDocSnap.data()["due_date"] || new Date();
            future_captures = classroomDocSnap.data()["future_captures"] || {};
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || {};
            submissionOpen =
                classroomDocSnap.data()["submission_open"] || false;
            teacher = classroomDocSnap.data()["teacher"];
            students = classroomDocSnap.data()["students"];
        } else {
            console.log("No such document!");
        }

        //Set submission_open to true if start date has elapsed
        if (
            submissionOpen === false &&
            this.currCaptureStartDate.getTime().toString().slice(0, 9) !==
                new Date("January 01, 2020 00:00:00")
                    .getTime()
                    .toString()
                    .slice(0, 9) &&
            this.currCaptureStartDate.getTime() <= new Date().getTime()
        ) {
            //Rewrite classroom data to reflect submission open
            await setDoc(doc(this.angularFireStore, classroom), {
                id: classroom.slice(10),
                capture: captureID,
                selected_topic: selectedTopic,
                capture_prompt: capturePrompt,
                start_date: startDate,
                due_date: endDate,
                future_captures: future_captures,
                previous_captures: previous_captures,
                submission_open: true,
                students: students,
                teacher: teacher,
            });

            //Rewrite classroom data in ClassroomApp document to reflect submission open
            await setDoc(doc(this.angularFireStore, classroomApp), {
                capture: captureID,
                selected_topic: selectedTopic,
                capture_prompt: capturePrompt,
                start_date: startDate,
                due_date: endDate,
                submission_open: true,
            });
        }
    }

    async setEndCaptureDataInFirestore() {
        //Get classroom data
        const classroom = sessionStorage.getItem("classroom") || "";
        const classroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(classroomDocRef);
        let future_captures: any = {};
        let previous_captures: any = {};
        let students: any = {};
        let teacher: any = {};

        if (classroomDocSnap.exists()) {
            future_captures = classroomDocSnap.data()["future_captures"] || {};
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || {};
            const length = Object.keys(previous_captures).length || 0;
            previous_captures[classroom.slice(10) + length.toString()] = {
                name: this.currCaptureName,
                prompt: this.currCapturePrompt,
                start_date: this.currCaptureStartDate,
                due_date: this.currCaptureEndDate,
            };
            students = classroomDocSnap.data()["students"];
            teacher = classroomDocSnap.data()["teacher"];
        } else {
            console.log("No such document!");
        }

        //Rewrite classroom data to reflect end of capture
        await setDoc(doc(this.angularFireStore, classroom), {
            id: classroom.slice(10),
            selected_topic: "",
            capture_prompt: "",
            start_date: new Date("January 01, 2020 00:00:00"),
            due_date: new Date("January 02, 2020 00:00:00"),
            submission_open: false,
            future_captures: future_captures,
            previous_captures: previous_captures,
            teacher: teacher,
            students: students,
        });

        const classroomApp = classroom + "App";

        //Rewrite classroom data in ClassroomApp document to reflect end of capture
        await setDoc(doc(this.angularFireStore, classroomApp), {
            selected_topic: "",
            capture_prompt: "",
            start_date: new Date("January 01, 2020 00:00:00"),
            due_date: new Date("January 02, 2020 00:00:00"),
            //submission_open: false,
            submission_open: true,
        });

        this.currCaptureName = "";
        this.currCapturePrompt = "";
        this.currCaptureStartDate = new Date("January 01, 2020 00:00:00");
        this.currCaptureEndDate = new Date("January 02, 2020 00:00:00");
        this.isCaptureActive = false;
    }

    endCurrentCapture() {
        if (
            this.currCaptureStartDate.getTime() ===
                new Date("January 01, 2020 00:00:00").getTime() &&
            this.currCaptureEndDate.getTime() ===
                new Date("January 02, 2020 00:00:00").getTime()
        ) {
            return;
        }

        this.openConfirmDialog(
            "End Current Capture",
            "Are you sure you want to end the current capture?"
        ).subscribe(async (decision: boolean) => {
            if (decision) {
                await this.setEndCaptureDataInFirestore();
            }
        });
    }

    async setCurrentCaptureFromFutureCaptures() {
        //Get classroom data
        const classroom = sessionStorage.getItem("classroom") || "";
        const classroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(classroomDocRef);
        let captureID: string = "";
        let selectedTopic: string = "";
        let capturePrompt: string = "";
        let startDate: Date = new Date();
        let endDate: Date = new Date();
        let future_captures: any = {};
        let previous_captures: any = {};
        let length: Number = 0;
        let students: any = {};
        let teacher: any = {};
        const classroomApp = classroom + "App";

        if (classroomDocSnap.exists()) {
            captureID = classroomDocSnap.data()["capture"] || "";
            future_captures = classroomDocSnap.data()["future_captures"] || {};
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || {};
            length = Object.keys(previous_captures).length || 0;
            teacher = classroomDocSnap.data()["teacher"];
            students = classroomDocSnap.data()["students"];
        } else {
            console.log("No such document!");
        }

        //Check if future captures is not empty and set current capture
        //if future capture start date is less than current time
        if (Object.keys(future_captures).length !== 0) {
            for (const key in future_captures) {
                const date = new Date(
                    future_captures[key]["start_date"].seconds * 1000 +
                        future_captures[key]["start_date"].nanoseconds / 1000000
                );
                if (date.getTime() <= new Date().getTime()) {
                    //Set captureID only if some future capture's start date has elapsed
                    captureID = classroom.slice(10) + length.toString();
                    selectedTopic = future_captures[key]["name"];
                    capturePrompt = future_captures[key]["prompt"];
                    startDate = new Date(
                        future_captures[key]["start_date"].seconds * 1000 +
                            future_captures[key]["start_date"].nanoseconds /
                                1000000
                    );
                    endDate = new Date(
                        future_captures[key]["due_date"].seconds * 1000 +
                            future_captures[key]["due_date"].nanoseconds /
                                1000000
                    );
                    delete future_captures[key];
                    break;
                }
            }

            //Set current capture from future captures only if captureID is not empty
            if (captureID !== "") {
                //Rewrite classroom data to reflect submission open
                await setDoc(doc(this.angularFireStore, classroom), {
                    id: classroom.slice(10),
                    capture: captureID,
                    selected_topic: selectedTopic,
                    capture_prompt: capturePrompt,
                    start_date: startDate,
                    due_date: endDate,
                    future_captures: future_captures,
                    previous_captures: previous_captures,
                    submission_open: true,
                    students: students,
                    teacher: teacher,
                });

                //Rewrite classroom data in ClassroomApp document to reflect submission open
                await setDoc(doc(this.angularFireStore, classroomApp), {
                    capture: captureID,
                    selected_topic: selectedTopic,
                    capture_prompt: capturePrompt,
                    start_date: startDate,
                    due_date: endDate,
                    submission_open: true,
                });

                this.currCaptureName = selectedTopic;
                this.currCapturePrompt = capturePrompt;
                this.currCaptureStartDate = startDate;
                this.currCaptureEndDate = endDate;
                this.noActiveCapture = false;
                this.experiences = [];

                //Get all exp with Capture ID equal to captureID and
                //Show Teacher field as true
                this.experiences = await getDocs(
                    query(
                        collection(this.angularFireStore, "NewExperiences"),
                        where("capture", "==", captureID),
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
                });

                this.experiencesLength = Object.keys(this.experiences).length;
            }
        }
    }

    showCaptureStories() {
        //Make button inert if there are no stories to show for current capture
        if (this.experiencesLength === 0) {
            return;
        }

        this.toggleCaptureStories = !this.toggleCaptureStories;
        this.buttonText = this.toggleCaptureStories ? "Hide" : "Show";
    }

    async getMostRecentCapture() {
        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(currClassroomDocRef);
        this.students = {};
        let previous_captures: any = {};
        let length: Number = 0;

        if (classroomDocSnap.exists()) {
            this.students = classroomDocSnap.data()["students"] || {};
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || {};
            length = Object.keys(previous_captures).length || 0;
        } else {
            console.log("No such document!");
        }

        const key: string =
            classroom.slice(10) + (length.valueOf() - 1).toString();
        this.currCaptureName = previous_captures[key]["name"];
        this.currCapturePrompt = previous_captures[key]["prompt"];
        this.currCaptureStartDate = new Date(
            previous_captures[key]["start_date"].seconds * 1000 +
                previous_captures[key]["start_date"].nanoseconds / 1000000
        );
        this.currCaptureEndDate = new Date(
            previous_captures[key]["due_date"].seconds * 1000 +
                previous_captures[key]["due_date"].nanoseconds / 1000000
        );
        this.isCaptureActive = !this.isCaptureActive;
        this.showRecentCapture = !this.showRecentCapture;

        this.experiences = [];

        //Get all exp with Capture ID equal to the "key" and
        //Show Teacher field as true
        this.experiences = await getDocs(
            query(
                collection(this.angularFireStore, "NewExperiences"),
                where("capture", "==", key),
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
        });

        this.experiencesLength = Object.keys(this.experiences).length;
    }

    async setCaptureDataInFirestore(
        captureName: string,
        capturePrompt: string,
        startDate: Date,
        endDate: Date,
        activeCapture: boolean
    ) {
        //Get classroom data
        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(currClassroomDocRef);
        let captureID: string = "";
        let selectedTopic: string = "";
        let currCapturePrompt: string = "";
        let currCaptureStartDate: Date = new Date();
        let currCaptureEndDate: Date = new Date();
        let isSubmissionOpen: boolean = false;
        let future_captures: any = {};
        let previous_captures: any = {};
        let length: Number = 0;
        let teacher: any = {};
        let students: any = {};

        if (!activeCapture) {
            if (startDate.getTime() <= new Date().getTime()) {
                isSubmissionOpen = true;
            }
        }

        if (classroomDocSnap.exists()) {
            future_captures =
                classroomDocSnap.data()["future_captures"] || null;
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || null;
            length = Object.keys(previous_captures).length || 0;
            teacher = classroomDocSnap.data()["teacher"] || {};
            students = classroomDocSnap.data()["students"] || {};
            if (activeCapture) {
                captureID = classroomDocSnap.data()["capture"] || "";
                isSubmissionOpen =
                    classroomDocSnap.data()["submission_open"] || false;
                selectedTopic = classroomDocSnap.data()["selected_topic"] || "";
                currCapturePrompt =
                    classroomDocSnap.data()["capture_prompt"] || "";
                currCaptureStartDate =
                    classroomDocSnap.data()["start_date"] || new Date();
                currCaptureEndDate =
                    classroomDocSnap.data()["due_date"] || new Date();
            }
        } else {
            console.log("No such document!");
        }

        if (!activeCapture) {
            //Rewrite classroom data to reflect start of new capture
            await setDoc(doc(this.angularFireStore, classroom), {
                id: classroom.slice(10),
                capture: classroom.slice(10) + length.toString(),
                selected_topic: captureName,
                capture_prompt: capturePrompt,
                start_date: startDate,
                due_date: endDate,
                submission_open: isSubmissionOpen,
                future_captures: future_captures,
                previous_captures: previous_captures,
                teacher: teacher,
                students: students,
            });

            const classroomApp = classroom + "App";

            //Rewrite classroom data in ClassroomApp document
            await setDoc(doc(this.angularFireStore, classroomApp), {
                capture: classroom.slice(10) + length.toString(),
                selected_topic: captureName,
                capture_prompt: capturePrompt,
                start_date: startDate,
                due_date: endDate,
                //submission_open: isSubmissionOpen,
                submission_open: true,
            });

            this.noActiveCapture = false;
        } else {
            const futureCapture: any = {
                name: captureName,
                prompt: capturePrompt,
                start_date: startDate,
                due_date: endDate,
            };

            let captureOverlap: boolean = false;

            //Check overlap with other future captures
            for (const key in future_captures) {
                const beginDate = new Date(
                    future_captures[key]["start_date"].seconds * 1000 +
                        future_captures[key]["start_date"].nanoseconds / 1000000
                );
                const finishDate = new Date(
                    future_captures[key]["due_date"].seconds * 1000 +
                        future_captures[key]["due_date"].nanoseconds / 1000000
                );

                if (
                    (beginDate.getTime() <= endDate.getTime() &&
                        finishDate.getTime() >= endDate.getTime()) ||
                    (beginDate.getTime() <= startDate.getTime() &&
                        finishDate.getTime() >= startDate.getTime()) ||
                    (beginDate.getTime() === startDate.getTime() &&
                        finishDate.getTime() === endDate.getTime())
                ) {
                    captureOverlap = true;
                    break;
                }
            }

            //Check overlap with current active capture
            if (
                (this.currCaptureStartDate.getTime() <= endDate.getTime() &&
                    this.currCaptureEndDate.getTime() >= endDate.getTime()) ||
                (this.currCaptureStartDate.getTime() <= startDate.getTime() &&
                    this.currCaptureEndDate.getTime() >= startDate.getTime()) ||
                (this.currCaptureStartDate.getTime() === startDate.getTime() &&
                    this.currCaptureEndDate.getTime() === endDate.getTime())
            ) {
                captureOverlap = true;
            }

            if (captureOverlap) {
                this.openAlertDialog(
                    "Warning: Capture Date Overlap",
                    "The dates you have entered for this capture overlap with another capture. Please re-enter the dates."
                );
                return;
            } else {
                const futureCapturesLength =
                    Object.keys(future_captures).length || 0;
                futureCapture["key"] = futureCapturesLength.toString();
                future_captures[futureCapturesLength] = futureCapture;

                await setDoc(doc(this.angularFireStore, classroom), {
                    id: classroom.slice(10),
                    capture: captureID,
                    selected_topic: selectedTopic,
                    capture_prompt: currCapturePrompt,
                    start_date: currCaptureStartDate,
                    due_date: currCaptureEndDate,
                    submission_open: isSubmissionOpen,
                    future_captures: future_captures,
                    previous_captures: previous_captures,
                    teacher: teacher,
                    students: students,
                });
            }
        }
    }

    removeTimeZoneOffset(inputDate: string, addOffset: boolean) {
        const date = new Date(inputDate);
        const tzOffset = date.getTimezoneOffset() * 60000;
        let offsetDate = new Date();
        if (addOffset) {
            offsetDate = new Date(date.getTime() + tzOffset);
        } else {
            offsetDate = new Date(date.getTime() - tzOffset);
        }
        return offsetDate.toLocaleDateString();
    }

    async startNewCapture() {
        if (
            this.specificSelected === null ||
            this.specificSelected === undefined ||
            (this.specificSelected === true &&
                (this.specificTopic === null ||
                    this.specificTopic === undefined)) ||
            this.dateRangeStartDate === null ||
            this.dateRangeStartDate === undefined ||
            this.dateRangeStartDate === "" ||
            this.dateRangeEndDate === null ||
            this.dateRangeEndDate === undefined ||
            this.dateRangeEndDate === ""
        ) {
            this.openAlertDialog(
                "Warning: Incomplete Data",
                "Please enter the appropriate data in all the fields of the form before continuing."
            );
            return;
        }

        if (
            this.dateRangeEndDate &&
            new Date(this.dateRangeEndDate).getTime() < new Date().getTime()
        ) {
            this.openAlertDialog(
                "Warning: End Date Error",
                "The end date entered has already passed. Please select a valid date."
            );
            return;
        }

        this.dateRangeStartDate = this.removeTimeZoneOffset(
            this.dateRangeStartDate,
            true
        );
        this.dateRangeEndDate = this.removeTimeZoneOffset(
            this.dateRangeEndDate,
            true
        );

        if (!this.isCaptureActive) {
            this.currCaptureName = this.specificSelected
                ? this.specificTopic
                : "General";
            this.currCapturePrompt = this.capturePrompt;
            this.currCaptureStartDate =
                new Date(this.dateRangeStartDate) || new Date();
            this.currCaptureEndDate =
                new Date(this.dateRangeEndDate) || new Date();

            await this.setCaptureDataInFirestore(
                this.currCaptureName,
                this.currCapturePrompt,
                this.currCaptureStartDate,
                this.currCaptureEndDate,
                this.isCaptureActive
            );

            this.toggleCaptureStories = false;
            this.buttonText = "Show";

            await this.getCaptureStories();
        } else {
            const futureCaptureName = this.specificSelected
                ? this.specificTopic
                : "General";
            const futureCapturePrompt = this.capturePrompt;
            const futureCaptureStartDate =
                new Date(this.dateRangeStartDate) || new Date();
            const futureCaptureEndDate =
                new Date(this.dateRangeEndDate) || new Date();

            await this.setCaptureDataInFirestore(
                futureCaptureName,
                futureCapturePrompt,
                futureCaptureStartDate,
                futureCaptureEndDate,
                this.isCaptureActive
            );
        }

        this.specificSelected = null;
        this.specificTopic = "";
        this.capturePrompt = "";
        this.dateRangeStartDate = "";
        this.dateRangeEndDate = "";
        this.isCaptureActive = true;
        this.showRecentCapture = false;
    }

    updateTopicCharacterCounter() {
        this.topicCharactersLeft =
            this.maxTopicCharacters - (this.specificTopic?.length || 0);
    }

    updatePromptCharacterCounter() {
        this.promptCharactersLeft =
            this.maxPromptCharacters - (this.capturePrompt?.length || 0);
    }

    async getPastCaptures() {
        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(currClassroomDocRef);
        let previous_captures: any = {};

        if (classroomDocSnap.exists()) {
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || {};
        } else {
            console.log("No such document!");
        }

        this.previousCaptures = [];

        for (const key in previous_captures) {
            const numbersOnly = key.replace(/[^0-9]/g, ""); // Remove non-numeric characters
            const trailingNumbersMatch = key.match(/(\d+)$/); // Match digits at the end of the string
            let num = trailingNumbersMatch ? trailingNumbersMatch[0] : "1"; // Return the matched digits or an empty string if no match
            const idx = Number(num);
            const startDate = new Date(
                previous_captures[key]["start_date"].seconds * 1000 +
                    previous_captures[key]["start_date"].nanoseconds / 1000000
            );
            const endDate = new Date(
                previous_captures[key]["due_date"].seconds * 1000 +
                    previous_captures[key]["due_date"].nanoseconds / 1000000
            );

            let captureExperiences = await getDocs(
                query(
                    collection(this.angularFireStore, "NewExperiences"),
                    where("capture", "==", key),
                    where("show_to_teacher", "==", true)
                )
            ).then((qDoc: any) => qDoc.docs.map((doc: any) => doc.data()));

            const expLength: Number = captureExperiences.length || 0;

            this.previousCaptures[idx] = {
                id: idx,
                capture_name: previous_captures[key]["name"],
                prompt: previous_captures[key]["prompt"],
                start_date: startDate,
                due_date: endDate,
                count: expLength,
            };
        }

        this.activeSortColumnPastCaptures = 0;
        this.columnSortStatePastCaptures[0] =
            this.columnSortStatePastCaptures[0] === "desc" ? "asc" : "desc";
        this.sortPastCapturesTable("No.");
    }

    sortPastCapturesTable(column: string) {
        if (column === "No.") {
            this.columnSortStatePastCaptures[0] =
                this.columnSortStatePastCaptures[0] === "desc" ? "asc" : "desc";
            this.activeSortColumnPastCaptures = 0;
        } else if (column === "Capture Name") {
            this.columnSortStatePastCaptures[1] =
                this.columnSortStatePastCaptures[1] === "desc" ? "asc" : "desc";
            this.activeSortColumnPastCaptures = 1;
        } else if (column === "Prompt") {
            this.columnSortStatePastCaptures[2] =
                this.columnSortStatePastCaptures[2] === "desc" ? "asc" : "desc";
            this.activeSortColumnPastCaptures = 2;
        } else if (column === "Start Date") {
            this.columnSortStatePastCaptures[3] =
                this.columnSortStatePastCaptures[3] === "desc" ? "asc" : "desc";
            this.activeSortColumnPastCaptures = 3;
        } else if (column === "Due Date") {
            this.columnSortStatePastCaptures[4] =
                this.columnSortStatePastCaptures[4] === "desc" ? "asc" : "desc";
            this.activeSortColumnPastCaptures = 4;
        } else if (column === "Count") {
            this.columnSortStatePastCaptures[5] =
                this.columnSortStatePastCaptures[5] === "desc" ? "asc" : "desc";
            this.activeSortColumnPastCaptures = 5;
        }

        if (column === "No.") {
            if (this.columnSortStatePastCaptures[0] === "asc") {
                this.previousCaptures.sort((a: any, b: any) => a.id - b.id);
            } else if (this.columnSortStatePastCaptures[0] === "desc") {
                this.previousCaptures.sort((a: any, b: any) => b.id - a.id);
            }
        } else if (column === "Capture Name") {
            if (this.columnSortStatePastCaptures[1] === "asc") {
                this.previousCaptures.sort((a: any, b: any) =>
                    a.capture_name > b.capture_name ? 1 : -1
                );
            } else if (this.columnSortStatePastCaptures[1] === "desc") {
                this.previousCaptures.sort((a: any, b: any) =>
                    b.capture_name > a.capture_name ? 1 : -1
                );
            }
        } else if (column === "Prompt") {
            if (this.columnSortStatePastCaptures[2] === "asc") {
                this.previousCaptures.sort((a: any, b: any) =>
                    a.prompt > b.prompt ? 1 : -1
                );
            } else if (this.columnSortStatePastCaptures[2] === "desc") {
                this.previousCaptures.sort((a: any, b: any) =>
                    b.prompt > a.prompt ? 1 : -1
                );
            }
        } else if (column === "Start Date") {
            if (this.columnSortStatePastCaptures[3] === "asc") {
                this.previousCaptures.sort(
                    (a: any, b: any) =>
                        new Date(a.start_date).getTime() -
                        new Date(b.start_date).getTime()
                );
            } else if (this.columnSortStatePastCaptures[3] === "desc") {
                this.previousCaptures.sort(
                    (a: any, b: any) =>
                        new Date(b.start_date).getTime() -
                        new Date(a.start_date).getTime()
                );
            }
        } else if (column === "Due Date") {
            if (this.columnSortStatePastCaptures[4] === "asc") {
                this.previousCaptures.sort(
                    (a: any, b: any) =>
                        new Date(a.due_date).getTime() -
                        new Date(b.due_date).getTime()
                );
            } else if (this.columnSortStatePastCaptures[4] === "desc") {
                this.previousCaptures.sort(
                    (a: any, b: any) =>
                        new Date(b.due_date).getTime() -
                        new Date(a.due_date).getTime()
                );
            }
        } else if (column === "Count") {
            if (this.columnSortStatePastCaptures[5] === "asc") {
                this.previousCaptures.sort(
                    (a: any, b: any) => a.count - b.count
                );
            } else if (this.columnSortStatePastCaptures[5] === "desc") {
                this.previousCaptures.sort(
                    (a: any, b: any) => b.count - a.count
                );
            }
        }
    }

    async getFutureCaptures() {
        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(currClassroomDocRef);
        let future_captures: any = {};

        if (classroomDocSnap.exists()) {
            future_captures = classroomDocSnap.data()["future_captures"] || {};
        } else {
            console.log("No such document!");
        }

        this.futureCaptures = [];

        for (const key in future_captures) {
            const numbersOnly = key.replace(/[^0-9]/g, ""); // Remove non-numeric characters
            const trailingNumbersMatch = key.match(/(\d+)$/); // Match digits at the end of the string
            let num = trailingNumbersMatch ? trailingNumbersMatch[0] : "1"; // Return the matched digits or an empty string if no match
            const idx = Number(num);
            const startDate = new Date(
                future_captures[key]["start_date"].seconds * 1000 +
                    future_captures[key]["start_date"].nanoseconds / 1000000
            );
            const endDate = new Date(
                future_captures[key]["due_date"].seconds * 1000 +
                    future_captures[key]["due_date"].nanoseconds / 1000000
            );

            this.futureCaptures[idx] = {
                id: idx,
                key: key.toString(),
                capture_name: future_captures[key]["name"],
                prompt: future_captures[key]["prompt"],
                start_date: startDate,
                due_date: endDate,
            };
        }

        this.activeSortColumnFutureCaptures = 0;
        this.columnSortStateFutureCaptures[0] =
            this.columnSortStateFutureCaptures[0] === "desc" ? "asc" : "desc";
        this.sortFutureCapturesTable("No.");
    }

    sortFutureCapturesTable(column: string) {
        if (column === "No.") {
            this.columnSortStateFutureCaptures[0] =
                this.columnSortStateFutureCaptures[0] === "desc"
                    ? "asc"
                    : "desc";
            this.activeSortColumnFutureCaptures = 0;
        } else if (column === "Capture Name") {
            this.columnSortStateFutureCaptures[1] =
                this.columnSortStateFutureCaptures[1] === "desc"
                    ? "asc"
                    : "desc";
            this.activeSortColumnFutureCaptures = 1;
        } else if (column === "Prompt") {
            this.columnSortStateFutureCaptures[2] =
                this.columnSortStateFutureCaptures[2] === "desc"
                    ? "asc"
                    : "desc";
            this.activeSortColumnFutureCaptures = 2;
        } else if (column === "Start Date") {
            this.columnSortStateFutureCaptures[3] =
                this.columnSortStateFutureCaptures[3] === "desc"
                    ? "asc"
                    : "desc";
            this.activeSortColumnFutureCaptures = 3;
        } else if (column === "Due Date") {
            this.columnSortStateFutureCaptures[4] =
                this.columnSortStateFutureCaptures[4] === "desc"
                    ? "asc"
                    : "desc";
            this.activeSortColumnFutureCaptures = 4;
        }

        if (column === "No.") {
            if (this.columnSortStateFutureCaptures[0] === "asc") {
                this.futureCaptures.sort((a: any, b: any) => a.id - b.id);
            } else if (this.columnSortStateFutureCaptures[0] === "desc") {
                this.futureCaptures.sort((a: any, b: any) => b.id - a.id);
            }
        } else if (column === "Capture Name") {
            if (this.columnSortStateFutureCaptures[1] === "asc") {
                this.futureCaptures.sort((a: any, b: any) =>
                    a.capture_name > b.capture_name ? 1 : -1
                );
            } else if (this.columnSortStateFutureCaptures[1] === "desc") {
                this.futureCaptures.sort((a: any, b: any) =>
                    b.capture_name > a.capture_name ? 1 : -1
                );
            }
        } else if (column === "Prompt") {
            if (this.columnSortStateFutureCaptures[2] === "asc") {
                this.futureCaptures.sort((a: any, b: any) =>
                    a.prompt > b.prompt ? 1 : -1
                );
            } else if (this.columnSortStateFutureCaptures[2] === "desc") {
                this.futureCaptures.sort((a: any, b: any) =>
                    b.prompt > a.prompt ? 1 : -1
                );
            }
        } else if (column === "Start Date") {
            if (this.columnSortStateFutureCaptures[3] === "asc") {
                this.futureCaptures.sort(
                    (a: any, b: any) =>
                        new Date(a.start_date).getTime() -
                        new Date(b.start_date).getTime()
                );
            } else if (this.columnSortStateFutureCaptures[3] === "desc") {
                this.futureCaptures.sort(
                    (a: any, b: any) =>
                        new Date(b.start_date).getTime() -
                        new Date(a.start_date).getTime()
                );
            }
        } else if (column === "Due Date") {
            if (this.columnSortStateFutureCaptures[4] === "asc") {
                this.futureCaptures.sort(
                    (a: any, b: any) =>
                        new Date(a.due_date).getTime() -
                        new Date(b.due_date).getTime()
                );
            } else if (this.columnSortStateFutureCaptures[4] === "desc") {
                this.futureCaptures.sort(
                    (a: any, b: any) =>
                        new Date(b.due_date).getTime() -
                        new Date(a.due_date).getTime()
                );
            }
        }
    }

    convertDateFormat(dateString: string): string {
        const [month, day, year] = dateString.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    editFutureCapture(capture: any) {
        this.futureCaptureKey = capture["key"];
        this.futureCaptureSpecificSelected =
            capture["capture_name"] === "General" ? false : true;
        this.futureCaptureSpecificTopic =
            capture["capture_name"] !== "General"
                ? capture["capture_name"]
                : "";
        this.futureCapturePrompt = capture["prompt"];
        this.futureCaptureStartDate = this.convertDateFormat(
            capture["start_date"].toLocaleDateString()
        );
        this.futureCaptureEndDate = this.convertDateFormat(
            capture["due_date"].toLocaleDateString()
        );

        this.updateFutureCaptureTopicCharacterCounter();
        this.updateFutureCapturePromptCharacterCounter();
    }

    updateFutureCaptureTopicCharacterCounter() {
        this.futureCaptureTopicCharactersLeft =
            this.maxTopicCharacters -
            (this.futureCaptureSpecificTopic?.length ?? 0);
    }

    updateFutureCapturePromptCharacterCounter() {
        this.futureCapturePromptCharactersLeft =
            this.maxPromptCharacters - (this.futureCapturePrompt?.length ?? 0);
    }

    async saveFutureCaptureEdit() {
        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(currClassroomDocRef);
        let captureID: string = "";
        let openCapture: boolean = false;
        let selectedTopic: string = "";
        let capturePrompt: string = "";
        let startDate: Date = new Date();
        let endDate: Date = new Date();
        let future_captures: any = {};
        let previous_captures: any = {};
        let submissionOpen: boolean = false;
        let students: any = {};
        let teacher: any = {};

        if (classroomDocSnap.exists()) {
            if (
                classroomDocSnap.data()["capture"] &&
                classroomDocSnap.data()["capture"] !== undefined &&
                classroomDocSnap.data()["capture"] !== null
            ) {
                openCapture = true;
            }

            if (openCapture) {
                captureID = classroomDocSnap.data()["capture"];
            }
            selectedTopic = classroomDocSnap.data()["selected_topic"] || "";
            capturePrompt = classroomDocSnap.data()["capture_prompt"] || "";
            startDate = classroomDocSnap.data()["start_date"] || new Date();
            endDate = classroomDocSnap.data()["due_date"] || new Date();
            future_captures = classroomDocSnap.data()["future_captures"] || {};
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || {};
            submissionOpen =
                classroomDocSnap.data()["submission_open"] || false;
            teacher = classroomDocSnap.data()["teacher"];
            students = classroomDocSnap.data()["students"];
        } else {
            console.log("No such document!");
        }

        for (const key in future_captures) {
            if (this.futureCaptureKey === key.toString()) {
                future_captures[key]["name"] = this.futureCaptureSpecificTopic;
                future_captures[key]["prompt"] = this.futureCapturePrompt;
                future_captures[key]["start_date"] = new Date(
                    this.removeTimeZoneOffset(this.futureCaptureStartDate, true)
                );
                future_captures[key]["due_date"] = new Date(
                    this.removeTimeZoneOffset(this.futureCaptureEndDate, true)
                );
            }
        }

        if (openCapture) {
            await setDoc(doc(this.angularFireStore, classroom), {
                id: classroom.slice(10),
                capture: captureID,
                selected_topic: selectedTopic,
                capture_prompt: capturePrompt,
                start_date: startDate,
                due_date: endDate,
                future_captures: future_captures,
                previous_captures: previous_captures,
                submission_open: submissionOpen,
                students: students,
                teacher: teacher,
            });
        } else {
            await setDoc(doc(this.angularFireStore, classroom), {
                id: classroom.slice(10),
                selected_topic: selectedTopic,
                capture_prompt: capturePrompt,
                start_date: startDate,
                due_date: endDate,
                future_captures: future_captures,
                previous_captures: previous_captures,
                submission_open: submissionOpen,
                students: students,
                teacher: teacher,
            });
        }

        this.futureCaptureKey = "";
        this.futureCaptureSpecificSelected = null;
        this.futureCaptureSpecificTopic = "";
        this.futureCapturePrompt = "";
        this.futureCaptureStartDate = "";
        this.futureCaptureEndDate = "";

        await this.getFutureCaptures();
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
            data: { title: title, message: message },
        });

        return dialogRef.afterClosed();
    }
}
