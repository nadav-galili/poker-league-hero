import { colors, getTheme } from "@/colors";
import Button from "@/components/Button";
import { Text } from "@/components/Text";
import { BASE_URL } from "@/constants";
import { useAuth } from "@/context/auth";
import { useLocalization } from "@/context/localization";
import { addBreadcrumb, captureException, setTag } from "@/utils/sentry";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

interface CashIn {
  id: string;
  amount: string;
  type: "buy_in" | "buy_out";
  createdAt: string;
  chipCount?: number;
  notes?: string;
}

interface GamePlayer {
  id: string;
  userId: string;
  fullName: string;
  profileImageUrl?: string;
  isActive: boolean;
  joinedAt: string;
  leftAt?: string;
  finalAmount?: string;
  profit?: string;
  cashIns: CashIn[];
  totalBuyIns: number;
  totalBuyOuts: number;
  currentProfit: number;
}

interface GameData {
  id: string;
  leagueId: string;
  createdBy: string;
  buyIn: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  players: GamePlayer[];
  totals: {
    totalBuyIns: number;
    totalBuyOuts: number;
    activePlayers: number;
    totalPlayers: number;
  };
}

interface LeagueMember {
  id: string;
  fullName: string;
  profileImageUrl?: string;
  role: "admin" | "member";
  joinedAt: string;
}

export default function GameScreen() {
  const theme = getTheme("light");
  const { t, isRTL } = useLocalization();
  const { fetchWithAuth } = useAuth();
  const { gameId } = useLocalSearchParams<{ gameId: string }>();

  const [game, setGame] = React.useState<GameData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  // Modal states
  const [showCashOutModal, setShowCashOutModal] = React.useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = React.useState(false);
  const [selectedPlayer, setSelectedPlayer] = React.useState<GamePlayer | null>(
    null
  );
  const [cashOutAmount, setCashOutAmount] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [availableMembers, setAvailableMembers] = React.useState<
    LeagueMember[]
  >([]);

  // Load game data
  const loadGameData = React.useCallback(async () => {
    if (!gameId) return;

    try {
      setError(null);
      if (!refreshing) setIsLoading(true);

      const response = await fetchWithAuth(
        `${BASE_URL}/api/games/${gameId}`,
        {}
      );

      if (!response.ok) {
        throw new Error("Failed to fetch game details");
      }

      const data = await response.json();
      setGame(data.game);

      addBreadcrumb("Game details loaded", "data", {
        screen: "GameScreen",
        gameId,
        playerCount: data.game.players?.length || 0,
        status: data.game.status,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load game details";
      setError(errorMessage);
      captureException(err as Error, {
        function: "loadGameData",
        screen: "GameScreen",
        gameId,
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [gameId, fetchWithAuth, refreshing]);

  React.useEffect(() => {
    loadGameData();
  }, [loadGameData]);

  React.useEffect(() => {
    addBreadcrumb("User visited Game screen", "navigation", {
      screen: "GameScreen",
      gameId,
      timestamp: new Date().toISOString(),
    });
    setTag("current_screen", "game");
  }, [gameId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadGameData();
  };

  const loadAvailableMembers = React.useCallback(async () => {
    if (!game?.leagueId) return;

    try {
      const response = await fetchWithAuth(
        `${BASE_URL}/api/leagues/${game.leagueId}/available-players`,
        {}
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available members");
      }

      const data = await response.json();
      // Filter out players already in the game
      const currentPlayerIds = game.players.map((p) => p.userId);
      const availableMembers = data.members.filter(
        (member: LeagueMember) => !currentPlayerIds.includes(member.id)
      );

      setAvailableMembers(availableMembers);
    } catch (error) {
      console.error("Error loading available members:", error);
    }
  }, [game?.leagueId, game?.players, fetchWithAuth]);

  const handleBack = () => {
    router.back();
  };

  const handleBuyIn = async (player: GamePlayer) => {
    if (!game) return;

    try {
      setIsProcessing(true);

      const response = await fetchWithAuth(
        `${BASE_URL}/api/games/${gameId}/buy-in`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: player.userId,
            amount: game.buyIn,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process buy-in");
      }

      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("buyInSuccessful"),
      });
      loadGameData(); // Refresh data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process buy-in";
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: errorMessage,
      });
      captureException(error as Error, {
        function: "handleBuyIn",
        screen: "GameScreen",
        gameId,
        playerId: player.userId,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCashOut = (player: GamePlayer) => {
    setSelectedPlayer(player);
    setCashOutAmount("");
    setShowCashOutModal(true);
  };

  const processCashOut = async () => {
    if (!selectedPlayer || !cashOutAmount.trim()) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("invalidAmount"),
      });
      return;
    }

    const amount = parseFloat(cashOutAmount);
    if (isNaN(amount) || amount < 0) {
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: t("invalidAmount"),
      });
      return;
    }

    try {
      setIsProcessing(true);

      const response = await fetchWithAuth(
        `${BASE_URL}/api/games/${gameId}/buy-out`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: selectedPlayer.userId,
            amount: amount.toString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process cash out");
      }

      const data = await response.json();
      Toast.show({
        type: "success",
        text1: t("success"),
        text2: `${t("playerCashedOut")} - ${t("profit")}: ₪${data.profit}`,
      });

      setShowCashOutModal(false);
      setSelectedPlayer(null);
      setCashOutAmount("");
      loadGameData(); // Refresh data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to process cash out";
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: errorMessage,
      });
      captureException(error as Error, {
        function: "processCashOut",
        screen: "GameScreen",
        gameId,
        playerId: selectedPlayer?.userId,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddPlayer = async (member: LeagueMember) => {
    try {
      setIsProcessing(true);

      const response = await fetchWithAuth(
        `${BASE_URL}/api/games/${gameId}/add-player`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: member.id,
            buyInAmount: game?.buyIn,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add player");
      }

      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("playerAdded"),
      });
      setShowAddPlayerModal(false);
      loadGameData(); // Refresh data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add player";
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: errorMessage,
      });
      captureException(error as Error, {
        function: "handleAddPlayer",
        screen: "GameScreen",
        gameId,
        playerId: member.id,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePlayer = (player: GamePlayer) => {
    // Note: This replaces the confirmation dialog with a direct action
    // For better UX, consider implementing a custom confirmation modal
    Toast.show({
      type: "info",
      text1: t("confirmRemovePlayer"),
      text2: t("removePlayerMessage"),
    });
    // Automatically proceed with removal after showing the message
    setTimeout(() => removePlayer(player), 1500);
  };

  const removePlayer = async (player: GamePlayer) => {
    try {
      setIsProcessing(true);

      const response = await fetchWithAuth(
        `${BASE_URL}/api/games/${gameId}/remove-player`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: player.userId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove player");
      }

      Toast.show({
        type: "success",
        text1: t("success"),
        text2: t("playerRemoved"),
      });
      loadGameData(); // Refresh data
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove player";
      Toast.show({
        type: "error",
        text1: t("error"),
        text2: errorMessage,
      });
      captureException(error as Error, {
        function: "removePlayer",
        screen: "GameScreen",
        gameId,
        playerId: player.userId,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openAddPlayerModal = () => {
    loadAvailableMembers();
    setShowAddPlayerModal(true);
  };

  const renderPlayerCard = ({ item }: { item: GamePlayer }) => (
    <View
      style={[styles.playerCard, { backgroundColor: theme.surfaceElevated }]}>
      {/* Player Info */}
      <View style={styles.playerHeader}>
        <Image
          source={{
            uri:
              item.profileImageUrl ||
              "https://via.placeholder.com/50x50/cccccc/666666?text=?",
          }}
          style={styles.playerImage}
          contentFit="cover"
        />
        <View style={styles.playerInfo}>
          <Text variant="h4" color={theme.text} style={styles.playerName}>
            {item.fullName}
          </Text>
          <Text
            variant="body"
            color={theme.textMuted}
            style={styles.playerStatus}>
            {item.isActive ? t("gameInProgress") : "Inactive"}
          </Text>
        </View>
        {!item.isActive && (
          <View
            style={[
              styles.inactiveIndicator,
              { backgroundColor: theme.textMuted },
            ]}>
            <Text variant="captionSmall" color={colors.textInverse}>
              OUT
            </Text>
          </View>
        )}
      </View>

      {/* Player Stats */}
      <View style={styles.playerStats}>
        <View style={styles.statItem}>
          <Text variant="captionSmall" color={theme.textMuted}>
            {t("initialBuyIn")}
          </Text>
          <Text variant="h4" color={colors.primary}>
            ₪{game?.buyIn}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="captionSmall" color={theme.textMuted}>
            {t("totalBuyIns")}
          </Text>
          <Text variant="h4" color={theme.text}>
            ₪{item.totalBuyIns}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="captionSmall" color={theme.textMuted}>
            {t("totalBuyOuts")}
          </Text>
          <Text variant="h4" color={theme.text}>
            ₪{item.totalBuyOuts}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text variant="captionSmall" color={theme.textMuted}>
            {t("currentProfit")}
          </Text>
          <Text
            variant="h4"
            color={item.currentProfit >= 0 ? colors.success : colors.error}
            style={styles.profitText}>
            ₪{item.currentProfit.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      {item.isActive && (
        <View style={styles.playerActions}>
          <Button
            title={t("buyIn")}
            onPress={() => handleBuyIn(item)}
            variant="outline"
            size="small"
            disabled={isProcessing}
            style={styles.actionButton}
          />
          <Button
            title={t("cashOut")}
            onPress={() => handleCashOut(item)}
            variant="primary"
            size="small"
            backgroundColor={colors.secondary}
            disabled={isProcessing}
            style={styles.actionButton}
          />
          <TouchableOpacity
            onPress={() => handleRemovePlayer(item)}
            style={[styles.removeButton, { backgroundColor: colors.error }]}
            disabled={isProcessing}>
            <Ionicons
              name="remove-circle"
              size={20}
              color={colors.textInverse}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={24}
              color={colors.textInverse}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
            {t("gameDetails")}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text
            variant="body"
            color={theme.textMuted}
            style={styles.loadingText}>
            {t("loadingGame")}
          </Text>
        </View>
      </View>
    );
  }

  if (error || !game) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons
              name={isRTL ? "arrow-forward" : "arrow-back"}
              size={24}
              color={colors.textInverse}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
            {t("gameDetails")}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.errorContainer}>
          <Text variant="h3" color={theme.error} style={styles.errorTitle}>
            {t("error")}
          </Text>
          <Text
            variant="body"
            color={theme.textMuted}
            style={styles.errorMessage}>
            {error || t("gameNotFound")}
          </Text>
          <Button
            title={t("retry")}
            onPress={loadGameData}
            variant="outline"
            size="small"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={24}
            color={colors.textInverse}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textInverse }]}>
          {t("gameDetails")}
        </Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={colors.textInverse} />
        </TouchableOpacity>
      </View>

      {/* Game Summary */}
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: theme.surfaceElevated },
        ]}>
        <View style={styles.summaryHeader}>
          <Text variant="h3" color={theme.text} style={styles.summaryTitle}>
            {t("gameInProgress")}
          </Text>
          <View
            style={[styles.statusBadge, { backgroundColor: colors.success }]}>
            <Text variant="captionSmall" color={colors.textInverse}>
              {game.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.summaryStatItem}>
            <Text variant="h2" color={colors.primary}>
              ₪{game.totals.totalBuyIns}
            </Text>
            <Text variant="captionSmall" color={theme.textMuted}>
              {t("totalBuyIns")}
            </Text>
          </View>
          <View style={styles.summaryStatItem}>
            <Text variant="h2" color={colors.secondary}>
              ₪{game.totals.totalBuyOuts}
            </Text>
            <Text variant="captionSmall" color={theme.textMuted}>
              {t("totalBuyOuts")}
            </Text>
          </View>
          <View style={styles.summaryStatItem}>
            <Text variant="h2" color={theme.text}>
              {game.totals.activePlayers}
            </Text>
            <Text variant="captionSmall" color={theme.textMuted}>
              Active Players
            </Text>
          </View>
        </View>
      </View>

      {/* Players List */}
      <FlatList
        data={game.players}
        renderItem={renderPlayerCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.playersList}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ItemSeparatorComponent={() => <View style={styles.playerSeparator} />}
      />

      {/* Add Player Button */}
      <TouchableOpacity
        style={[styles.addPlayerButton, { backgroundColor: colors.primary }]}
        onPress={openAddPlayerModal}
        disabled={isProcessing}>
        <Ionicons name="person-add" size={24} color={colors.textInverse} />
        <Text
          variant="labelSmall"
          color={colors.textInverse}
          style={styles.addPlayerText}>
          {t("addPlayer")}
        </Text>
      </TouchableOpacity>

      {/* Cash Out Modal */}
      <Modal
        visible={showCashOutModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCashOutModal(false)}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.background },
          ]}>
          <View
            style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
            <TouchableOpacity
              onPress={() => setShowCashOutModal(false)}
              style={styles.modalBackButton}>
              <Ionicons name="close" size={24} color={colors.textInverse} />
            </TouchableOpacity>
            <Text
              style={[styles.modalHeaderTitle, { color: colors.textInverse }]}>
              {t("confirmCashOut")}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedPlayer && (
              <>
                <View
                  style={[
                    styles.selectedPlayerCard,
                    { backgroundColor: theme.surfaceElevated },
                  ]}>
                  <Image
                    source={{
                      uri:
                        selectedPlayer.profileImageUrl ||
                        "https://via.placeholder.com/50x50/cccccc/666666?text=?",
                    }}
                    style={styles.selectedPlayerImage}
                    contentFit="cover"
                  />
                  <Text
                    variant="h3"
                    color={theme.text}
                    style={styles.selectedPlayerName}>
                    {selectedPlayer.fullName}
                  </Text>
                </View>

                <Text
                  variant="body"
                  color={theme.text}
                  style={styles.cashOutInstruction}>
                  {t("enterCashOutAmount")}
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    { backgroundColor: theme.surface },
                  ]}>
                  <Text
                    variant="h4"
                    color={theme.text}
                    style={styles.inputLabel}>
                    {t("cashOutAmount")}
                  </Text>
                  <TextInput
                    style={[
                      styles.amountInput,
                      { color: theme.text, borderColor: theme.border },
                    ]}
                    value={cashOutAmount}
                    onChangeText={setCashOutAmount}
                    placeholder="0.00"
                    placeholderTextColor={theme.textMuted}
                    keyboardType="numeric"
                    autoFocus
                  />
                  <Text
                    variant="captionSmall"
                    color={theme.textMuted}
                    style={styles.inputHint}>
                    Current Buy-ins: ₪{selectedPlayer.totalBuyIns}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>

          <View
            style={[styles.modalFooter, { backgroundColor: theme.background }]}>
            <Button
              title={isProcessing ? "Processing..." : t("confirmCashOut")}
              onPress={processCashOut}
              variant="primary"
              size="large"
              backgroundColor={colors.secondary}
              disabled={isProcessing || !cashOutAmount.trim()}
              fullWidth
            />
          </View>
        </View>
      </Modal>

      {/* Add Player Modal */}
      <Modal
        visible={showAddPlayerModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddPlayerModal(false)}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.background },
          ]}>
          <View
            style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
            <TouchableOpacity
              onPress={() => setShowAddPlayerModal(false)}
              style={styles.modalBackButton}>
              <Ionicons name="close" size={24} color={colors.textInverse} />
            </TouchableOpacity>
            <Text
              style={[styles.modalHeaderTitle, { color: colors.textInverse }]}>
              {t("selectPlayerToAdd")}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <FlatList
            data={availableMembers}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.memberCard,
                  { backgroundColor: theme.surfaceElevated },
                ]}
                onPress={() => handleAddPlayer(item)}
                disabled={isProcessing}>
                <Image
                  source={{
                    uri:
                      item.profileImageUrl ||
                      "https://via.placeholder.com/50x50/cccccc/666666?text=?",
                  }}
                  style={styles.memberImage}
                  contentFit="cover"
                />
                <View style={styles.memberInfo}>
                  <Text
                    variant="h4"
                    color={theme.text}
                    style={styles.memberName}>
                    {item.fullName}
                  </Text>
                  <Text
                    variant="body"
                    color={theme.textMuted}
                    style={styles.memberRole}>
                    {item.role.toUpperCase()}
                  </Text>
                </View>
                <Ionicons
                  name={isRTL ? "chevron-back" : "chevron-forward"}
                  size={24}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.membersList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <View style={styles.memberSeparator} />
            )}
            ListEmptyComponent={
              <View style={styles.emptyMembersContainer}>
                <Text
                  variant="h3"
                  color={theme.text}
                  style={styles.emptyMembersTitle}>
                  No Available Players
                </Text>
                <Text
                  variant="body"
                  color={theme.textMuted}
                  style={styles.emptyMembersMessage}>
                  All league members are already in this game.
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 6,
    borderBottomColor: colors.text,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
  },
  backButton: {
    padding: 8,
  },
  refreshButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  placeholder: {
    width: 40,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryTitle: {
    letterSpacing: 1.2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.text,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryStatItem: {
    alignItems: "center",
  },
  playersList: {
    padding: 16,
    paddingTop: 0,
  },
  playerSeparator: {
    height: 12,
  },
  playerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  playerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  playerStatus: {
    fontSize: 12,
  },
  inactiveIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.text,
  },
  playerStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  profitText: {
    fontWeight: "700",
  },
  playerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.text,
  },
  addPlayerButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: colors.text,
    shadowColor: colors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  addPlayerText: {
    marginLeft: 8,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorTitle: {
    textAlign: "center",
    marginBottom: 12,
  },
  errorMessage: {
    textAlign: "center",
    marginBottom: 24,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 6,
    borderBottomColor: colors.text,
  },
  modalBackButton: {
    padding: 8,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  selectedPlayerCard: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
    marginBottom: 16,
  },
  selectedPlayerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 8,
  },
  selectedPlayerName: {
    letterSpacing: 0.5,
  },
  cashOutInstruction: {
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
    marginBottom: 16,
  },
  inputLabel: {
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  inputHint: {
    textAlign: "center",
  },
  modalFooter: {
    padding: 16,
    paddingBottom: 32,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
  },
  // Add Player Modal Styles
  membersList: {
    padding: 16,
  },
  memberSeparator: {
    height: 8,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  memberImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  emptyMembersContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyMembersTitle: {
    textAlign: "center",
    marginBottom: 12,
  },
  emptyMembersMessage: {
    textAlign: "center",
  },
});
