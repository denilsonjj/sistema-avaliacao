-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "technicalKnowledge" TEXT NOT NULL,
    "certifications" TEXT NOT NULL,
    "experienceTime" TEXT NOT NULL,
    "serviceQuality" TEXT NOT NULL,
    "executionTimeframe" TEXT NOT NULL,
    "problemSolvingInitiative" TEXT NOT NULL,
    "teamwork" TEXT NOT NULL,
    "commitment" TEXT NOT NULL,
    "proactivity" TEXT NOT NULL,
    "availability" REAL NOT NULL,
    "performance" REAL NOT NULL,
    "quality" REAL NOT NULL,
    CONSTRAINT "Evaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
