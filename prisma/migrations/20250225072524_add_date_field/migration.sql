-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "date" DROP DEFAULT,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3);
