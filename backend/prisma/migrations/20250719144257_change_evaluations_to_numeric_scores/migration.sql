/*
  Warnings:

  - You are about to drop the column `certifications` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `commitment` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `executionTimeframe` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `experienceTime` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `proactivity` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `problemSolvingInitiative` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `serviceQuality` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `teamwork` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `technicalKnowledge` on the `Evaluation` table. All the data in the column will be lost.
  - Added the required column `certifications_notes` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commitment_score` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `executionTimeframe_score` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `experienceTime_notes` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proactivity_score` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `problemSolvingInitiative_score` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceQuality_score` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamwork_score` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `technicalKnowledge_notes` to the `Evaluation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Evaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "technicalKnowledge_notes" TEXT NOT NULL,
    "certifications_notes" TEXT NOT NULL,
    "experienceTime_notes" TEXT NOT NULL,
    "serviceQuality_score" INTEGER NOT NULL,
    "executionTimeframe_score" INTEGER NOT NULL,
    "problemSolvingInitiative_score" INTEGER NOT NULL,
    "teamwork_score" INTEGER NOT NULL,
    "commitment_score" INTEGER NOT NULL,
    "proactivity_score" INTEGER NOT NULL,
    "availability" REAL NOT NULL,
    "performance" REAL NOT NULL,
    "quality" REAL NOT NULL,
    CONSTRAINT "Evaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Evaluation" ("availability", "createdAt", "id", "performance", "quality", "updatedAt", "userId") SELECT "availability", "createdAt", "id", "performance", "quality", "updatedAt", "userId" FROM "Evaluation";
DROP TABLE "Evaluation";
ALTER TABLE "new_Evaluation" RENAME TO "Evaluation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
