import { Injectable } from "@angular/core";
import { Experience } from "../experience";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class ExperienceLessonPlanService {
    experiences: any = [];
    private experienceSource = new BehaviorSubject(this.experiences);
    currentExperience = this.experienceSource.asObservable();

    mainTopic: string = "";
    subTopic: string = "";
    private mainTopicSource = new BehaviorSubject<string>("");
    private subTopicSource = new BehaviorSubject<string>("");
    currentMainTopic = this.mainTopicSource.asObservable();
    currentSubTopic = this.subTopicSource.asObservable();

    constructor() {}
    get currentMainTopicValue(): string {
        return this.mainTopicSource.getValue();
    }
    get currentSubTopicValue(): string {
        return this.subTopicSource.getValue();
    }
    changeExperience(newExperience: Experience) {
        this.experiences.push(newExperience);
        this.experienceSource.next(this.experiences);
    }

    changeMainTopic(selectedMainTopic: string) {
        this.mainTopicSource.next(selectedMainTopic);
    }

    changeSubTopic(selectedSubTopic: string) {
        this.subTopicSource.next(selectedSubTopic);
    }
}
