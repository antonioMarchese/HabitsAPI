/*
  Warnings:

  - A unique constraint covering the columns `[user_id,username]` on the table `follower` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,username]` on the table `following` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "follower_user_id_key";

-- DropIndex
DROP INDEX "following_user_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "follower_user_id_username_key" ON "follower"("user_id", "username");

-- CreateIndex
CREATE UNIQUE INDEX "following_user_id_username_key" ON "following"("user_id", "username");
