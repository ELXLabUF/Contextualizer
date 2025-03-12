import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CapturesPageComponent } from "./captures-page.component";

describe("CapturesPageComponent", () => {
    let component: CapturesPageComponent;
    let fixture: ComponentFixture<CapturesPageComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CapturesPageComponent],
        });
        fixture = TestBed.createComponent(CapturesPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
