let WINDOW_NX = 30
let WINDOW_NY = 24

let BOARD_NX = 10
let BOARD_NY = 20
let TILE_SIZE = 24

let BOARD_SIZE_X = TILE_SIZE * BOARD_NX
let BOARD_SIZE_Y = TILE_SIZE * BOARD_NY

let PIECES
let board
function setup() {
	let canvas = createCanvas(TILE_SIZE * WINDOW_NX, TILE_SIZE * WINDOW_NY)
	canvas.parent("game")

	background(0);

	let vec = createVector // alias
	PIECES = [
		{
			// I
			// ....
			// XXXX
			blocks: [vec(0, 1), vec(1, 1), vec(2, 1), vec(3, 1)],
			color: color(255, 0, 0)
		},
		{
			// J
			// X...
			// XXX.
			blocks: [vec(0, 0), vec(0, 1), vec(1, 1), vec(2, 1)],
			color: color(255, 165, 0)
		},
		{
			// L
			// XXX.
			// X...
			blocks: [vec(0, 1), vec(0, 0), vec(1, 0), vec(2, 0),],
			color: color(255, 0, 255)
		},
		{
			// O
			// XX..
			// XX..
			blocks: [vec(0, 0), vec(0, 1), vec(1, 1), vec(1, 0)],
			color: color(0, 0, 255)
		},
		{
			// S
			// .XX.
			// XX..
			blocks: [vec(0, 1), vec(1, 1), vec(1, 0), vec(2, 0)],
			color: color(204, 255, 0)
		},
		{
			// T
			// XXX.
			// .X..
			blocks: [vec(0, 0), vec(1, 0), vec(2, 0), vec(1, 1)],
			color: color(128, 128, 0)
		},
		{
			// Z
			// XX..
			// .XX.
			blocks: [vec(0, 0), vec(1, 0), vec(1, 1), vec(2, 1)],
			color: color(0, 255, 255)
		},
	]

	board = Array(BOARD_SIZE_Y)
	for (let i = 0; i < BOARD_SIZE_Y; i++) {
		board[i] = Array(BOARD_SIZE_X).fill(newBlock(false, false, color(0)))
	}
}

function newBlock(_isSolid, _isStatic, _color) { return {isSolid: _isSolid, isStatic: _isStatic, color: _color} }
function newFallingPiece(blocks, color) {
	let startingPos = createVector(0, 0)
	return {blocks: blocks.map(i => p5.Vector.add(i, startingPos)), color: color} 
}

let PREV_STATE = "begin"
let CURR_STATE = "begin"
let NEXT_STATE = "begin"

let lastFallUpdate = 0
let fallCooldown = 10
let fallingPiece = null
function update() {
	PREV_STATE = CURR_STATE
	CURR_STATE = NEXT_STATE

	
	switch (CURR_STATE) {
		case "begin": {
			lastFallUpdate = 0
			fallCooldown = 1000
			NEXT_STATE = "newPiece"
			break
		}

		case "newPiece": {
			let p = PIECES[Math.floor(Math.random() * PIECES.length)]
			fallingPiece = newFallingPiece(p.blocks, p.color)

			NEXT_STATE = "fallPiece"
			break
		}

		case "fallPiece": {
			if (millis() - lastFallUpdate > fallCooldown) {
				lastFallUpdate = millis()

				// check if piece is able to move down
				let canFall = true
				for (let i = 0; i < fallingPiece.blocks.length; i++) {
					let b = fallingPiece.blocks[i]

					if (b.y + 1 >= BOARD_NY) {
						canFall = false
						break
					}


					let cellUnder = board[b.y + 1][b.x]
					if (cellUnder.isSolid && cellUnder.isStatic) {
						canFall = false
						break
					}
				}

				if (canFall) {
					fallingPiece.blocks = fallingPiece.blocks.map(i => p5.Vector.add(i, createVector(0, 1)))
				}
				else {
					for (let i = 0; i < fallingPiece.blocks.length; i++) {
						let b = fallingPiece.blocks[i]
						board[b.y][b.x] = newBlock(true, true, fallingPiece.color)
					}

					NEXT_STATE = "newPiece"
				}
			}
			break
		}
	}
}

function draw() {
	update()
	
	background(0)

	drawBoard()
}

function drawBoard() {
	let BOARD_POS_X = 2 * TILE_SIZE
	let BOARD_POS_Y = height - BOARD_SIZE_Y - 2 * TILE_SIZE

	// borders
	stroke(255)
	fill(0)
	rect(BOARD_POS_X, BOARD_POS_Y, BOARD_SIZE_X, BOARD_SIZE_Y)

	// draw blocks
	for (let y = 0; y < BOARD_NY; y++) {
		for (let x = 0; x < BOARD_NX; x++) {
			let p = board[y][x]

			if (!p.isSolid)
				continue
			
			stroke(p.color)
			fill(p.color)
			rect(BOARD_POS_X + x * TILE_SIZE, BOARD_POS_Y + y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
		}
	}

	// draw falling piece
	if (fallingPiece) {
		stroke(fallingPiece.color)
		fill(fallingPiece.color)
		for (let i = 0; i < fallingPiece.blocks.length; i++) {
			let b = fallingPiece.blocks[i]
			rect(BOARD_POS_X + b.x * TILE_SIZE, BOARD_POS_Y + b.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)	
		}
	}	
}