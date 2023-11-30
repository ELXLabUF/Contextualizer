import { Injectable } from "@angular/core";
import {
    Firestore,
    addDoc,
    collection,
    collectionData,
    deleteDoc,
    doc,
    updateDoc,
} from "@angular/fire/firestore";
import { Experience } from "../experience";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class ExperienceService {
    constructor(private angularFireStore: Firestore) {}

    // Add a new experience
    addExperience(experience: Experience) {
        experience.id = doc(collection(this.angularFireStore, "id")).id;
        return addDoc(
            collection(this.angularFireStore, "Experiences"),
            experience
        );
    }

    // Get all experiences
    getExperience(): Observable<Experience[]> {
        let experienceReference = collection(
            this.angularFireStore,
            "Experiences"
        );
        return collectionData(experienceReference, {
            idField: "id",
        }) as Observable<Experience[]>;
    }

    // Delete an experience
    deleteExperience(experience: Experience) {
        let docRef = doc(this.angularFireStore, `Experiences/${experience.id}`);
        return deleteDoc(docRef);
    }

    // Update an experience
    updateExperience(experience: Experience, experiences: any) {
        let docRef = doc(this.angularFireStore, `Experiences/${experience.id}`);
        return updateDoc(docRef, experiences);
    }

    // Parse CSV file to get experiences
    parseCSVContent(experience: Experience) {
        experience.id = doc(collection(this.angularFireStore, "id")).id;
        return addDoc(
            collection(this.angularFireStore, "Experiences"),
            experience
        );
    }
}
