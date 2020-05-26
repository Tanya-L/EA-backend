export class BookingResult {
    constructor(
        public ok: boolean,
        public code: string, // booking code if OK
        public reason: string, // error reason if not OK
    ) {
    }
}
