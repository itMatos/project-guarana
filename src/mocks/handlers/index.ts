import { authHandlers } from './auth.handlers';
import { productHandlers } from './product.handlers';
import { userHandlers } from './user.handlers';

export const handlers = [...authHandlers, ...productHandlers, ...userHandlers];
