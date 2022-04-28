import { randUser } from '@ngneat/falso';

export const generateUsers = (numUsers: number = 5) => {
  return Array.from({ length: numUsers }).map(() => randUser())
};
