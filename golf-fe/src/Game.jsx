import { useGame } from "./context/useGame";
import PlayerHands from "./PlayerHands";
import TheDayThat from "./TheDayThat";
import styles from "./Game.module.css";
import { useState, useEffect } from "react";
import CardBackSelect from "./CardBackSelect";

function Game({ gameId, playerId, isLobbyHost }) {
  const {
    setLobbyStatus,
    currentHole,
    drawnCard,
    discardPile,
    currentPlayerId,
    currentPlayerName,
    prevFirstPlayer,
    initializingGame,
    selectedDiscardPile,
    setSelectedDiscardPile,
    roundScores,
    allRoundScores,
    roundOver,
    gameOver,
    performAction,
    displayCardContent,
  } = useGame();

  const [checkingHistory, setCheckingHistory] = useState(false);

  const handleDrawCard = () => {
    console.log("Drawing card for player:", playerId);

    performAction("draw_card", { player_id: playerId });
  };

  const handleDiscardPileClick = (card = null) => {
    if (!isPlayerTurn) {
      console.log("wait your turn");
      return;
    }
    if (drawnCard) {
      console.log("discarding drawn card");
      performAction("discard_card", { player_id: playerId });
    } else {
      setSelectedDiscardPile(card);
    }
  };

  const isPlayerTurn = currentPlayerId === playerId;

  const sortedRoundScores =
    roundScores.length > 0
      ? [...roundScores].sort((a, b) => a.round_score - b.round_score)
      : [];

  const roundWinner =
    sortedRoundScores.length > 0 ? sortedRoundScores[0].player_name : null;

  const sortedTotalScores =
    allRoundScores.length > 0
      ? [...allRoundScores].sort((a, b) => a.total_score - b.total_score)
      : [];

  const gameWinner =
    sortedTotalScores.length > 0 ? sortedTotalScores[0].player_name : null;

  const setDrawnCardClass = () => {
    let classes = "card";
    if (isPlayerTurn) classes += " clickable";

    if (drawnCard) {
      classes += " revealed selected";

      if (drawnCard.suit === "☆") {
        classes += " joker";
      } else {
        drawnCard.suit === "♥︎" || drawnCard.suit === "♦︎"
          ? (classes += " red")
          : (classes += " black");
      }
    } else {
      classes += " hidden";
    }
    return classes;
  };

  const setDiscardPileCardClass = (card, index) => {
    let classes = "card hidden-history";
    if (index === discardPile.length - 1 && isPlayerTurn && !initializingGame)
      classes += " clickable";
    if (selectedDiscardPile) {
      classes += " selected";
    }
    if (checkingHistory) {
      classes = classes.replace(/\bhidden-history\b/, "").trim();
    }
    if (card.suit === "☆") {
      classes += " joker";
    } else {
      card.suit === "♥︎" || card.suit === "♦︎"
        ? (classes += " red")
        : (classes += " black");
    }

    return classes;
  };

  const backgrounds = {
    none: "/assets/default-img.jpg",
    trans: "/assets/bg-1.jpg",
    wood: "/assets/bg-2.jpg",
    leaves: "/assets/bg-3.jpg",
    pool: "/assets/bg-4.jpg",
    cow: "/assets/bg-5.jpg",
    marble: "/assets/bg-6.jpg",
    blues: "/assets/bg-7.jpg",
    giraffe: "/assets/bg-8.jpg",
  };

  const [backgroundUrl, setBackgroundUrl] = useState("default-image.jpg");

  const updateBackgroundImage = (newUrl) => {
    console.log("background updated (Game.jsx) to", newUrl);
    setBackgroundUrl(newUrl);
  };

  useEffect(() => {
    console.log("Updated background URL:", backgroundUrl);
  }, [backgroundUrl]);

  if (!gameId) {
    return null;
  }

  if (initializingGame) {
    return (
      <div className={styles.game_page}>
        <CardBackSelect
          updateBackground={updateBackgroundImage}
          backgrounds={backgrounds}
        />
        <div className={styles.game_container}>
          <TheDayThat />

          <h2>Hole: {currentHole} / 9</h2>
          <div
            style={{ left: "50%" }}
            className={styles.draw_and_discard_piles_container}
          >
            <div className={styles.draw_and_discard_piles}>
              <div>
                <div className="card hidden"></div>
              </div>
              <div style={{ display: "flex" }}>
                <div className="card"></div>
                {discardPile.map((card, index) => {
                  return (
                    <div
                      className={setDiscardPileCardClass(card, index)}
                      key={index}
                      onClick={
                        index === discardPile.length - 1
                          ? handleDiscardPileClick
                          : null
                      }
                    >
                      <div className={styles.card_content_container}>
                        <p>
                          {card.rank}
                          {card.suit}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <PlayerHands playerId={playerId} backgroundUrl={backgroundUrl} />
        </div>
      </div>
    );
  }

  if (roundOver && roundScores.length > 0) {
    console.log("round scores:", roundScores);

    return (
      <div className={styles.game_container}>
        <TheDayThat />

        <h2 className={styles.hole_completed}>Hole {currentHole} Completed</h2>

        <div className={styles.results_container}>
          <div className={styles.left_col}>
            <h3 className={styles.round_winner}>Round winner: {roundWinner}</h3>

            <table>
              <tbody>
                <tr>
                  <th>Player</th>
                  <th>Score</th>
                </tr>
                {roundScores.map((player) => {
                  return (
                    <tr key={player.player_id}>
                      <th>{player.player_name}</th>
                      <td>{player.round_score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.right_col}>
            <PlayerHands playerId={playerId} backgroundUrl={backgroundUrl} />
          </div>
        </div>

        {isLobbyHost ? (
          <button
            className={styles.next_hole_btn}
            onClick={() =>
              performAction("setup_hole", {
                prev_first_player_id: prevFirstPlayer,
              })
            }
          >
            Next Hole
          </button>
        ) : (
          <p className={styles.information}>
            Waiting for host to start next round...
          </p>
        )}
      </div>
    );
  }

  if (gameOver && allRoundScores.length > 0) {
    console.log("all round scores:", allRoundScores);
    return (
      <div className={styles.game_container}>
        <TheDayThat />

        <h2 className={styles.game_over}>Game Over</h2>

        <table>
          <tbody>
            <tr>
              <th>Player</th>
              {allRoundScores[0].round_scores.map((_, index) => {
                return <th key={index}>Hole #{index + 1}</th>;
              })}
              <th>Score</th>
            </tr>

            {allRoundScores.map((player) => {
              return (
                <tr key={player.player_id}>
                  <th>{player.player_name}</th>

                  {player.round_scores.map((score, index) => {
                    return <td key={index}>{score}</td>;
                  })}

                  <td>{player.round_scores.reduce((a, b) => a + b, 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className={styles.placements_container}>
          <h3>Placements</h3>
          <div className={styles.placements}>
            {sortedTotalScores.map((player, index) => {
              return (
                <p key={index}>
                  {index + 1}: {player.player_name}
                </p>
              );
            })}
          </div>

          <h3 className={styles.winner}>Winner:</h3>
          <h3 className={styles.winner_name}>{gameWinner}</h3>
        </div>

        <button
          onClick={() => {
            setLobbyStatus("");
          }}
        >
          Main Menu
        </button>
      </div>
    );
  }

  return (
    <div className={styles.game_page}>
      <CardBackSelect
        updateBackground={updateBackgroundImage}
        backgrounds={backgrounds}
      />
      <div className={styles.game_container}>
        <TheDayThat />

        <h2>Hole: {currentHole} / 9</h2>

        <div
          style={{ left: "51%" }}
          className={styles.draw_and_discard_piles_container}
        >
          <div>
            {!isPlayerTurn && (
              <h3 className={styles.turn_message}>
                Waiting for {currentPlayerName}'s turn...
              </h3>
            )}
          </div>
          <div className={styles.draw_and_discard_piles}>
            <div>
              <div
                className={setDrawnCardClass()}
                onClick={isPlayerTurn && !drawnCard ? handleDrawCard : null}
              >
                {drawnCard && (
                  <div className="card-content-container">
                    <p>{displayCardContent(drawnCard)}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className={styles.discard_pile_container}>
                <div className="card"></div>
                {discardPile.map((card, index) => {
                  return (
                    <div
                      className={setDiscardPileCardClass(card, index)}
                      key={index}
                      onClick={
                        index === discardPile.length - 1
                          ? handleDiscardPileClick
                          : null
                      }
                    >
                      <div className="card-content-container">
                        <p>
                          {card.rank}
                          {card.suit}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <button
                  style={{
                    transform: checkingHistory ? "rotate(-180deg)" : "",
                    transition: "transform .35s",
                  }}
                  className={styles.history_btn}
                  onClick={() => setCheckingHistory(!checkingHistory)}
                >
                  🞂
                </button>
              </div>
            </div>
          </div>
        </div>

        <PlayerHands playerId={playerId} backgroundUrl={backgroundUrl} />
      </div>
    </div>
  );
}

export default Game;
