-- CreateTable
CREATE TABLE "help_articles" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "page" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "help_articles_organizationId_idx" ON "help_articles"("organizationId");

-- CreateIndex
CREATE INDEX "help_articles_page_idx" ON "help_articles"("page");

-- AddForeignKey
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
