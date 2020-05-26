import {Route} from '@liftr/core';
import {
    getAdminBookingController,
    getBookingController,
    postBookingController
} from '@controllers/booking/booking.controller';

export const getBookingRoute = Route.get('/', getBookingController);
export const postBookingRoute = Route.post('/', postBookingController);
export const getAdminBookingRoute = Route.get('/admin', getAdminBookingController);
