-- CreateTable
CREATE TABLE "StagingOeeResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "lineDesc" TEXT NOT NULL,
    "shift" INTEGER NOT NULL,
    "availability" REAL NOT NULL,
    "performance" REAL NOT NULL,
    "quality" REAL NOT NULL,
    "oee" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "StagingOeeResult_date_lineDesc_shift_key" ON "StagingOeeResult"("date", "lineDesc", "shift");
