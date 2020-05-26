import {Module, ModuleComponent} from '@liftr/core';
import {
    getAdminBookingRoute,
    getBookingRoute,
    postBookingRoute
} from './booking.routes';

export const BookingModule: ModuleComponent = Module([
    {
        route: getBookingRoute,
        middleware: [],
    },
    {
        route: postBookingRoute,
        middleware: [],
    },
    {
        route: getAdminBookingRoute,
        middleware: [],
    },
]);
