import { z } from 'zod';

export function createBookingSchema(t) {
  return z
    .object({
      user_name: z.string().min(1, t('validation.nameRequired')).max(255),
      start_time: z
        .string()
        .min(1, t('validation.startRequired'))
        .refine((val) => new Date(val) > new Date(), {
          message: t('validation.startFuture'),
        }),
      end_time: z.string().min(1, t('validation.endRequired')),
    })
    .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
      message: t('validation.endAfterStart'),
      path: ['end_time'],
    });
}
