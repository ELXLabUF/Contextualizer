import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: "app-input-dialog",
    templateUrl: "./input-dialog.component.html",
    styleUrls: ["./input-dialog.component.css"],
})
export class InputDialogComponent {
    sectionName: string = "";

    constructor(public dialogRef: MatDialogRef<InputDialogComponent>) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    onConfirmClick(): void {
        this.dialogRef.close(this.sectionName);
    }
}
