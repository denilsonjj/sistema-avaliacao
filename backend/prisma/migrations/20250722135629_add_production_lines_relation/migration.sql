-- CreateTable
CREATE TABLE "ProductionLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ProductionLineToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ProductionLineToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ProductionLine" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ProductionLineToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductionLine_name_key" ON "ProductionLine"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ProductionLineToUser_AB_unique" ON "_ProductionLineToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductionLineToUser_B_index" ON "_ProductionLineToUser"("B");
