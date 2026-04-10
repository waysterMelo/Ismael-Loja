/*
  Warnings:

  - You are about to drop the column `whatsappSent` on the `PromissoryNote` table. All the data in the column will be lost.
  - You are about to drop the column `whatsappSentAt` on the `PromissoryNote` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PromissoryNote" DROP COLUMN "whatsappSent",
DROP COLUMN "whatsappSentAt";
