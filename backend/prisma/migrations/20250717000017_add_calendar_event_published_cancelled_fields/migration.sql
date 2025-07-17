/*
  Warnings:

  - You are about to drop the column `isActive` on the `CalendarEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CalendarEvent" DROP COLUMN "isActive",
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "publishedAt" TIMESTAMP(3);
