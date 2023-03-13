/*
  Warnings:

  - Added the required column `user_id` to the `following` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `follower` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_following" (
    "username" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "following_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_following" ("username") SELECT "username" FROM "following";
DROP TABLE "following";
ALTER TABLE "new_following" RENAME TO "following";
CREATE UNIQUE INDEX "following_user_id_key" ON "following"("user_id");
CREATE TABLE "new_follower" (
    "username" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "follower_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_follower" ("username") SELECT "username" FROM "follower";
DROP TABLE "follower";
ALTER TABLE "new_follower" RENAME TO "follower";
CREATE UNIQUE INDEX "follower_user_id_key" ON "follower"("user_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
