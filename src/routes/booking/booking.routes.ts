import {Route} from '@liftr/core';
import {
    deleteBookingController,
    getAdminBookingController,
    getBookingController,
    postBookingController
} from '@controllers/booking/booking.controller';

export const getBookingRoute = Route.get('/', getBookingController);
export const deleteBookingRoute = Route.delete('/', deleteBookingController);
export const postBookingRoute = Route.post('/', postBookingController);
export const getAdminBookingRoute = Route.get('/admin', getAdminBookingController);
