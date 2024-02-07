
export	const CanvasWidth = 1500;
export	const CanvasRatio = 1.66666;
/* ratio 5/3 (1.66) */

export	const w = CanvasWidth;
export	const h = CanvasWidth / CanvasRatio;
export	const w_mid = Math.floor(w/2);
export	const h_mid = Math.floor(h/2);
export	const pw = Math.floor(w*0.017);
export	const ph = pw*6;
export	const ballSize = pw;
export	const wallSize = Math.floor(w*0.01);
export	const racketSpeed = Math.floor(w*0.60); // pixel per second
export	const ballSpeed = Math.floor(w*0.55); // pixel per second
export	const ballSpeedIncrease = Math.floor(ballSpeed*0.05); // pixel per second

export	const normalizedSpeed = false; // for consistency in speed independent of direction

export	const matchStartDelay = 3000; // millisecond
export	const newRoundDelay = 1500; // millisecond

// Game Variantes
export	const multiBallsCount = 3;
export	const movingWallPosMax = Math.floor(w*0.12);
export	const movingWallSpeed = Math.floor(w*0.08);


export	const gameSessionIdPLACEHOLDER = "match-id-test-42"; // TESTING SPECTATOR PLACEHOLDER
// for testing, force gameSession.id in wsServer.ts->createGameSession()
