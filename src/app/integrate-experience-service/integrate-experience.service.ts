import { Injectable } from "@angular/core";
import {
    Firestore,
    addDoc,
    collection,
    doc,
    updateDoc,
} from "@angular/fire/firestore";
import { ExpIntegratedPDF } from "../expIntegratedPDF";

@Injectable({
    providedIn: "root",
})
export class IntegrateExperienceService {
    constructor(private angularFireStore: Firestore) {}
    addParsedPDF(expIntegratedPDF: ExpIntegratedPDF) {
        return addDoc(
            collection(this.angularFireStore, "ExperienceIntegratedPDF"),
            expIntegratedPDF
        );
    }

    addIntegratedExperience(expIntegratedPDF: any) {
        let docRef = doc(
            this.angularFireStore,
            `ExperienceIntegratedPDF/${expIntegratedPDF.id}`
        );
        updateDoc(docRef, expIntegratedPDF);
    }
}
