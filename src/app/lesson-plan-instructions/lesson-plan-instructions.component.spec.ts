import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LessonPlanInstructionsComponent } from "./lesson-plan-instructions.component";

describe("LessonPlanInstructionsComponent", () => {
    let component: LessonPlanInstructionsComponent;
    let fixture: ComponentFixture<LessonPlanInstructionsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [LessonPlanInstructionsComponent],
        });
        fixture = TestBed.createComponent(LessonPlanInstructionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
