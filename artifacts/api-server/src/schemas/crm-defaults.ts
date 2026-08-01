import { z } from "zod/v4";

export const crmDefaultsUpdateSchema = z.object({
  inflationHeadline: z.number().min(0).max(20).transform(v => v.toString()),
  inflationEdu: z.number().min(0).max(20).transform(v => v.toString()),
  inflationHealth: z.number().min(0).max(20).transform(v => v.toString()),
  returnPre: z.number().min(0).max(30).transform(v => v.toString()),
  returnPost: z.number().min(0).max(30).transform(v => v.toString()),
  lifeExpectancy: z.number().int().min(60).max(100),
  taxRegime: z.enum(['old', 'new']),
});
