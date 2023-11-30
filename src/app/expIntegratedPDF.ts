import { Timestamp } from "firebase/firestore";
import { Experience } from "./experience";

export interface ExpIntegratedPDF {
    id: string;
    main_topic: string;
    sub_topic: string;
    pdf_data: Object;
    integrated_experiences: Experience[];
}
