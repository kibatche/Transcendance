
import { w } from "../shared_js/constants.js"
export * from "../shared_js/constants.js"

export	const midLineSize = Math.floor(w/150);
export	const scoreSize = Math.floor(w/16); 
export	const gridSize = Math.floor(w/500);

// min interval on Firefox seems to be 15. Chrome can go lower.
export	const handleInputIntervalMS = 15; // millisecond
export	const sendLoopIntervalMS = 15; // millisecond // unused
export	const gameLoopIntervalMS = 15; // millisecond
export	const drawLoopIntervalMS = 15; // millisecond

export	const fixedDeltaTime = gameLoopIntervalMS/1000; // second

export	const soundRobloxVolume = 0.3; // between 0 and 1
export	const soundPongVolume = 0.3; // between 0 and 1
