
export * from "../shared_js/constants.js"

// 15ms == 1000/66.666
export	const serverGameLoopIntervalMS = 15; // millisecond
export	const fixedDeltaTime = serverGameLoopIntervalMS/1000; // second

// 33.333ms == 1000/30
export	const playersUpdateIntervalMS = 1000/30; // millisecond
export	const spectatorsUpdateIntervalMS = 1000/30; // millisecond

export	const addressBackEnd = "http://backend_dev:3000/api/v2";
