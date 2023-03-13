-- CreateTable
CREATE TABLE "follower" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    CONSTRAINT "follower_username_fkey" FOREIGN KEY ("username") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "following" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    CONSTRAINT "following_username_fkey" FOREIGN KEY ("username") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "follower_username_key" ON "follower"("username");

-- CreateIndex
CREATE UNIQUE INDEX "following_username_key" ON "following"("username");
