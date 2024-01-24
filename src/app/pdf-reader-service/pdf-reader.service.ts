import { Injectable } from "@angular/core";
import * as pdfjsLib from "pdfjs-dist";
import { HttpClient } from "@angular/common/http";

interface PdfConversionResponse {
    error: boolean;
    url?: string;
    message?: string;
}

@Injectable({
    providedIn: "root",
})
export class PdfReaderService {
    private readonly API_KEY =
        "y.goel@ufl.edu_63baf703c96b0d48cbd6bf4175dcd778fb377799bc5636ae7ed5ceaf8a58361adf1460d8";
    private readonly API_ENDPOINT = "https://api.pdf.co/v1/pdf/convert/to/json";

    constructor(private http: HttpClient) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "assets/pdf.worker.js";
    }

    convertPdfToJson(sourceFileUrl: string): Promise<any> {
        const payload = {
            name: "result.json",
            password: "",
            pages: "",
            url: sourceFileUrl,
        };

        const headers = {
            "x-api-key": this.API_KEY,
            "Content-Type": "application/json",
        };

        return new Promise((resolve, reject) => {
            this.http
                .post<PdfConversionResponse>(this.API_ENDPOINT, payload, {
                    headers,
                })
                .subscribe({
                    next: (response) => {
                        if (response && !response.error) {
                            this.http
                                .get(response.url!, { responseType: "text" })
                                .subscribe({
                                    next: (jsonData) => {

                                        console.log('Received JSON ->', jsonData);

                                        const transormedData = this.transformData(jsonData);
                                        console.log('Transformed Data ->', transormedData);

                                        const transformedJSONData = this.arrayToJSON(transormedData);
                                        console.log('Transformed JSON Data ->', transformedJSONData);

                                        if (transformedJSONData){
                                            const result = {
                                                Grade: {
                                                    title: "Grade",
                                                    content: transformedJSONData["Grade"],
                                                    integrated_experiences: [],
                                                },
                                                Subject: {
                                                    title: "Subject",
                                                    content: transformedJSONData["Subject"],
                                                    integrated_experiences: [],
                                                },
                                                Duration: {
                                                    title: "Duration",
                                                    content: transformedJSONData["Duration"],
                                                    integrated_experiences: [],
                                                },
                                                "Lesson Standards & Objectives": {
                                                    title: "Lesson Standards & Objectives",
                                                    content: this.transformArray(transformedJSONData["Lesson Standards & Objectives"]),
                                                    integrated_experiences: [],
                                                },
                                                Materials: {
                                                    title: "Materials",
                                                    content: this.transformArray(transformedJSONData["Materials"]),
                                                    integrated_experiences: [],
                                                },
                                                "Warm-Up": {
                                                    title: "Warm-Up",
                                                    content: this.transformArray(transformedJSONData["Warm-Up"]),
                                                    integrated_experiences: [],
                                                },
                                                "Teacher-Led Instructions": {
                                                    title: "Teacher-Led Instructions",
                                                    content: this.transformArray(transformedJSONData["Teacher-Led Instructions"]),
                                                    integrated_experiences: [],
                                                },
                                                "Student-Led Learning": {
                                                    title: "Student-Led Learning",
                                                    content: this.transformArray(transformedJSONData["Student-Led Learning"]),
                                                    integrated_experiences: [],
                                                },
                                                "Wrap-Up/Closure": {
                                                    title: "Wrap-Up/Closure",
                                                    content: this.transformArray(transformedJSONData["Wrap-Up/Closure"]),
                                                    integrated_experiences: [],
                                                },
                                            };
                                            console.log("Result ->", result);
                                            resolve(result);
                                        } else {
                                            console.error(
                                                "Transformed JSON Data is invalid or missing required properties:",
                                                transformedJSONData
                                            );
                                            reject(
                                                "Transformed JSON Data is invalid or missing required properties."
                                            );
                                        }
                                    },
                                    error: (error) => {
                                        console.error(
                                            "Error downloading the JSON data:",
                                            error
                                        );
                                        reject(
                                            "Error downloading the JSON data."
                                        );
                                    },
                                });
                        } else {
                            console.error(
                                "Error making the conversion request, Response:",
                                response
                            );
                            reject(
                                response.message ||
                                    "Error making the conversion request."
                            );
                        }
                    },
                    error: (error) => {
                        console.error(
                            "Error making the conversion request:",
                            error
                        );
                        reject("Error making the conversion request.");
                    },
                });
        });
    }

    private transformArray(input: string[]): string[] {
        const output: string[] = [];
        let currentPoint = '';
        
        if(!input || input.length == 0){
            return []
        }

        input.forEach(line => {
            if (line.match(/^(\•|\-|\d+\.)\s/)) {
                if (currentPoint) {
                    output.push(currentPoint.trim());
                    currentPoint = '';
                }
                currentPoint = line;
            } else {
                currentPoint += ' ' + line;
            }
        });

        if (currentPoint) {
            output.push(currentPoint.trim());
        }

        return output;
    }

    private arrayToJSON(arr: string[]) {
        const fields = [
            "Grade:",
            "Subject:",
            "Duration:",
            "Lesson Standards & Objectives:",
            "Materials:",
            "Warm-Up:",
            "Teacher-Led Instruction:",
            "Student-Led Learning:",
            "Wrap-Up/Closure:"
        ];

        const result: { [key: string]: any } = {};
        fields.forEach((field, index) => {
            const startIndex = arr.findIndex(element => element.startsWith(field));
            let endIndex;

            if (index !== fields.length - 1) {
                endIndex = arr.findIndex(element => element.startsWith(fields[index + 1]));
            } else {
                endIndex = arr.length;
            }

            if (startIndex !== -1 && endIndex !== -1) {
                const dataForField = arr.slice(startIndex, endIndex);
                const formattedData = dataForField.map(line => line.replace(field, '').trim()).filter(line => line);
                result[field.replace(':', '')] = formattedData.length === 1 ? formattedData[0] : formattedData;
            }
        });
        return result;
    }

    private transformData(data: any): any {
        const jsonData = JSON.parse(data);
        const pages = Array.isArray(jsonData.document.page)
            ? jsonData.document.page
            : [jsonData.document.page];
        const transformedData: any[] = [];

        pages.forEach((page: any) => {
            //   console.log(page);

            const rows = page.row
                ? Array.isArray(page.row)
                    ? page.row
                    : [page.row]
                : [];

            rows.forEach((row: any) => {
                const columns = row.column
                    ? Array.isArray(row.column)
                        ? row.column
                        : [row.column]
                    : [];

                columns.forEach((column: any) => {
                    //   console.log(column);

                    if (column.text && column.text["#text"]) {
                        // console.log(column.text["#text"]);
                        transformedData.push(column.text["#text"]);
                    }
                });
            });
        });

        // console.log(transformedData);
        return transformedData;
    }

    public async readPdf(pdfUrl: string): Promise<string> {
        try {
            const pdf: pdfjsLib.PDFDocumentProxy = await pdfjsLib.getDocument(
                pdfUrl
            ).promise;
            const countPromises: Promise<string>[] = []; // collecting all page promises
            for (let i = 1; i <= pdf.numPages; i++) {
                countPromises.push(this.getPageText(i, pdf));
            }
            const pageContents = await Promise.all(countPromises);
            return pageContents.join("");
        } catch (error) {
            throw new Error("Failed to read the PDF.");
        }
    }

    private async getPageText(
        pageNum: number,
        pdf: pdfjsLib.PDFDocumentProxy
    ): Promise<string> {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        return textContent.items.map((s: any) => s.str).join("");
    }
}
