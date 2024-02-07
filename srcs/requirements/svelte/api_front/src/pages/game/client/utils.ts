
export * from "../shared_js/utils.js"

export function countdown(count: number, step: number, callback: (count: number) => void, endCallback?: () => void) : number[]
{
	const timeoutArr: number[] = [];
	
	if (endCallback) {
		timeoutArr.push( window.setTimeout(endCallback, count) );
	}

	let reverseCount = 0;
	while (count > 0)
	{
		timeoutArr.push( window.setTimeout((count: number) => {
			console.log("countdown ", count);
			callback(count);
		}, reverseCount, count)
		);
		count -= step;
		reverseCount += step;
	}

	return timeoutArr;
}
