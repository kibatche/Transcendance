<script>

	export let name;

</script>

<div class="chat_msg {name}">
	<p class="name">{name}</p>
	<p class="msg"><slot></slot></p>
</div>

<style>
/*
		var(--chat_me_color)
		var(--chat_me_bg_color)
		var(--chat_other_color)
		var(--chat_other_bg_color)
		var(--chat_name_color)
	var(--chat_input_color)
	var(--chat_input_bg_color)
*/
	.chat_msg {
		/*
		white-space: pre-wrap;
		*/
		margin: 5px auto;
		padding: 5px;
		border-radius: 5px;
	}
	/* all msg
	*/
	.chat_msg {
		margin-left: 0px;
		background-color: var(--chat_other_bg_color);
		max-width: 80%;
	}
	.chat_msg p {
		padding: 0px;
	}
	.chat_msg p.name {
		margin: 0px;
		font-size: 12px;
		color: var(--chat_name_color);
	}
	.chat_msg p.msg {
		margin: 5px 0px;
		color: var(--chat_other_color);
	}
	.chat_msg p.msg :global(*) {
		display: inline;
	}
	/* me msg
	*/
	.chat_msg.me {
		margin-right: 0px;
		margin-left: auto;
		background-color: var(--chat_me_bg_color);
	}
	.chat_msg.me p.name {
		display: none;
	}
	.chat_msg.me p.msg {
		color: var(--chat_me_color);
	}
	/* msg server
	*/
	.chat_msg.SERVER {
		margin-left: auto;
		background-color: transparent;
	}
	.chat_msg.SERVER p.name {
		display: none;
	}
	.chat_msg.SERVER p.msg {
		margin: 0px auto;
		font-size: 12px;
		color: var(--chat_serveur_color);
	}
</style>

