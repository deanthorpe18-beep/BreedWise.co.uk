import { z } from "zod";

export const signupSchema = z
  .object({
    displayName: z.string().min(2, "Display name must be at least 2 characters").max(50),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
    accountIntent: z.enum(["buyer", "breeder"]).default("breeder"),
    signupSource: z.enum(["outreach", "website"]).optional(),
    outreachBreederSlug: z.string().max(200).optional(),
    outreachBreederName: z.string().max(200).optional(),
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the Terms of Use and Privacy Policy" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  next: z.string().optional(),
});

export const forgotSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const claimSchema = z.object({
  breederSlug: z.string().min(1),
  breederName: z.string().optional(),
  email: z.string().email(),
  name: z.string().min(2).optional(),
  notes: z.string().max(1000).optional(),
});

export const removalSchema = z.object({
  breederSlug: z.string().min(1),
  breederName: z.string().optional(),
  email: z.string().email(),
  name: z.string().min(2).optional(),
  reason: z.string().min(10, "Please provide a brief reason").max(2000),
  gdprRequest: z.boolean().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(5000),
});
