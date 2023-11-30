import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExperiencePageComponent } from "./experience-page.component";

describe("ExperiencePageComponent", () => {
    let component: ExperiencePageComponent;
    let fixture: ComponentFixture<ExperiencePageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExperiencePageComponent],
        });
        fixture = TestBed.createComponent(ExperiencePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
