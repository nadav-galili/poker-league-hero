CREATE INDEX "cash_ins_game_idx" ON "cash_ins" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "cash_ins_game_player_idx" ON "cash_ins" USING btree ("game_player_id");--> statement-breakpoint
CREATE INDEX "game_players_game_idx" ON "game_players" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "game_players_user_idx" ON "game_players" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_players_game_user_idx" ON "game_players" USING btree ("game_id","user_id");--> statement-breakpoint
CREATE INDEX "games_league_idx" ON "games" USING btree ("league_id");--> statement-breakpoint
CREATE INDEX "games_creator_idx" ON "games" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "games_league_status_ended_at_idx" ON "games" USING btree ("league_id","status","ended_at");--> statement-breakpoint
CREATE INDEX "league_members_league_idx" ON "league_members" USING btree ("league_id");--> statement-breakpoint
CREATE INDEX "league_members_user_idx" ON "league_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "league_members_league_user_active_idx" ON "league_members" USING btree ("league_id","user_id","is_active");--> statement-breakpoint
CREATE INDEX "leagues_admin_idx" ON "leagues" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "leagues_invite_code_idx" ON "leagues" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_google_id_idx" ON "users" USING btree ("google_id");