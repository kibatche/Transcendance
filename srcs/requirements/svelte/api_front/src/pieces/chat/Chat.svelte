<script lang="ts">

	import Layouts from './Chat_layouts.svelte';
	import { init_socket } from './Socket_chat';
	import { user } from './Store_chat';
  import { location } from 'svelte-spa-router';

	let style_light =
	{
		lines_width:       "1px",
		lines_color:       "rgb(30, 30, 30)",
		lines_light_color: "rgb(70, 70, 70)",
		bg_color:          "rgb(251, 139,  36)",
		bg_light_color:    "rgb(251, 156,  81)",

		btn_color:        "rgb(220, 220, 220)",
		btn_color_hover:  "rgb(200, 200, 200)",
		btn_color_active: "rgb(190, 190, 190)",
		btn_color_border: "rgb(150, 150, 150)",

		btn_light_color:        "rgb(235, 235, 235)",
		btn_light_color_hover:  "rgb(220, 220, 220)",
		btn_light_color_active: "rgb(210, 210, 210)",
		btn_color_border:       "rgb(200, 200, 200)",

		chat_me_color:       "rgb(250, 230, 220)",
		chat_me_bg_color:    "rgb(210, 105,  30)",
		chat_name_color:     "rgb(230, 230, 230)",
		chat_other_color:    "rgb(250, 250, 250)",
		chat_other_bg_color: "rgb(190, 130,  70)",
		chat_serveur_color:  "rgb(110, 110, 110)",
		chat_msg_bg_color:   "rgb(251, 163,  80)",
		chat_conv_bg_color:  "rgb(251, 163,  80)",
	}
	let style_dark =
	{
		lines_width:       "2px",
		lines_color:       "rgb(200, 200, 200)",
		lines_light_color: "rgb(100, 100, 100)",
		bg_color:          "rgb( 50,  50,  50)",
		bg_light_color:    "rgb( 35,  35,  35)",

		btn_color:        "rgb(220, 220, 220)",
		btn_color_hover:  "rgb(160, 160, 160)",
		btn_color_active: "rgb(150, 150, 150)",
		btn_color_border: "rgb(150, 150, 150)",

		btn_light_color:        "rgb(235, 235, 235)",
		btn_light_color_hover:  "rgb(220, 220, 220)",
		btn_light_color_active: "rgb(210, 210, 210)",
		btn_color_border:       "rgb(200, 200, 200)",

		chat_me_color:       "rgb(230, 230, 230)",
		chat_me_bg_color:    "rgb(110, 110, 110)",
		chat_name_color:     "rgb(110, 110, 110)",
		chat_other_color:    "rgb( 90,  90,  90)",
		chat_other_bg_color: "rgb(210, 210, 210)",
		chat_serveur_color:  "rgb(190, 190, 190)",
		chat_msg_bg_color:   "rgb( 82,  82,  82)",
		chat_conv_bg_color:  "rgb( 82,  82,  82)",
	}

	let style = style_light;

	function change_style(loc)
	{
		console.log("change color, location:", loc);
		if (loc.startsWith("/game"))
			style = style_dark;
		if (loc.startsWith("/spectator"))
			style = style_dark;
		if (loc.startsWith("/ranking"))
			style = style_light;
		if (loc.startsWith("/profile"))
			style = style_light;
	}

	$:	change_style($location);
	$:	{
				$location;
				if (!user)
				{
					init_socket();
				};
			};

</script>

{#if $location !== '/' && $location !== '/game'}
	<Layouts
		--lines_width={style.lines_width}
		--lines_color={style.lines_color}
		--lines_light_color={style.lines_light_color}
		--bg_color={style.bg_color}
		--bg_light_color={style.bg_light_color}

		--btn_color={style.btn_color}
		--btn_color_hover={style.btn_color_hover}
		--btn_color_active={style.btn_color_active}
		--btn_color_border={style.btn_color_border}

		--btn_light_color={style.btn_light_color}
		--btn_light_color_hover={style.btn_light_color_hover}
		--btn_light_color_active={style.btn_light_color_active}
		--btn_light_color_border={style.btn_color_border}

		--chat_me_color={style.chat_me_color}
		--chat_me_bg_color={style.chat_me_bg_color}
		--chat_name_color={style.chat_name_color}
		--chat_other_color={style.chat_other_color}
		--chat_other_bg_color={style.chat_other_bg_color}
		--chat_serveur_color={style.chat_serveur_color}
		--chat_msg_bg_color={style.chat_msg_bg_color}
		--chat_conv_bg_color={style.chat_conv_bg_color}
	/>
{/if}

<style></style>

