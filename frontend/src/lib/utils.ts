import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import "dotenv/config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
  typescript: true,
});
