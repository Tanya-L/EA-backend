import {asyncMiddleware} from '@middlewares/asyncMiddleware';
import {Route} from '@liftr/core';
import {
    deleteBookingController,
    getAdminBookingController,
    getBookingController,
    postBookingController
} from '@controllers/booking/booking.controller';

export const getBookingRoute = Route.get(
    '/',
    asyncMiddleware(getBookingController));

export const deleteBookingRoute = Route.delete(
    '/',
    asyncMiddleware(deleteBookingController));

export const postBookingRoute = Route.post(
    '/',
    asyncMiddleware(postBookingController));

export const getAdminBookingRoute = Route.get(
    '/admin',
    asyncMiddleware(getAdminBookingController));
