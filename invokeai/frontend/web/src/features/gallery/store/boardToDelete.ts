import { atom } from 'nanostores';
import type { BoardDTO } from 'services/api/types';

/**
 * Nanostore for tracking which board is pending deletion.
 * Used to trigger the delete confirmation modal.
 */
export const $boardToDelete = atom<BoardDTO | 'none' | null>(null);
