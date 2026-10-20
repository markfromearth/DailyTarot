import { z } from 'zod';

export const OrientationSchema = z.enum(['upright', 'reversed']);

export const ReadingPositionSchema = z.enum(['past', 'present', 'future']);

export const ReadingPhaseSchema = z.enum(['intro', 'shuffling', 'fan', 'place', 'read']);

export const DrawnCardDataSchema = z.object({
  id: z.string().min(1),
  orientation: OrientationSchema,
});

export const SelectedCardDataSchema = z.object({
  id: z.string().min(1),
  orientation: OrientationSchema,
  position: ReadingPositionSchema,
  isRevealed: z.boolean(),
});

export const PersistedReadingSchema = z.object({
  version: z.literal(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  phase: ReadingPhaseSchema,
  availableCardIds: z.array(z.string().min(1)),
  drawnCardsData: z.array(DrawnCardDataSchema),
  initialShuffledDeckIds: z.array(z.string().min(1)),
  selectedCardsData: z.array(SelectedCardDataSchema),
});

export type PersistedReadingValidated = z.infer<typeof PersistedReadingSchema>;
