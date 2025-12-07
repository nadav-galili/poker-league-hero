TRUNCATE TABLE "summaries";
ALTER TABLE "summaries" ALTER COLUMN "content" SET DATA TYPE json USING content::json;