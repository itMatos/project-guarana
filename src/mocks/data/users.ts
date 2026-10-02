export const MOCK_PASSWORD = 'secret_sauce';

export const MOCK_USERS = {
  STANDARD: 'standard_user',
  LOCKED_OUT: 'locked_out_user',
  PROBLEM: 'problem_user',
  PERFORMANCE_GLITCH: 'performance_glitch_user',
  ERROR: 'error_user',
  VISUAL: 'visual_user',
} as const;

export const MOCK_USERNAMES: readonly string[] = Object.values(MOCK_USERS);
