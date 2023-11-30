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
            this.http.post<PdfConversionResponse>(this.API_ENDPOINT, payload, { headers }).subscribe({
                next: (response) => {
                    if (response && !response.error) {
                        this.http.get(response.url!, { responseType: "text" }).subscribe({
                            next: (jsonData) => {
                                // console.log('Received JSON:', jsonData);
                                const transormedData = this.transformData(jsonData);
                                const transformedJSONData = this.arrayToJSON(transormedData);
                                if (transformedJSONData && "Content Area" in transformedJSONData) {
                                    const result = {
                                        "Content Area":{
                                            title: "Content Area",
                                            content: transformedJSONData["Content Area"],
                                            integrated_experiences: []
                                        },
                                        "Grade Level":{
                                            title: "Grade Level",
                                            content: transformedJSONData["Grade Level"],
                                            integrated_experiences: []
                                        },
                                        Topic: {
                                            title: "Topic",
                                            content: transformedJSONData["Topic"],
                                            integrated_experiences: []
                                        },
                                        Duration:{
                                            title: "Duration",
                                            content:transformedJSONData["Duration"],
                                            integrated_experiences: []
                                        },
                                        CCRSAE: {
                                            title: "CCRSAE",
                                            content:transformedJSONData["CCRSAE"],
                                            integrated_experiences: []
                                        },
                                        "Instruction Shifts":{
                                            title: "Instruction Shifts",
                                            content:transformedJSONData["Instruction Shifts"].slice(1,transformedJSONData["Instruction Shifts"].length),
                                            integrated_experiences: []
                                        },
                                        Objective: {
                                            title: "Objective",
                                            content:this.transformArray(transformedJSONData["Objective"].slice(2,transformedJSONData["Objective"].length)),
                                            integrated_experiences: []
                                        },
                                        Assessment: {
                                            title: "Assessment",
                                            content:this.transformArray(transformedJSONData["Assessment"].slice(2,transformedJSONData["Assessment"].length)),
                                            integrated_experiences: []
                                        },
                                        Materials: {
                                            title: "Materials",
                                            content:this.transformArray(transformedJSONData["Materials"].slice(1,transformedJSONData["Materials"].length)),
                                            integrated_experiences: []
                                        },
                                        Instructions: {
                                            title: "Instructions",
                                            content:this.transformArray(transformedJSONData["Instructions"].slice(2,transformedJSONData["Instructions"].length)),
                                            integrated_experiences: []
                                        },
                                        "Home Study": {
                                            title: "Home Study",
                                            content:transformedJSONData["Home Study"].slice(1,transformedJSONData["Home Study"].length),
                                            integrated_experiences: []
                                        },
                                        Reflection: {
                                            title: "Reflection",
                                            content:transformedJSONData["Reflection"].slice(2,transformedJSONData["Reflection"].length),
                                            integrated_experiences: []
                                        }
                                        };
                                        resolve(result);
                                    }else {
                                        console.error('Transformed JSON Data is invalid or missing required properties:', transformedJSONData);
                                        reject('Transformed JSON Data is invalid or missing required properties.');
                                    }
                                },
                                error: (error) => {
                                    console.error('Error downloading the JSON data:', error);
                                    reject('Error downloading the JSON data.');
                                }
                            });
                        } else {
                            console.error('Error making the conversion request, Response:', response);
                            reject(response.message || 'Error making the conversion request.');
                        }
                    },
                    error: (error) => {
                        console.error('Error making the conversion request:', error);
                        reject('Error making the conversion request.');
                    }
                })
            });
        }

    private transformArray(input: string[]): string[] {
        const output: string[] = [];
        for (let i = 0; i < input.length; i++) {
            if (input[i].match(/^\d+\./)) {
                let start = i;
                let end = i + 1;
                while (end < input.length && !input[end].match(/^\d+\./)) {
                    end++;
                }
                output.push(input.slice(start, end).join(" "));
                i = end - 1;
            }
        }
        return output;
    }

    private arrayToJSON(arr: string[]) {
        const fields = [
            "Content Area",
            "Grade Level",
            "Topic",
            "Duration",
            "CCRSAE",
            "Instruction Shifts",
            "Objective",
            "Assessment",
            "Materials",
            "Instructions",
            "Home Study",
            "Reflection",
        ];

        const result: { [key: string]: any } = {};
        fields.forEach((field, index) => {
            const startIndex = arr.indexOf(field);
            let endIndex;

            if (index !== fields.length - 1) {
                endIndex = arr.indexOf(fields[index + 1]);
            } else {
                endIndex = arr.length;
            }

            const dataForField = arr.slice(startIndex + 1, endIndex);
            if (dataForField.length === 1) {
                result[field] = dataForField[0];
            } else {
                result[field] = dataForField;
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
