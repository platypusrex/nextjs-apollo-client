import { QueryHydrationMap } from './types';

export const generateHydrationMap = <T extends QueryHydrationMap>(map: T): T => map;
