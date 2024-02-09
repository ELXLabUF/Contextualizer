import { Injectable } from "@angular/core";
import { Experience } from "../experience";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class ExperienceLessonPlanService {
    experiences: any = [];
    private experienceSource = new BehaviorSubject(this.experiences);
    private latestDocumentIdSource = new BehaviorSubject<string>("");

    currentExperience = this.experienceSource.asObservable();
    currentDocumentId = this.latestDocumentIdSource.asObservable();

    mainTopic: string = "";
    // subTopic: string = "";
    private mainTopicSource = new BehaviorSubject<string>("");
    // private subTopicSource = new BehaviorSubject<string>("");
    currentMainTopic = this.mainTopicSource.asObservable();
    // currentSubTopic = this.subTopicSource.asObservable();

    constructor() {
        const storedId = sessionStorage.getItem("documentId");
        if (storedId) {
            this.setLatestDocumentId(storedId);
        }
    }

    get currentMainTopicValue(): string {
        return this.mainTopicSource.getValue();
    }

    // get currentSubTopicValue(): string {
    //     return this.subTopicSource.getValue();
    // }

    setLatestDocumentId(id: string = "") {
        console.log("Setting ID");
        if (!id) {
            id = sessionStorage.getItem("documentId") || "";
        }
        this.latestDocumentIdSource.next(id);
        console.log(id);
    }

    changeExperience(newExperience: Experience) {
        this.experiences.push(newExperience);
        this.experienceSource.next(this.experiences);
    }

    changeMainTopic(selectedMainTopic: string) {
        this.mainTopicSource.next(selectedMainTopic);
    }

    // changeSubTopic(selectedSubTopic: string) {
    //     this.subTopicSource.next(selectedSubTopic);
    // }
}
