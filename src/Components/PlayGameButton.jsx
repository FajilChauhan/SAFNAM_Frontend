import React, { useState, useEffect } from "react";
import api from "../services/api";
import { getUserIdFromToken } from "../utils/Auth";

const PlayGameButton = () => {
  const [showGame, setShowGame] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [tapVisible, setTapVisible] = useState(false);
  const [tapStyle, setTapStyle] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [todayDiscount, setTodayDiscount] = useState(null);

  const userId = getUserIdFromToken();

  // ✅ Check if user already played
  useEffect(() => {
    if (!userId) return;

    api.get(`/gamediscount/${userId}`)
      .then(res => {
        if (res.data) setTodayDiscount(res.data);
      })
      .catch(() => {});
  }, [userId]);

  // --- START GAME ---
  const startGame = () => {

    if (todayDiscount) {
      alert("🎮 You have already played today!");
      return;
    }

    setShowGame(true);
    setGameStarted(false);
    setTapVisible(false);

    const delay = Math.random() * 2000 + 1000;

    setTimeout(() => {
      const randomTop = Math.random() * 60 + 20;
      const randomLeft = Math.random() * 60 + 20;
      const randomColor = `hsl(${Math.random() * 360},80%,55%)`;

      setTapStyle({
        top: `${randomTop}%`,
        left: `${randomLeft}%`,
        backgroundColor: randomColor
      });

      setTapVisible(true);
      setGameStarted(true);
      setStartTime(Date.now());

    }, delay);
  };

  // --- TAP EVENT ---
  const handleTap = async () => {

    if (!gameStarted) return;

    const reactionTime = (Date.now() - startTime) / 1000;
    let earnedDiscount = 0;
    let points = 0;

    if (reactionTime <= 0.75) {
      earnedDiscount = 15;
      points = 150;
    }
    else if (reactionTime <= 1.5) {
      earnedDiscount = 10;
      points = 100;
    }
    else if (reactionTime <= 2.5) {
      earnedDiscount = 5;
      points = 50;
    }

    setShowGame(false);
    setGameStarted(false);

    try {

      await api.post("/gamediscount", {
        userId: userId,
        gamePoint: points,
        discount: earnedDiscount
      });

      setTodayDiscount({
        discount: earnedDiscount,
        applied: false
      });

      if (earnedDiscount > 0) {
        alert(`⚡ You tapped in ${reactionTime.toFixed(2)}s and earned ${earnedDiscount}% discount!`);
      }
      else {
        alert(`😢 Too slow (${reactionTime.toFixed(2)}s). No discount.`);
      }

    } catch (err) {
      console.error(err);
      alert("Failed to save game result");
    }

  };

  return (
    <div className="text-center">

      <button
        onClick={startGame}
        className={`mt-[20px] px-7 py-4 rounded-full font-medium transition-all ${
          todayDiscount
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-orange-500 hover:bg-orange-600 text-white"
        }`}
      >
        {todayDiscount
          ? `✅ ${todayDiscount.discount}% Discount Earned`
          : "🎮 Play Game to Win Discount"}
      </button>

      {/* GAME POPUP */}
      {showGame && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="relative bg-white p-6 rounded-2xl shadow-lg w-[500px] h-[500px] flex flex-col items-center justify-center text-center">

            {!tapVisible && (
              <p className="text-lg font-semibold text-gray-700">
                Wait for “TAP NOW!”...
              </p>
            )}

            {tapVisible && (
              <button
                onClick={handleTap}
                className="absolute px-3 py-3 text-white font-bold rounded-full shadow-md hover:scale-110 transition-transform"
                style={tapStyle}
              >
                TAP NOW!
              </button>
            )}

            <button
              onClick={() => setShowGame(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
            >
              ✖
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default PlayGameButton;