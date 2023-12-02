import { TestBed } from "@angular/core/testing";

import { UserInteractionCsvService } from "./user-interaction-csv.service";

describe("UserInteractionCsvService", () => {
    let service: UserInteractionCsvService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UserInteractionCsvService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });
});
