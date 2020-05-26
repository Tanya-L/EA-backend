// interface IBooking {
//     name: string,
//     phone: string,
//     comments: string,
//     bookingCode: string,
// }

export class Booking {
    constructor(
        public name: string,
        public phone: string,
        public comments: string,
        public bookingCode: string
    ) {
    }
}
