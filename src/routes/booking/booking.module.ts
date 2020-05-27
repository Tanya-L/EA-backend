import {Module, ModuleComponent} from '@liftr/core';
import {
    deleteBookingRoute,
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
        route: deleteBookingRoute,
        middleware: [],
    },
    {
        route: getAdminBookingRoute,
        middleware: [],
    },
]);
