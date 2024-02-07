
import { pong, gc } from "./global.js"
import { gridDisplay } from "./handleInput.js";

export function drawLoop()
{
	pong.clear();
	
	if (gridDisplay) {
		drawGrid();
	}

	drawStatic();

	gc.text1.update();
	gc.text2.update();
	gc.text3.update();

	drawDynamic();
}

function drawDynamic()
{
	gc.scoreLeft.update();
	gc.scoreRight.update();
	gc.playerLeft.update();
	gc.playerRight.update();
	gc.ballsArr.forEach((ball) => {
		ball.update();
	});
}

function drawStatic()
{
	gc.midLine.update();
	gc.wallTop.update();
	gc.wallBottom.update();
}

function drawGrid()
{
	gc.w_grid_mid.update();
	gc.w_grid_u1.update();
	gc.w_grid_d1.update();
	
	gc.h_grid_mid.update();
	gc.h_grid_u1.update();
	gc.h_grid_d1.update();
}
