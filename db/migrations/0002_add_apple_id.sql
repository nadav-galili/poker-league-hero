ALTER TABLE "users" ADD COLUMN "apple_id" varchar(200);
ALTER TABLE "users" ADD CONSTRAINT "users_apple_id_unique" UNIQUE("apple_id");
