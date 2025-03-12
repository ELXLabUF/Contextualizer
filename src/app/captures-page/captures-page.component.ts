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
    dateRangeStartDate!: string;
    dateRangeEndDate!: string;

    previousCaptures: any[] = [];

    activeSortColumn: Number = 0;
    displayedColumns: string[] = [
        "No.",
        "Capture Name",
        "Start Date",
        "End Date",
    ];
    columnSortState: string[] = ["asc", "asc", "asc", "asc"];

    constructor(
        public dialog: MatDialog,
        private angularFireStore: Firestore
    ) {}

    async ngOnInit() {
        await this.getCurrentCapture();
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

        await this.setSubmissionOpen();

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

    async setEndCaptureDataInFirestore() {
        //Get classroom data
        const classroom = sessionStorage.getItem("classroom") || "";
        const classroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(classroomDocRef);
        let previous_captures: any = {};
        let students: any = {};
        let teacher: any = {};

        if (classroomDocSnap.exists()) {
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || {};
            const length = Object.keys(previous_captures).length || 0;
            previous_captures[classroom.slice(10) + length.toString()] = {
                name: this.currCaptureName,
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
            start_date: new Date("January 01, 2020 00:00:00"),
            due_date: new Date("January 02, 2020 00:00:00"),
            submission_open: false,
            previous_captures: previous_captures,
            teacher: teacher,
            students: students,
        });

        const classroomApp = classroom + "App";

        //Rewrite classroom data in ClassroomApp document to reflect end of capture
        await setDoc(doc(this.angularFireStore, classroomApp), {
            selected_topic: "",
            start_date: new Date("January 01, 2020 00:00:00"),
            due_date: new Date("January 02, 2020 00:00:00"),
            submission_open: false,
        });

        this.currCaptureName = "";
        this.currCaptureStartDate = new Date("January 01, 2020 00:00:00");
        this.currCaptureEndDate = new Date("January 02, 2020 00:00:00");
        this.isCaptureActive = false;
    }

    async setSubmissionOpen() {
        //Get classroom data
        const classroom = sessionStorage.getItem("classroom") || "";
        const classroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(classroomDocRef);
        let captureID: string = "";
        let selectedTopic: string = "";
        let startDate: Date = new Date();
        let endDate: Date = new Date();
        let previous_captures: any = {};
        let submissionOpen: boolean = false;
        let students: any = {};
        let teacher: any = {};
        const classroomApp = classroom + "App";

        if (classroomDocSnap.exists()) {
            captureID = classroomDocSnap.data()["capture"] || "";
            selectedTopic = classroomDocSnap.data()["selected_topic"] || "";
            startDate = classroomDocSnap.data()["start_date"] || new Date();
            endDate = classroomDocSnap.data()["due_date"] || new Date();
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
                start_date: startDate,
                due_date: endDate,
                previous_captures: previous_captures,
                submission_open: true,
                students: students,
                teacher: teacher,
            });

            //Rewrite classroom data in ClassroomApp document to reflect submission open
            await setDoc(doc(this.angularFireStore, classroomApp), {
                capture: captureID,
                selected_topic: selectedTopic,
                start_date: startDate,
                due_date: endDate,
                submission_open: true,
            });
        }
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

    showCaptureStories() {
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

    async setCurrentCaptureDataInFirestore(
        captureName: string,
        startDate: Date,
        endDate: Date
    ) {
        //Get classroom data
        const classroom = sessionStorage.getItem("classroom") || "";
        const currClassroomDocRef = doc(this.angularFireStore, classroom);
        const classroomDocSnap = await getDoc(currClassroomDocRef);
        let previous_captures: any = {};
        let length: Number = 0;
        let teacher: any = {};
        let students: any = {};
        let isSubmissionOpen = false;

        if (startDate.getTime() <= new Date().getTime()) {
            isSubmissionOpen = true;
        }

        if (classroomDocSnap.exists()) {
            previous_captures =
                classroomDocSnap.data()["previous_captures"] || null;
            length = Object.keys(previous_captures).length || 0;
            teacher = classroomDocSnap.data()["teacher"] || {};
            students = classroomDocSnap.data()["students"] || {};
        } else {
            console.log("No such document!");
        }

        //Rewrite classroom data to reflect start of new capture
        await setDoc(doc(this.angularFireStore, classroom), {
            id: classroom.slice(10),
            capture: classroom.slice(10) + length.toString(),
            selected_topic: captureName,
            start_date: startDate,
            due_date: endDate,
            submission_open: isSubmissionOpen,
            previous_captures: previous_captures,
            teacher: teacher,
            students: students,
        });

        const classroomApp = classroom + "App";

        //Rewrite classroom data in ClassroomApp document
        await setDoc(doc(this.angularFireStore, classroomApp), {
            capture: classroom.slice(10) + length.toString(),
            selected_topic: captureName,
            start_date: startDate,
            due_date: endDate,
            submission_open: isSubmissionOpen,
        });

        this.noActiveCapture = false;
    }

    removeTimeZoneOffset(inputDate: string) {
        const date = new Date(inputDate);
        const tzOffset = date.getTimezoneOffset() * 60000;
        const offsetDate = new Date(date.getTime() + tzOffset);
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

        if (this.isCaptureActive && !this.showRecentCapture) {
            this.openAlertDialog(
                "Warning: Previous Capture Active",
                "The previous capture has yet to end. Please click on 'End Capture' before starting a new capture."
            );
            return;
        }

        this.dateRangeStartDate = this.removeTimeZoneOffset(
            this.dateRangeStartDate
        );
        this.dateRangeEndDate = this.removeTimeZoneOffset(
            this.dateRangeEndDate
        );

        this.currCaptureName = this.specificSelected
            ? this.specificTopic
            : "General";
        this.currCaptureStartDate =
            new Date(this.dateRangeStartDate) || new Date();
        this.currCaptureEndDate = new Date(this.dateRangeEndDate) || new Date();

        await this.setCurrentCaptureDataInFirestore(
            this.currCaptureName,
            this.currCaptureStartDate,
            this.currCaptureEndDate
        );

        this.toggleCaptureStories = false;
        this.buttonText = "Show";

        await this.getCaptureStories();

        this.specificSelected = null;
        this.specificTopic = "";
        this.dateRangeStartDate = "";
        this.dateRangeEndDate = "";
        this.isCaptureActive = true;
        this.showRecentCapture = false;
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
            this.previousCaptures[idx] = {
                id: idx,
                capture_name: previous_captures[key]["name"],
                start_date: startDate,
                due_date: endDate,
            };
        }

        this.activeSortColumn = 0;
        this.sortTable("No.");
    }

    sortTable(column: string) {
        if (column === "No.") {
            this.columnSortState[0] =
                this.columnSortState[0] === "desc" ? "asc" : "desc";
            this.activeSortColumn = 0;
        } else if (column === "Capture Name") {
            this.columnSortState[1] =
                this.columnSortState[1] === "desc" ? "asc" : "desc";
            this.activeSortColumn = 1;
        } else if (column === "Start Date") {
            this.columnSortState[2] =
                this.columnSortState[2] === "desc" ? "asc" : "desc";
            this.activeSortColumn = 2;
        } else if (column === "End Date") {
            this.columnSortState[3] =
                this.columnSortState[3] === "desc" ? "asc" : "desc";
            this.activeSortColumn = 3;
        }

        if (column === "No.") {
            if (this.columnSortState[0] === "asc") {
                this.previousCaptures.sort((a: any, b: any) => a.id - b.id);
            } else if (this.columnSortState[0] === "desc") {
                this.previousCaptures.sort((a: any, b: any) => b.id - a.id);
            }
        } else if (column === "Capture Name") {
            if (this.columnSortState[1] === "asc") {
                this.previousCaptures.sort((a: any, b: any) =>
                    a.capture_name > b.capture_name ? 1 : -1
                );
            } else if (this.columnSortState[1] === "desc") {
                this.previousCaptures.sort((a: any, b: any) =>
                    b.capture_name > a.capture_name ? 1 : -1
                );
            }
        } else if (column === "Start Date") {
            if (this.columnSortState[2] === "asc") {
                this.previousCaptures.sort(
                    (a: any, b: any) =>
                        new Date(a.start_date).getTime() -
                        new Date(b.start_date).getTime()
                );
            } else if (this.columnSortState[2] === "desc") {
                this.previousCaptures.sort(
                    (a: any, b: any) =>
                        new Date(b.start_date).getTime() -
                        new Date(a.start_date).getTime()
                );
            }
        } else if (column === "End Date") {
            if (this.columnSortState[3] === "asc") {
                this.previousCaptures.sort(
                    (a: any, b: any) =>
                        new Date(a.due_date).getTime() -
                        new Date(b.due_date).getTime()
                );
            } else if (this.columnSortState[3] === "desc") {
                this.previousCaptures.sort(
                    (a: any, b: any) =>
                        new Date(b.due_date).getTime() -
                        new Date(a.due_date).getTime()
                );
            }
        }
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
