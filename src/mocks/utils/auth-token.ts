import { MOCK_USERNAMES, MOCK_USERS } from '../data/users';

const TOKEN_PREFIX = 'mock-token-';

export function createToken(username: string): string {
  return `${TOKEN_PREFIX}${username}`;
}

export function isValidToken(authorization: string | null): boolean {
  const token = authorization?.replace('Bearer ', '') ?? '';
  const username = token.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : '';
  return MOCK_USERNAMES.includes(username) && username !== MOCK_USERS.LOCKED_OUT;
}
