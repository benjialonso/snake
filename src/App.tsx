import React, { useState, useEffect, useCallback, useRef, memo } from "react";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 30;
const CELL_SIZE = 25;
const BOARD_WIDTH = GRID_SIZE * CELL_SIZE;
const BOARD_HEIGHT = GRID_SIZE * CELL_SIZE;
const MAX_FOOD_ATTEMPTS = 100;

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

  const directionRef = useRef<Direction>(direction);
  const queuedDirectionRef = useRef<Direction | null>(null);

  const score = snake.length - 1;

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  function generateRandomPosition(): Position {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }

  const checkCollision = (pos: Position, snakeSegments: Position[]): boolean => {
    return (
      pos.x < 0 ||
      pos.x >= GRID_SIZE ||
      pos.y < 0 ||
      pos.y >= GRID_SIZE ||
      snakeSegments.some((segment) => segment.x === pos.x && segment.y === pos.y)
    );
  };

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    if (queuedDirectionRef.current !== null) {
      const newDirection = queuedDirectionRef.current;
      directionRef.current = newDirection;
      setDirection(newDirection);
      queuedDirectionRef.current = null;
    }

    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (directionRef.current) {
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

      const willEatFood = head.x === food.x && head.y === food.y;
      const snakeBodyToCheck = willEatFood ? prevSnake : prevSnake.slice(0, -1);

      if (checkCollision(head, snakeBodyToCheck)) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      if (willEatFood) {
        let newFood = generateRandomPosition();
        let attempts = 0;
        while (
          newSnake.some(
            (segment) => segment.x === newFood.x && segment.y === newFood.y
          ) &&
          attempts < MAX_FOOD_ATTEMPTS
        ) {
          newFood = generateRandomPosition();
          attempts++;
        }
        setFood(newFood);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameOver, food]);

  const resetGame = () => {
    const newSnake = INITIAL_SNAKE;
    let newFood = generateRandomPosition();
    let attempts = 0;

    while (
      newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y) &&
      attempts < MAX_FOOD_ATTEMPTS
    ) {
      newFood = generateRandomPosition();
      attempts++;
    }

    if (attempts >= MAX_FOOD_ATTEMPTS) {
      newFood = { x: -1, y: -1 };
      setTimeout(() => setFood(generateRandomPosition()), 0);
    }

    setSnake(newSnake);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    queuedDirectionRef.current = null;
    setGameOver(false);
    setFood(newFood);
    setLevel(1);
    setIntervalDelay(BASE_SPEED);
  };

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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      
      const currentDirection = directionRef.current;
      let newDirection: Direction | null = null;

      switch (e.key) {
        case "ArrowUp":
          if (currentDirection !== "DOWN") newDirection = "UP";
          break;
        case "ArrowDown":
          if (currentDirection !== "UP") newDirection = "DOWN";
          break;
        case "ArrowLeft":
          if (currentDirection !== "RIGHT") newDirection = "LEFT";
          break;
        case "ArrowRight":
          if (currentDirection !== "LEFT") newDirection = "RIGHT";
          break;
      }

      if (newDirection) {
        queuedDirectionRef.current = newDirection;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  useEffect(() => {
    if (gameOver) return;
    const gameLoop = setInterval(moveSnake, intervalDelay);
    return () => clearInterval(gameLoop);
  }, [moveSnake, intervalDelay, gameOver]);

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
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
          <div style={{ backgroundColor: "#48bb78", padding: "4px", display: "inline-block" }}>
            <div className="relative bg-gray-800 overflow-hidden" 
                 style={{ width: `${BOARD_WIDTH}px`, height: `${BOARD_HEIGHT}px` }}>
              {snake.map((segment, index) => (
                <SnakeSegment key={`snake-${index}`} x={segment.x} y={segment.y} />
              ))}

              <Food x={food.x} y={food.y} />

              {gameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-red-500 mb-4">¡Game Over!</p>
                  <button
                    onClick={resetGame}
                    className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 text-lg">
        <div>Score: <span className="font-bold text-green-400">{score}</span></div>
        <div>Level: <span className="font-bold text-green-400">{level}</span></div>
        <div>Speed: <span className="font-bold text-green-400">{intervalDelay}ms</span></div>
      </div>
    </div>
  );
};

const SnakeSegment = memo(({ x, y }: Position) => (
  <div
    className="absolute bg-green-500"
    style={{
      left: `${x * CELL_SIZE}px`,
      top: `${y * CELL_SIZE}px`,
      width: `${CELL_SIZE}px`,
      height: `${CELL_SIZE}px`,
    }}
  />
));

const Food = memo(({ x, y }: Position) => (
  <div
    className="absolute bg-red-500"
    style={{
      left: `${x * CELL_SIZE}px`,
      top: `${y * CELL_SIZE}px`,
      width: `${CELL_SIZE}px`,
      height: `${CELL_SIZE}px`,
    }}
  />
));

export default ClassicSnakeGame;