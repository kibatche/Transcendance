<script>

	import { history, add_history, socket, msgs, add_msg, current_room } from './Store_chat';
	import Button from './Element_button.svelte';
	import Msg from './Element_msg.svelte';

	let msg = "";
	let text_area;

	function send_msg()
	{
		msg = msg.trim();
		if (msg.length > 0) {
			socket.emit('message', msg);
			add_msg("me", msg);
		}

		msg = "";
		text_area.focus();
	}

	function enter_send_msg(evt)
	{
		if (evt.shiftKey && evt.key === "Enter")
		{
			evt.preventDefault();
			send_msg();
		}
	}

</script>

<div class="grid_box">

	<!-- back -->
	<Button my_class="back icon" my_title="go back {$history[1]}">
		back
	</Button>

	<!-- room_name -->
	<Button new_layout="room_set" my_class="room_name transparent">
		{$current_room.client_name}
	</Button>

	<!-- close -->
	<Button new_layout="close" my_class="close icon">
		close
	</Button>

	<!-- msg -->
	<div class="panel panel_msg">
		<div class="msg_thread">
			{#each $msgs as msg}
				<Msg name={msg.name}>{@html msg.message}</Msg>
			{/each}
		</div>
	</div>

	<!-- write -->
	<div class="panel_write">
		<div
			class="text_area"
			bind:innerHTML={msg}
			bind:this={text_area}
			on:keypress={enter_send_msg}
			contenteditable="true"
		></div>
	</div>

	<!-- send -->
	<Button my_class="send" on:click={send_msg}>
		send
	</Button>

</div>

<style>

	/* grid layout "room"
	*/
	.grid_box :global(.back       ) {grid-area: back;}
	.grid_box :global(.room_name  ) {grid-area: room_name;}
	.grid_box :global(.close      ) {grid-area: close;}
	.grid_box :global(.panel_msg  ) {grid-area: panel_msg;}
	.grid_box :global(.send       ) {grid-area: send;}
	.grid_box :global(.panel_write) {grid-area: panel_write;}
	.grid_box {
		grid:
			' back         room_name    room_name  close      ' auto
			' panel_msg    panel_msg    panel_msg  panel_msg  ' 1fr
			' panel_write  panel_write  send       send       ' auto
			/ auto         1fr          auto       auto       ;
	}


	/* write area
	*/
	.grid_box .panel_write {
		border: none;
		overflow: visible;
	}
	.grid_box .text_area {
		display: block;
		position: absolute;
		bottom: 0px;
		left: 0px;
		width: 100%;
		height: 100%;

		overflow-x: hidden;
		overflow-y: scroll;
		background-color: var(--chat_msg_bg_color);
		border: var(--lines_width) solid var(--lines_color);
	}
	.grid_box .text_area {
		color: var(--lines_color);
	}
	.grid_box .text_area:focus {
		height: auto;
		min-height: 100%;
		max-height: 300px;
	}
	.grid_box .panel_write .text_area :global(*) {
		display: block ruby;
	}


	/* msg area
	*/
	.grid_box .panel_msg {
		flex-direction: column-reverse;
		border: var(--lines_width) solid var(--lines_color);
		background-color: var(--chat_conv_bg_color);
	}
	.grid_box .msg_thread {
		width: 100%;
		padding: 0px 5px;
	}

</style>


