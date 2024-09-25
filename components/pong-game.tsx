'use client'

import React, { useRef, useEffect, useState } from 'react'

const PADDLE_HEIGHT = 70
const PADDLE_WIDTH = 25
const BALL_RADIUS = 10
const CANVAS_HEIGHT = 500
const CANVAS_WIDTH = 300
const BALL_SPEED = 0.02
const COMPUTER_SPEED = 1
const PLAYER_SPEED = 0.1

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playerPaddle, setPlayerPaddle] = useState({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 })
  const [computerPaddle, setComputerPaddle] = useState({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 })
  const [ball, setBall] = useState({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 0, dy: 0 })
  const [playerScore, setPlayerScore] = useState(0)
  const [computerScore, setComputerScore] = useState(0)
  const [keys, setKeys] = useState({ q: false, e: false })
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')

    if (!canvas || !context) return

    let animationFrameId: number

    const gameLoop = () => {
      // Clear canvas
      context.clearRect(0, 0, canvas.width, canvas.height)

      // Draw paddles
      context.fillStyle = 'white'
      context.fillRect(0, playerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT)
      context.fillRect(canvas.width - PADDLE_WIDTH, computerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT)

      // Draw ball
      context.beginPath()
      context.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2)
      context.fillStyle = 'white'
      context.fill()
      context.closePath()

      // Draw scores
      context.font = '24px Arial'
      context.fillText(playerScore.toString(), canvas.width / 4, 30)
      context.fillText(computerScore.toString(), (3 * canvas.width) / 4, 30)

      if (gameStarted) {
        // Move ball
        setBall(prevBall => ({
          x: prevBall.x + prevBall.dx,
          y: prevBall.y + prevBall.dy,
          dx: prevBall.dx,
          dy: prevBall.dy,
        }))

        
        // Ball collision with paddles
        if (
          (ball.x - BALL_RADIUS < PADDLE_WIDTH && ball.y > playerPaddle.y && ball.y < playerPaddle.y + PADDLE_HEIGHT) ||
          (ball.x + BALL_RADIUS > canvas.width - PADDLE_WIDTH && ball.y > computerPaddle.y && ball.y < computerPaddle.y + PADDLE_HEIGHT)
        ) {
          setBall(prevBall => {
            const newDx = -prevBall.dx;
            let newX = prevBall.x;

        // Adjust ball position to prevent sticking
            if (prevBall.x - BALL_RADIUS < PADDLE_WIDTH) {
              newX = PADDLE_WIDTH + BALL_RADIUS;
            } else if (prevBall.x + BALL_RADIUS > canvas.width - PADDLE_WIDTH) {
              newX = canvas.width - PADDLE_WIDTH - BALL_RADIUS;
            }

            return { ...prevBall, dx: newDx, x: newX };
          });
        }
        
        // Ball collision with top and bottom of canvas
        if (ball.y - BALL_RADIUS < 0 || ball.y + BALL_RADIUS > canvas.height) {
          setBall(prevBall => {
            const newDy = -prevBall.dy;
            let newY = prevBall.y;

            // Adjust ball position to prevent sticking
            if (prevBall.y - BALL_RADIUS < 0) {
              newY = BALL_RADIUS;
            } else if (prevBall.y + BALL_RADIUS > canvas.height) {
              newY = canvas.height - BALL_RADIUS;
            }

            return { ...prevBall, dy: newDy, y: newY };
          });
        }

        // Ball out of bounds
        if (ball.x + BALL_RADIUS > canvas.width) {
          setPlayerScore(prevScore => prevScore + 1)
          resetBall()
        } else if (ball.x - BALL_RADIUS < 0) {
          setComputerScore(prevScore => prevScore + 1)
          resetBall()
        }

        // Computer paddle movement
        const paddleCenter = computerPaddle.y + PADDLE_HEIGHT / 2
        if (paddleCenter < ball.y - 35) {
          setComputerPaddle(prev => ({ y: Math.min(prev.y + COMPUTER_SPEED, canvas.height - PADDLE_HEIGHT) }))
        } else if (paddleCenter > ball.y + 35) {
          setComputerPaddle(prev => ({ y: Math.max(prev.y - COMPUTER_SPEED, 0) }))
        }
      }

      // Player paddle movement
      if (keys.q) {
        setPlayerPaddle(prev => ({ y: Math.max(prev.y - PLAYER_SPEED, 0) }))
      }
      if (keys.e) {
        setPlayerPaddle(prev => ({ y: Math.min(prev.y + PLAYER_SPEED, canvas.height - PADDLE_HEIGHT) }))
      }

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    

    const resetBall = () => {
      setBall({
        x: CANVAS_WIDTH / 2,
        y: Math.random() * (CANVAS_HEIGHT - 2 * BALL_RADIUS) + BALL_RADIUS,
        dx: 0,
        dy: 0,
      })
      setGameStarted(false)
    }

    gameLoop()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'q' || e.key === 'e') {
        setKeys(prev => ({ ...prev, [e.key]: true }))
      } else if (e.key === ' ' && !gameStarted) {
        setGameStarted(true)
        setBall(prevBall => ({
          ...prevBall,
          dx: Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED,
          dy: Math.random() > 0.5 ? BALL_SPEED : -BALL_SPEED,
        }))
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'q' || e.key === 'e') {
        setKeys(prev => ({ ...prev, [e.key]: false }))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [ball, playerPaddle, computerPaddle, playerScore, computerScore, keys, gameStarted])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-5xl font-bold text-yellow-900 mb-4">Pong Game</h1>
      <p className="text-cyan-400 text-xl m-10">
        Use 'Q' to move up, 'E' to move down, and SPACE to start the ball
      </p>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-white"
      />
      
    </div>
  )
}