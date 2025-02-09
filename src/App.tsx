import React, { useState, useEffect, useCallback } from 'react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 30;  // Pantalla más grande
const CELL_SIZE = 25;  // Celdas más grandes
const INITIAL_SNAKE: Position[] = [{ x: 15, y: 15 }];
const INITIAL_DIRECTION: Direction = 'RIGHT';

const ClassicSnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState<boolean>(false);

  const generateRandomPosition = (): Position => ({
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  });

  const checkCollision = (pos: Position): boolean => {
    return pos.x < 0 || pos.x >= GRID_SIZE || 
           pos.y < 0 || pos.y >= GRID_SIZE ||
           snake.some(segment => segment.x === pos.x && segment.y === pos.y);
  };

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake((prevSnake) => {
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      if (checkCollision(head)) {
        setGameOver(true);
        return prevSnake;
      }

      newSnake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        setFood(generateRandomPosition());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setFood(generateRandomPosition());
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': if (direction !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': if (direction !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': if (direction !== 'LEFT') setDirection('RIGHT'); break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, 200);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl mb-4 font-bold text-green-400">Classic Snake Game</h1>
      
      <div 
        className="relative bg-gray-800 border-4 border-green-500"
        style={{
          width: `${GRID_SIZE * CELL_SIZE}px`,
          height: `${GRID_SIZE * CELL_SIZE}px`,
        }}
      >
        {/* Snake */}
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
        
        {/* Food */}
        <div
          className="absolute bg-red-500"
          style={{
            left: `${food.x * CELL_SIZE}px`,
            top: `${food.y * CELL_SIZE}px`,
            width: `${CELL_SIZE}px`,
            height: `${CELL_SIZE}px`,
          }}
        />
        
        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-red-500 mb-4">Game Over!</p>
            <button
              onClick={resetGame}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-lg">
        Score: <span className="font-bold text-green-400">{snake.length - 1}</span>
      </div>
    </div>
  );
};

export default ClassicSnakeGame;