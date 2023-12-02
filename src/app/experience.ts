import { Student } from "./student";

export interface Experience {
    id: string;
    experience_title: string;
    experience_description: string;
    student_name: string;
    date: string;
    student_data: Student;
}
