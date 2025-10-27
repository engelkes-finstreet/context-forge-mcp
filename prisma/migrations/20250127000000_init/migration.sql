-- CreateTable
CREATE TABLE "ComponentQuery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "componentName" TEXT NOT NULL,
    "sessionId" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "successful" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT
);

-- CreateTable
CREATE TABLE "ComponentCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "componentName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lastFetched" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE INDEX "ComponentQuery_componentName_idx" ON "ComponentQuery"("componentName");

-- CreateIndex
CREATE INDEX "ComponentQuery_timestamp_idx" ON "ComponentQuery"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ComponentCache_componentName_key" ON "ComponentCache"("componentName");

-- CreateIndex
CREATE INDEX "ComponentCache_lastFetched_idx" ON "ComponentCache"("lastFetched");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_active_idx" ON "Session"("active");
