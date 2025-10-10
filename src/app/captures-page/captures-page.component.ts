import { Component, OnDestroy, OnInit } from "@angular/core";
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
import { ConfirmationDialogComponent } from "../confirmation-dialog/confirmation-dialog.component";
import { AlertDialogComponent } from "../alert-dialog/alert-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";

declare var bootstrap: any;

@Component({
    selector: "app-captures-page",
    templateUrl: "./captures-page.component.html",
    styleUrls: ["./captures-page.component.css"],
})
export class CapturesPageComponent implements OnInit, OnDestroy {
    currCaptureName: string = "";
    currCapturePrompt: string = "";
    currCaptureStartDate: Date = new Date();
    currCaptureEndDate: Date = new Date();

    experiences: any = [];
    experiencesLength: number = 0;
    students: any = {};

    noActiveCapture: boolean = false;
    isCaptureActive: boolean = true;
    showRecentCapture: boolean = false;
    toggleCaptureStories: boolean = false;

    buttonText: string = "Show";

    //specificSelected: boolean | null = null;
    specificTopic!: string;
    maxTopicCharacters: number = 40;
    topicCharactersLeft: number = this.maxTopicCharacters;
    maxPromptCharacters: number = 125;
    promptCharactersLeft: number = this.maxPromptCharacters;
    capturePrompt!: string;
    dateRangeStartDate!: string;
    dateRangeEndDate!: string;

    //allCaptures: any = [];
    //selectedCapture: string = "";
    //selectedCaptureLessonPlans: any = {};
    //activeSortColumnLessonPlans: number = 0;
    //displayedColumnsLessonPlans: string[] = [
    //    "No.",
    //    "Science Topic",
    //    "Creation Date",
    //];
    //columnSortStateLessonPlans: string[] = ["asc", "asc", "asc"];

    //lessonPlanData: any = null;
    /*fields = [
        {
            name: "Grade",
            key: "Grade",
        },
        {
            name: "Subject",
            key: "Subject",
        },
        {
            name: "Duration",
            key: "Duration",
        },
        {
            name: "Lesson Standards & Objectives",
            key: "Lesson Standards & Objectives",
        },
        {
            name: "Materials",
            key: "Materials",
        },
        {
            name: "Warm-Up",
            key: "Warm-Up",
        },
        {
            name: "Teacher-Led Instruction",
            key: "Teacher-Led Instruction",
        },
        {
            name: "Student-Led Learning",
            key: "Student-Led Learning",
        },
        {
            name: "Wrap-Up Closure",
            key: "Wrap-Up Closure",
        },
    ];*/

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
    //futureCaptureSpecificSelected: boolean | null = null;
    futureCaptureSpecificTopic: string = "";
    futureCaptureTopicCharactersLeft: number =
        this.maxTopicCharacters -
        (this.futureCaptureSpecificTopic?.length ?? 0);
    futureCapturePrompt: string = "";
    futureCapturePromptCharactersLeft: number =
        this.maxPromptCharacters - (this.futureCapturePrompt?.length ?? 0);
    futureCaptureStartDate!: string;
    futureCaptureEndDate!: string;

    timeStart!: Date;
    timeEnd!: Date;

    constructor(
        public dialog: MatDialog,
        private angularFireStore: Firestore
    ) {}

    async ngOnInit() {
        this.timeStart = new Date();
        let userIntData: any = [];
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Visited",
            Target: "'Current Capture' page",
            Result: "",
            Time: this.timeStart.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        sessionStorage.setItem("timeStart", this.timeStart.toString());

        await this.getCurrentCapture();
        await this.setSubmissionOpen();
        await this.getCaptureStories();
        await this.getFutureCaptures();

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
            Target: "'Current Capture' page",
            Result: "",
            Time: this.timeEnd.toLocaleString(),
        });
        userIntData.push({
            Action: "Time spent",
            Target: "'Current Capture' page",
            Result: "",
            Time: duration + " seconds",
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
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

            // Check if the loaded data indicates an active capture
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
        let captureID: string = "";
        let future_captures: any = {};
        let previous_captures: any = {};
        let students: any = {};
        let teacher: any = {};

        if (classroomDocSnap.exists()) {
            captureID = classroomDocSnap.data()["capture"] || "";
            future_captures = classroomDocSnap.data()["future_captures"] || {};
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || {};
            //const length = Object.keys(previous_captures).length || 0;

            if (
                this.currCapturePrompt === undefined ||
                this.currCapturePrompt === null
            ) {
                this.currCapturePrompt = "";
            }

            //previous_captures[classroom.slice(10) + length.toString()] = {
            previous_captures[captureID] = {
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

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'End Capture' button",
            Result: "Open a dialog box to end the current active capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.openConfirmDialog(
            "End Current Capture",
            "Are you sure you want to end the current capture?"
        ).subscribe(async (decision: boolean) => {
            if (decision) {
                let userIntData: any = [];
                let time = new Date();
                userIntData = JSON.parse(
                    sessionStorage.getItem("userInteractionData") || "[]"
                );
                userIntData.push({
                    Action: "Clicked",
                    Target: "'Confirm' button",
                    Result: "End the current active capture",
                    Time: time.toLocaleString(),
                });
                sessionStorage.setItem(
                    "userInteractionData",
                    JSON.stringify(userIntData)
                );

                await this.setEndCaptureDataInFirestore();

                // After ending, check if a future capture can become active
                await this.setCurrentCaptureFromFutureCaptures();

                // Refresh all component data to reflect changes
                await this.getCurrentCapture();
                await this.getCaptureStories();
                await this.getFutureCaptures();
            } else {
                let userIntData: any = [];
                let time = new Date();
                userIntData = JSON.parse(
                    sessionStorage.getItem("userInteractionData") || "[]"
                );
                userIntData.push({
                    Action: "Clicked",
                    Target: "'Cancel' button",
                    Result: "Deny the end of the current active capture",
                    Time: time.toLocaleString(),
                });
                sessionStorage.setItem(
                    "userInteractionData",
                    JSON.stringify(userIntData)
                );
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
        let length: number = 0;
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
                    //captureID = classroom.slice(10) + length.toString();
                    captureID = future_captures[key]["capture"];
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

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target:
                "'" +
                this.buttonText +
                " Stories (" +
                this.experiencesLength.toString() +
                ")' button",
            Result: this.buttonText + " all the stories for the capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.toggleCaptureStories = !this.toggleCaptureStories;
        this.buttonText = this.toggleCaptureStories ? "Hide" : "Show";
    }

    async getMostRecentCapture() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'View Most Recent Capture' button",
            Result: "View the most recently concluded capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(currClassroomDocRef);
        this.students = {};
        let previous_captures: any = {};
        let length: number = 0;

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
    ): Promise<boolean> {
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
        let futureCapLength: number = 0;
        let previous_captures: any = {};
        let prevCapLength: number = 0;
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
            futureCapLength = Object.keys(future_captures).length || 0;
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || null;
            prevCapLength = Object.keys(previous_captures).length || 0;
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

        if (capturePrompt === undefined || capturePrompt === null) {
            capturePrompt = "";
        }

        if (captureID === "") {
            captureID =
                classroom.slice(10) +
                (prevCapLength + futureCapLength).toString();
        }

        if (!activeCapture) {
            //Rewrite classroom data to reflect start of new capture
            await setDoc(doc(this.angularFireStore, classroom), {
                id: classroom.slice(10),
                //capture: classroom.slice(10) + length.toString(),
                capture: captureID,
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
                //capture: classroom.slice(10) + length.toString(),
                capture: captureID,
                selected_topic: captureName,
                capture_prompt: capturePrompt,
                start_date: startDate,
                due_date: endDate,
                //submission_open: isSubmissionOpen,
                submission_open: true,
            });

            this.noActiveCapture = false;
            return true;
        } else {
            const futureCaptureID =
                classroom.slice(10) +
                (prevCapLength + futureCapLength + 1).toString();
            const futureCapture: any = {
                name: captureName,
                prompt: capturePrompt,
                start_date: startDate,
                due_date: endDate,
                capture: futureCaptureID,
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
                return false;
            } else {
                //const futureCapturesLength =
                //    Object.keys(future_captures).length || 0;
                //future_captures[futureCapturesLength] = futureCapture;
                let maxKey: number = 0;

                for (const key in future_captures) {
                    maxKey = maxKey < Number(key) ? Number(key) : maxKey;
                }

                future_captures[maxKey + 1] = futureCapture;

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

                return true;
            }
        }
    }

    onStartNewCaptureClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Start New Capture' button",
            Result: "Open a dialog box to start a new capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onStartNewCaptureXClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'X' button on the 'Start New Capture' dialog box",
            Result: "Close the 'Start New Capture' dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    /*onCaptureTypeClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target:
                "'" +
                (this.specificSelected ? "Specific" : "General") +
                "'radio button",
            Result:
                "Select '" +
                (this.specificSelected ? "Specific" : "General") +
                "' as the capture type",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*onSpecificCaptureInfoHover() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Hovered",
            Target: "Specific capture info button",
            Result: "Pop-up specific capture information",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*onGeneralCaptureInfoHover() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Hovered",
            Target: "General capture info button",
            Result: "Pop-up general capture information",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    onSpecificCaptureTopicClick() {
        //if (this.specificSelected) {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Topic Name' input",
            Result: "Enter topic name for the capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        //}
    }

    updateTopicCharacterCounter() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Typed",
            Target: "'Topic Name' input",
            Result: this.specificTopic,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.topicCharactersLeft =
            this.maxTopicCharacters - (this.specificTopic?.length || 0);
    }

    onPromptClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Prompt' input",
            Result: "Enter prompt for the capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    updatePromptCharacterCounter() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Typed",
            Target: "'Prompt' input",
            Result: this.capturePrompt,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.promptCharactersLeft =
            this.maxPromptCharacters - (this.capturePrompt?.length || 0);
    }

    onCaptureDateClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Date' input",
            Result: "Enter dates for the capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onCaptureStartDateInput() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Typed",
            Target: "'Date' input's start date",
            Result: this.dateRangeStartDate,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onCaptureEndDateInput() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Typed",
            Target: "'Date' input's end date",
            Result: this.dateRangeEndDate,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onStartNewCaptureCloseClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Close' button on the 'Start New Capture' dialog box",
            Result: "Close the 'Start New Capture' dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
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
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Confirm' button",
            Result: "Start a new capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        if (
            !this.specificTopic ||
            !this.dateRangeStartDate ||
            !this.dateRangeEndDate
        ) {
            this.openAlertDialog(
                "Warning: Incomplete Data",
                "Please enter a topic and select both a start and end date for the capture."
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

        const success = await this.setCaptureDataInFirestore(
            this.specificTopic,
            this.capturePrompt,
            new Date(this.dateRangeStartDate),
            new Date(this.dateRangeEndDate),
            this.isCaptureActive
        );

        // Only reset and close if the data was successfully saved
        if (success) {
            // Refresh component data from Firestore
            await this.getCurrentCapture();
            await this.getCaptureStories();
            await this.getFutureCaptures();

            this.specificTopic = "";
            this.capturePrompt = "";
            this.dateRangeStartDate = "";
            this.dateRangeEndDate = "";
            this.showRecentCapture = false;

            // Manually close the modal on success
            const modalElement = document.getElementById("newCaptureModal");
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal?.hide();
            }
        }
    }

    /*async getAllCaptures() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Lesson Plans Library' button",
            Result: "Get the list of all the lessons plans",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.allCaptures = [];
        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.angularFireStore, classroom);
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

            this.allCaptures.push(captureObject);
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
            this.allCaptures.push(currCapture);
        }

        //Get all the future captures and store them
        for (const key of Object.keys(future_captures)) {
            const idx = this.allCaptures.length;
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

            this.allCaptures.push(captureObject);
        }
    }*/

    /*onSelectCaptureDropdownClick() {
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
    }*/

    /*async selectCapture() {
        let selectedCaptureName: string = "";
        let captureStartDate: string = "";
        let captureDueDate: string = "";

        for (const capture of this.allCaptures) {
            if (capture["capture"] === this.selectedCapture) {
                selectedCaptureName = capture["name"];
                captureStartDate = capture["start_date"];
                captureDueDate = capture["due_date"];
                break;
            }
        }

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
            Result: "Set the capture for which to view the lesson plans",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        await this.getLessonPlans();
    }*/

    /*async getLessonPlans() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Lesson Plans Library' button",
            Result: "View the list of all the lesson plans associated with the current capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.selectedCaptureLessonPlans = await getDocs(
            query(
                collection(this.angularFireStore, "Documents"),
                where("capture", "==", this.selectedCapture)
            )
        ).then((qDoc: any) => qDoc.docs.map((doc: any) => doc.data()));

        let index: number = 0;

        this.selectedCaptureLessonPlans.forEach((lessonPlan: any) => {
            let date = lessonPlan["createdAt"];
            lessonPlan["createdAt"] = new Date(
                date.seconds * 1000 + date.nanoseconds / 1000000
            ).toLocaleDateString();
            lessonPlan["index"] = index++;
        });

        this.activeSortColumnLessonPlans = 0;
        this.columnSortStateLessonPlans[0] =
            this.columnSortStateLessonPlans[0] === "desc" ? "asc" : "desc";
        this.sortLessonPlansTable("No.");
    }*/

    /*sortLessonPlansTable(column: string) {
        if (column === "No.") {
            this.columnSortStateLessonPlans[0] =
                this.columnSortStateLessonPlans[0] === "desc" ? "asc" : "desc";
            this.activeSortColumnLessonPlans = 0;
        } else if (column === "Science Topic") {
            this.columnSortStateLessonPlans[1] =
                this.columnSortStateLessonPlans[1] === "desc" ? "asc" : "desc";
            this.activeSortColumnLessonPlans = 1;
        } else if (column === "Creation Date") {
            this.columnSortStateLessonPlans[2] =
                this.columnSortStateLessonPlans[2] === "desc" ? "asc" : "desc";
            this.activeSortColumnLessonPlans = 2;
        }

        if (column === "No.") {
            if (this.columnSortStateLessonPlans[0] === "asc") {
                this.selectedCaptureLessonPlans.sort(
                    (a: any, b: any) => a.index - b.index
                );
            } else if (this.columnSortStateLessonPlans[0] === "desc") {
                this.selectedCaptureLessonPlans.sort(
                    (a: any, b: any) => b.index - a.index
                );
            }
        } else if (column === "Science Topic") {
            if (this.columnSortStateLessonPlans[1] === "asc") {
                this.selectedCaptureLessonPlans.sort((a: any, b: any) =>
                    a.mainTopic > b.mainTopic ? 1 : -1
                );
            } else if (this.columnSortStateLessonPlans[1] === "desc") {
                this.selectedCaptureLessonPlans.sort((a: any, b: any) =>
                    b.mainTopic > a.mainTopic ? 1 : -1
                );
            }
        } else if (column === "Creation Date") {
            if (this.columnSortStateLessonPlans[2] === "asc") {
                this.selectedCaptureLessonPlans.sort(
                    (a: any, b: any) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                );
            } else if (this.columnSortStateLessonPlans[2] === "desc") {
                this.selectedCaptureLessonPlans.sort(
                    (a: any, b: any) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                );
            }
        }

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'" + column + "'column in the 'Lesson Plans' table",
            Result:
                "Sort the lesson plans by '" +
                column +
                "' in " +
                this.columnSortStateLessonPlans[
                    this.activeSortColumnLessonPlans
                ] +
                "ending order",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*onLessonPlansXClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'X' button on the 'Lesson Plans' dialog box",
            Result: "Close the 'Lesson Plans' dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*onLessonPlansCloseClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Close' button on the 'Lesson Plans' dialog box",
            Result: "Close the 'Lesson Plans' dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*viewLessonPlan(lessonPlan: any) {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target:
                "File icon button for the lesson plan with topic name '" +
                lessonPlan["mainTopic"] +
                "'",
            Result: "Open a dialog box to view the lesson plan",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.lessonPlanData = lessonPlan;
        const fieldOrder = (this.lessonPlanData.fieldOrder as string[]) || [];
        this.updateFieldOrder(fieldOrder);
    }*/

    /*private updateFieldOrder(fieldOrder: string[]) {
        if (fieldOrder.length > 0) {
            // Map the order to existing fields
            this.fields = fieldOrder.map((key) => ({
                name: this.getFieldName(key),
                key: key,
            }));
        }
    }*/

    /*private getFieldName(fieldKey: string): string {
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
            case "Wrap-Up Closure":
                return "Wrap-Up Closure";
            default:
                return "Unknown";
        }
    }*/

    // Function to get additional container keys
    /*getAdditionalContainerKeysForField(field: any): string[] {
        const defaultKeys = ["content", "integrated_experiences", "title"];
        const fieldData = this.lessonPlanData[field.key] || {};

        return Object.keys(fieldData)
            .filter((key) => !defaultKeys.includes(key))
            .sort((a, b) => {
                // Fetch the createdAt timestamps for each container
                const dateA = fieldData[a]?.createdAt || 0;
                const dateB = fieldData[b]?.createdAt || 0;

                // Sort in ascending order based on the timestamps
                return dateA - dateB;
            });
    }*/

    /*onViewLessonPlanXClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'X' button on the 'View Lesson Plan' dialog box",
            Result: "Close the 'View Lesson Plan' dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    /*onViewLessonPlanCloseClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Close' button on the 'View Lesson Plan' dialog box",
            Result: "Close the 'View Lesson Plan' dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    async getPastCaptures() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Past Captures Library' button",
            Result: "View the list of all the concluded captures",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

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
        let index: number = 0;

        for (const key in previous_captures) {
            //const numbersOnly = key.replace(/[^0-9]/g, ""); // Remove non-numeric characters
            //const trailingNumbersMatch = key.match(/(\d+)$/); // Match digits at the end of the string
            //let num = trailingNumbersMatch ? trailingNumbersMatch[0] : "1"; // Return the matched digits or an empty string if no match
            //const idx = Number(num);

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

            const expLength: number = captureExperiences.length || 0;

            this.previousCaptures[index] = {
                id: index++,
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

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'" + column + "'column in the 'Past Captures' table",
            Result:
                "Sort the past captures by '" +
                column +
                "' in " +
                this.columnSortStatePastCaptures[
                    this.activeSortColumnPastCaptures
                ] +
                "ending order",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onPastCapturesXClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'X' button on the 'Past Captures' dialog box",
            Result: "Close the 'Past Captures' dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onPastCapturesCloseClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Close' button on the 'Past Captures' dialog box",
            Result: "Close the 'Past Captures' dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    async getFutureCaptures() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Upcoming Captures Library' button",
            Result: "View the list of all the upcoming captures",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

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
        let index: number = 0;

        for (const key in future_captures) {
            const startDate = new Date(
                future_captures[key]["start_date"].seconds * 1000 +
                    future_captures[key]["start_date"].nanoseconds / 1000000
            );
            const endDate = new Date(
                future_captures[key]["due_date"].seconds * 1000 +
                    future_captures[key]["due_date"].nanoseconds / 1000000
            );

            this.futureCaptures[index] = {
                key: key,
                id: index++,
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

        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'" + column + "'column in the 'Upcoming Captures' table",
            Result:
                "Sort the upcoming captures by '" +
                column +
                "' in " +
                this.columnSortStateFutureCaptures[
                    this.activeSortColumnFutureCaptures
                ] +
                "ending order",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onFutureCapturesXClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'X' button on the 'Upcoming Captures' dialog box",
            Result: "Close the 'Upcoming Captures' dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onFutureCapturesCloseClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Close' button on the 'Upcoming Captures' dialog box",
            Result: "Close the 'Upcoming Captures' dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    convertDateFormat(dateString: string): string {
        const [month, day, year] = dateString.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    editFutureCapture(capture: any) {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target:
                "Pencil icon button for the upcoming capture with topic name '" +
                capture["capture_name"] +
                "'",
            Result: "Open a dialog box to edit the upcoming capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.futureCaptureKey = capture["key"];
        //this.futureCaptureSpecificSelected =
        //    capture["capture_name"] === "General" ? false : true;
        //this.futureCaptureSpecificTopic =
        //    capture["capture_name"] !== "General"
        //        ? capture["capture_name"]
        //        : "";
        this.futureCaptureSpecificTopic = capture["capture_name"];
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

    onEditUpcomingCaptureXClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'X' button on the 'Edit Upcoming Capture' dialog box",
            Result: "Close the 'Edit Upcoming Capture' dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    /*onFutureCaptureTypeClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target:
                "'" +
                (this.futureCaptureSpecificSelected ? "Specific" : "General") +
                "'radio button",
            Result:
                "Select '" +
                (this.futureCaptureSpecificSelected ? "Specific" : "General") +
                "' as the capture type for the upcoming capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }*/

    onFutureSpecificCaptureTopicClick() {
        //if (this.futureCaptureSpecificSelected) {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Topic Name' input",
            Result: "Enter topic name for the upcoming capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
        //}
    }

    updateFutureCaptureTopicCharacterCounter() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Typed",
            Target: "'Topic Name' input",
            Result: this.futureCaptureSpecificTopic,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.futureCaptureTopicCharactersLeft =
            this.maxTopicCharacters -
            (this.futureCaptureSpecificTopic?.length ?? 0);
    }

    onFutureCapturePromptClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Prompt' input",
            Result: "Enter prompt for the upcoming capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    updateFutureCapturePromptCharacterCounter() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Typed",
            Target: "'Prompt' input",
            Result: this.futureCapturePrompt,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

        this.futureCapturePromptCharactersLeft =
            this.maxPromptCharacters - (this.futureCapturePrompt?.length ?? 0);
    }

    onFutureCaptureDateClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Date' input",
            Result: "Enter dates for the upcoming capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onFutureCaptureStartDateInput() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Typed",
            Target: "'Date' input's start date",
            Result: this.futureCaptureStartDate,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onFutureCaptureEndDateInput() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Typed",
            Target: "'Date' input's end date",
            Result: this.futureCaptureEndDate,
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    onFutureCaptureCloseClick() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Close' button on the 'Edit Upcoming Capture' dialog box",
            Result: "Close the 'Edit Upcoming Capture' dialog box",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );
    }

    async saveFutureCaptureEdit() {
        let userIntData: any = [];
        let time = new Date();
        userIntData = JSON.parse(
            sessionStorage.getItem("userInteractionData") || "[]"
        );
        userIntData.push({
            Action: "Clicked",
            Target: "'Confirm' button",
            Result: "Complete the edit of the upcoming capture",
            Time: time.toLocaleString(),
        });
        sessionStorage.setItem(
            "userInteractionData",
            JSON.stringify(userIntData)
        );

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

        const newStartDate = new Date(
            this.removeTimeZoneOffset(this.futureCaptureStartDate, true)
        );
        const newEndDate = new Date(
            this.removeTimeZoneOffset(this.futureCaptureEndDate, true)
        );

        let captureOverlap = false;

        for (const key in future_captures) {
            if (key === this.futureCaptureKey) {
                continue;
            }

            const existingStartDate = new Date(
                future_captures[key]["start_date"].seconds * 1000 +
                    future_captures[key]["start_date"].nanoseconds / 1000000
            );
            const existingEndDate = new Date(
                future_captures[key]["due_date"].seconds * 1000 +
                    future_captures[key]["due_date"].nanoseconds / 1000000
            );

            if (
                newStartDate.getTime() <= existingEndDate.getTime() &&
                existingStartDate.getTime() <= newEndDate.getTime()
            ) {
                captureOverlap = true;
                break;
            }
        }

        if (!captureOverlap && this.isCaptureActive) {
            if (
                newStartDate.getTime() <= this.currCaptureEndDate.getTime() &&
                this.currCaptureStartDate.getTime() <= newEndDate.getTime()
            ) {
                captureOverlap = true;
            }
        }

        if (captureOverlap) {
            this.openAlertDialog(
                "Warning: Capture Date Overlap",
                "The dates you have entered overlap with an existing capture. Please choose different dates."
            );
            return;
        }

        for (const key in future_captures) {
            if (this.futureCaptureKey === key.toString()) {
                future_captures[key]["name"] = this.futureCaptureSpecificTopic;
                future_captures[key]["prompt"] = this.futureCapturePrompt;
                future_captures[key]["start_date"] = newStartDate;
                future_captures[key]["due_date"] = newEndDate;
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
        //this.futureCaptureSpecificSelected = null;
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
