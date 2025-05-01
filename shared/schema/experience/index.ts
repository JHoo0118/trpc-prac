import { z } from "zod";
import { zfd } from "zod-form-data";

const locationSchema = z.object({
  displayName: z.string(),
  lat: z.number(),
  lon: z.number(),
});

export type LocationData = z.infer<typeof locationSchema>;

export const experienceValidationSchema = zfd.formData({
  id: zfd.numeric(z.number()).optional(),
  title: zfd.text(z.string().min(1, "Title is required")),
  content: zfd.text(z.string().min(1, "Content is required")),
  scheduledAt: zfd.text(z.string().datetime("Invalid date")),
  url: zfd.text(z.string().url("Invalid link")).nullable(),
  image: zfd.file().optional(),
  location: zfd.json(locationSchema),
});

export const experienceFiltersSchema = z.object({
  q: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  tags: z.array(z.number()).optional(),
});

export type ExperienceFilterParams = z.infer<typeof experienceFiltersSchema>;
