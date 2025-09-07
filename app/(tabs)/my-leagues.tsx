import { useMyLeagues } from "@/hooks";
import { getTheme } from "@/colors";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LeagueCard } from "@/components/LeagueCard";
import { LoadingState } from "@/components/LoadingState";
import { MyLeaguesHeader } from "@/components/MyLeaguesHeader";
import { Text } from "@/components/Text";
import { captureException } from "@/utils/sentry";
import React from "react";
import { FlatList, View } from "react-native";

export default function MyLeagues() {
  const theme = getTheme("light");

  const {
    leagues,
    isLoading,
    error,
    loadLeagues,
    handleCreateLeague,
    handleJoinLeague,
    handleShareLeague,
    handleLeaguePress,
  } = useMyLeagues();

  // Render function for league cards
  const renderLeagueCard = React.useCallback(
    ({ item }: { item: any }) => {
      try {
        return (
          <LeagueCard
            league={item}
            onPress={handleLeaguePress}
            onShare={handleShareLeague}
          />
        );
      } catch (error) {
        captureException(error as Error, {
          function: "renderLeagueCard",
          screen: "MyLeagues",
          leagueId: item.id,
          leagueName: item.name,
        });
        // Return a fallback UI
        return (
          <View className="bg-error/10 border-2 border-error rounded-xl p-5 mx-4 items-center justify-center min-h-[100px]">
            <Text>Error loading league card</Text>
          </View>
        );
      }
    },
    [handleLeaguePress, handleShareLeague]
  );

  return (
    <View className="flex-1 bg-background">
      <MyLeaguesHeader
        onJoinLeague={handleJoinLeague}
        onCreateLeague={handleCreateLeague}
      />

      {/* Loading State */}
      {isLoading && <LoadingState />}

      {/* Error State */}
      {error && !isLoading && (
        <ErrorState error={error} onRetry={loadLeagues} />
      )}

      {/* Leagues List */}
      {!isLoading && !error && (
        <FlatList
          data={leagues}
          renderItem={renderLeagueCard}
          keyExtractor={(item) => item.id}
          contentContainerClassName={`p-5 gap-4 ${leagues.length === 0 ? "flex-grow justify-center" : ""}`}
          onScrollToIndexFailed={(info) => {
            captureException(new Error("FlatList scroll to index failed"), {
              function: "FlatList.onScrollToIndexFailed",
              screen: "MyLeagues",
              index: info.index,
              highestMeasuredFrameIndex: info.highestMeasuredFrameIndex,
              averageItemLength: info.averageItemLength,
            });
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              onCreateLeague={handleCreateLeague}
              onJoinLeague={handleJoinLeague}
            />
          }
        />
      )}
    </View>
  );
}
