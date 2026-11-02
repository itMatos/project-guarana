import { authHandlers } from './auth.handlers';
import { cartHandlers } from './cart.handlers';
import { productHandlers } from './product.handlers';
import { userHandlers } from './user.handlers';

export const handlers = [...authHandlers, ...productHandlers, ...cartHandlers, ...userHandlers];
