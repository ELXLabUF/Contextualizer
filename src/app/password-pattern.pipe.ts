import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "passwordPattern",
})
export class PasswordPatternPipe implements PipeTransform {
    transform(value: string, pattern: string): boolean {
        const regex = new RegExp(pattern);
        return regex.test(value);
    }
}
