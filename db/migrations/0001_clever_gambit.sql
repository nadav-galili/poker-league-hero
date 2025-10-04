CREATE TYPE "public"."game_status" AS ENUM('active', 'completed');--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "status" SET DEFAULT 'active'::"public"."game_status";--> statement-breakpoint
ALTER TABLE "games" ALTER COLUMN "status" SET DATA TYPE "public"."game_status" USING "status"::"public"."game_status";