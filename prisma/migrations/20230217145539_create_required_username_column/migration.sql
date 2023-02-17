/*
  Warnings:

  - Made the column `username` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "created_at" DATETIME NOT NULL,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_users" ("avatar", "created_at", "email", "first_name", "id", "last_name", "password", "phone", "updated_at", "username") SELECT "avatar", "created_at", "email", "first_name", "id", "last_name", "password", "phone", "updated_at", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
