import moment from "moment";

export class ScheduleManager {
    static isWorkingDay(date: moment.Moment): boolean {
        let day = date.day();
        return day >= 1 && day <= 5; // 0 is sunday, 6 then gonna be saturday
    }

    // Return opening hours as array[2] of hours, or [] if closed
    static getOpeningHours(date: moment.Moment): number[] {
        let day = date.day();
        if (day == 1 || day == 3) { // Mo, We
            return [8, 21];
        }
        if (day == 2 || day == 4 || day == 5) { // Tu, Th, Fr
            return [8, 16];
        }

        return []; // closed
    }
}