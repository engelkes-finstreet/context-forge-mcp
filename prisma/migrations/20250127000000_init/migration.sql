-- CreateTable
CREATE TABLE "ComponentQuery" (
    "id" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "sessionId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "successful" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,

    CONSTRAINT "ComponentQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentCache" (
    "id" TEXT NOT NULL,
    "componentName" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponentCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
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
