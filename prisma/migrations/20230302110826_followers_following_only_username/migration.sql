/*
  Warnings:

  - The primary key for the `follower` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `follower` table. All the data in the column will be lost.
  - The primary key for the `following` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `following` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_follower" (
    "username" TEXT NOT NULL,
    CONSTRAINT "follower_username_fkey" FOREIGN KEY ("username") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_follower" ("username") SELECT "username" FROM "follower";
DROP TABLE "follower";
ALTER TABLE "new_follower" RENAME TO "follower";
CREATE UNIQUE INDEX "follower_username_key" ON "follower"("username");
CREATE TABLE "new_following" (
    "username" TEXT NOT NULL,
    CONSTRAINT "following_username_fkey" FOREIGN KEY ("username") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_following" ("username") SELECT "username" FROM "following";
DROP TABLE "following";
ALTER TABLE "new_following" RENAME TO "following";
CREATE UNIQUE INDEX "following_username_key" ON "following"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
