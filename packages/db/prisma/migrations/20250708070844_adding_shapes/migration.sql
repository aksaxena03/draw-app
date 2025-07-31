-- AlterTable
ALTER TABLE "User" ALTER COLUMN "photo" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Shapes" (
    "id" SERIAL NOT NULL,
    "roomId" INTEGER NOT NULL,
    "shape" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Shapes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Shapes" ADD CONSTRAINT "Shapes_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shapes" ADD CONSTRAINT "Shapes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
