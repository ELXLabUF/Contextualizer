import { Timestamp } from "firebase/firestore";
import { Experience } from "./experience";

export interface DocumentData {
    integrated_experiences?: Experience[];
    Assessment?: string;
    "Content Area"?: string;
    CCRSAE?: string;
    Duration?: string;
    "Grade Level"?: string;
    "Home Study"?: string;
    "Instruction Shifts"?: string;
    Instructions?: string;
    Materials?: string;
    Objective?: string;
    Reflection?: string;
    Topic?: string;
    mainTopic?: string;
    // subTopic?: string;
    createdAt?: Timestamp;
}
