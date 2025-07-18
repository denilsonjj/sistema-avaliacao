-- CreateTable
CREATE TABLE "SelfAssessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "improvementPoints" TEXT NOT NULL,
    "professionalGoals" TEXT NOT NULL,
    CONSTRAINT "SelfAssessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
