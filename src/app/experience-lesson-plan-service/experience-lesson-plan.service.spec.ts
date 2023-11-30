import { TestBed } from "@angular/core/testing";

import { ExperienceLessonPlanService } from "./experience-lesson-plan.service";

describe("ExperienceLessonPlanService", () => {
    let service: ExperienceLessonPlanService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ExperienceLessonPlanService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
