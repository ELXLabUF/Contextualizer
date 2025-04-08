import { Injectable } from "@angular/core";
import { AuthService } from "../auth-service/auth.service";
import {
    Storage,
    ref,
    uploadBytesResumable,
    getDownloadURL,
} from "@angular/fire/storage";

@Injectable({
    providedIn: "root",
})
export class UserInteractionCsvService {
    userEmail: string = "";
    currentUser$ = this.authService.currentUser.subscribe((user) => {
        this.userEmail = user?.email as string;
    });

    constructor(private storage: Storage, public authService: AuthService) {}

    exportToCsv(rows: object[]) {
        if (!rows || !rows.length) {
            return;
        }
        const separator = ",";
        const keys = Object.keys(rows[0]);
        const csvData =
            keys.join(separator) +
            "\n" +
            rows
                .map((row: any) => {
                    return keys
                        .map((k) => {
                            let cell =
                                row[k] === null || row[k] === undefined
                                    ? ""
                                    : row[k];
                            cell =
                                cell instanceof Date
                                    ? cell.toLocaleString()
                                    : cell.toString().replace(/"/g, '""');
                            if (cell.search(/("|,|\n)/g) >= 0) {
                                cell = `"${cell}"`;
                            }
                            return cell;
                        })
                        .join(separator);
                })
                .join("\n");

        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
        const time = new Date().toString();
        const fileName = this.userEmail + "_" + time + ".csv";
        const filePath = `${this.userEmail}/${fileName}`;
        const storageRef = ref(
            this.storage,
            `user_interaction_data_files/${filePath}`
        );
        const uploadTask = uploadBytesResumable(storageRef, blob);

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
            }
        );
    }
}
