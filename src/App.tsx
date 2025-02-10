import React, { useState, useEffect, useCallback } from "react";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 30; // 30 celdas por fila y columna
const CELL_SIZE = 25; // Cada celda mide 25px
const BOARD_WIDTH = GRID_SIZE * CELL_SIZE; // 750px
const BOARD_HEIGHT = GRID_SIZE * CELL_SIZE; // 750px

// La posición inicial se centra en la cuadrícula
const INITIAL_SNAKE: Position[] = [
  { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) },
];
const INITIAL_DIRECTION: Direction = "RIGHT";

const SCORE_PER_LEVEL = 5;
const MAX_LEVEL = 10;
const BASE_SPEED = 200;
const SPEED_DECREMENT = 15;

const ClassicSnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(generateRandomPosition());
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [level, setLevel] = useState<number>(1);
  const [intervalDelay, setIntervalDelay] = useState<number>(BASE_SPEED);
  const [scale, setScale] = useState<number>(1);

  // El puntaje se calcula como (longitud de la serpiente - 1)
  const score = snake.length - 1;

  // Genera una posición aleatoria dentro de la cuadrícula (0 a GRID_SIZE - 1)
  function generateRandomPosition(): Position {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }

  // Verifica si la posición está fuera de la cuadrícula o colisiona con la serpiente
  const checkCollision = (pos: Position): boolean => {
    return (
      pos.x < 0 ||
      pos.x >= GRID_SIZE ||
      pos.y < 0 ||
      pos.y >= GRID_SIZE ||
      snake.some((segment) => segment.x === pos.x && segment.y === pos.y)
    );
  };

  // Mueve la serpiente según la dirección actual
  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }

      // Si la cabeza está fuera de límites o choca con el cuerpo, termina el juego
      if (checkCollision(head)) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      // Si la serpiente come la comida
      if (head.x === food.x && head.y === food.y) {
        let newFood = generateRandomPosition();
        // Asegurarse de que la nueva comida no se genere sobre la serpiente
        while (
          newSnake.some(
            (segment) => segment.x === newFood.x && segment.y === newFood.y
          )
        ) {
          newFood = generateRandomPosition();
        }
        setFood(newFood);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, snake]);

  // Resetea el juego
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setFood(generateRandomPosition());
    setLevel(1);
    setIntervalDelay(BASE_SPEED);
  };

  // Actualiza nivel y velocidad en función del puntaje
  const calculateLevel = (score: number): number =>
    Math.min(MAX_LEVEL, Math.floor(score / SCORE_PER_LEVEL) + 1);

  const calculateSpeed = (level: number): number =>
    Math.max(50, BASE_SPEED - (level - 1) * SPEED_DECREMENT);

  useEffect(() => {
    const newLevel = calculateLevel(score);
    if (newLevel !== level) {
      setLevel(newLevel);
      setIntervalDelay(calculateSpeed(newLevel));
    }
  }, [score, level]);

  // Maneja las teclas: se previene el comportamiento por defecto para evitar scroll
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault(); // Evita que el navegador haga scroll
      }
      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction]);

  // Bucle del juego: se ejecuta según el intervalo definido (según la velocidad)
  useEffect(() => {
    if (gameOver) return;
    const gameLoop = setInterval(moveSnake, intervalDelay);
    return () => clearInterval(gameLoop);
  }, [moveSnake, intervalDelay, gameOver]);

  // Calcula y actualiza el factor de escala para que el tablero se ajuste al viewport
  useEffect(() => {
    const updateScale = () => {
      const availableWidth = window.innerWidth * 0.9;
      const availableHeight = window.innerHeight * 0.9;
      const newScale = Math.min(
        availableWidth / BOARD_WIDTH,
        availableHeight / BOARD_HEIGHT,
        1
      );
      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center font-mono p-4 overflow-hidden">
      <h1 className="text-4xl mb-4 font-bold text-green-400 drop-shadow-md">
        Classic Snake Game
      </h1>

      <div className="w-full flex justify-center mb-4">
        {/* Contenedor que aplica el escalado */}
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          {/* Simulamos el borde con un contenedor con fondo y padding, de modo que el área jugable interna es EXACTA */}
          <div
            style={{
              backgroundColor: "#48bb78",
              padding: "4px",
              display: "inline-block",
            }}
          >
            <div
              className="relative bg-gray-800 overflow-hidden"
              style={{ width: `${BOARD_WIDTH}px`, height: `${BOARD_HEIGHT}px` }}
            >
              {/* Renderizado de la serpiente */}
              {snake.map((segment, index) => (
                <div
                  key={`snake-${index}`}
                  className="absolute bg-green-500"
                  style={{
                    left: `${segment.x * CELL_SIZE}px`,
                    top: `${segment.y * CELL_SIZE}px`,
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                  }}
                />
              ))}

              {/* Renderizado de la comida */}
              <div
                className="absolute bg-red-500"
                style={{
                  left: `${food.x * CELL_SIZE}px`,
                  top: `${food.y * CELL_SIZE}px`,
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                }}
              />

              {/* Overlay de Game Over */}
              {gameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-red-500 mb-4">
                    ¡Juego Terminado!
                  </p>
                  <button
                    onClick={resetGame}
                    className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Jugar de Nuevo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de Puntaje, Nivel y Velocidad */}
      <div className="flex flex-col md:flex-row gap-4 text-lg">
        <div>
          Puntaje: <span className="font-bold text-green-400">{score}</span>
        </div>
        <div>
          Nivel: <span className="font-bold text-green-400">{level}</span>
        </div>
        <div>
          Velocidad:{" "}
          <span className="font-bold text-green-400">{intervalDelay} ms</span>
        </div>
      </div>
    </div>
  );
};

export default ClassicSnakeGame;
