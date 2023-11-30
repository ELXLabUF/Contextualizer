import { TestBed } from "@angular/core/testing";

import { IntegrateExperienceService } from "./integrate-experience.service";

describe("IntegrateExperienceService", () => {
    let service: IntegrateExperienceService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(IntegrateExperienceService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
