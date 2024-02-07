<script lang="ts">

	import { history, add_history, settings_user } from './Store_chat';
	import { set_mute, get_unmute } from './Request_rooms';
	import Button from './Element_button.svelte';
	import Warning from './Element_warning.svelte';

	let response: FetchResponse;
	let show_error = false;

	let date_string: string;
	if ($settings_user.mute_date)
		date_string = stringify_date(new Date($settings_user.mute_date));
	else
		date_string = "eternity";

	let is_forever;
	let minutes: number = 0;
	let hours: number = 0;
	let days: number = 0;

	function stringify_date(str_date: Date)
	{
		return `${str_date.getFullYear()}/${str_date.getMonth() + 1}/${str_date.getDate()} at ${str_date.getHours()}:${str_date.getMinutes()}`;
	}

	async function handleSubmit(evt)
	{
		let formIsValid = evt.target.checkValidity();

		if (!formIsValid)
			return;
		
		let date_limit: Date;
		let time: string;

		if (is_forever)
			time = "eternity";
		else
		{
			let duration = minutes * (1000 * 60) + hours * (1000 * 60 * 60) + days * (1000 * 60 * 60 * 24);

			let date_start = new Date();
			date_limit = new Date(date_start.getTime() + duration);
			time = stringify_date(date_limit);
		}

		response = await set_mute(date_limit, $settings_user.name, time);
		// print error
		if (response.status >= 300 || response.error)
			show_error = response.error;
		else
			add_history("room");

	}
	async function unmute()
	{
		get_unmute($settings_user.name);
		add_history("room");
	}

</script>

<div class="grid_box">

	<!-- back -->
	<Button my_class="back icon" my_title="go back {$history[1]}">
		back
	</Button>

	<!-- user -->
	<Button my_class="user deactivate">
		{$settings_user.name}
	</Button>

	<!-- close -->
	<Button new_layout="close" my_class="close icon">
		close
	</Button>

	<!-- panel_mute -->
	<div class="panel panel_mute __border_top">
		{#if show_error}
			<Warning content={response.message}/>
		{/if}
		{#if $settings_user.ismute }
			<p class="__center">this user is mute untill {date_string}</p>
			<Button on:click={unmute}>
				un-mute
			</Button>
		{:else}
			<form on:submit|preventDefault={handleSubmit}>
				<p class="__center">mute this user for a time :</p>
				<!-- forever -->
				<input  id="chat_mute_forever" bind:checked={is_forever} class="__check_change_next" type="checkbox">
				<label for="chat_mute_forever" class="_checkbox"><p>forever</p></label>
				<div class="__to_block">
					<!-- minutes -->
					<label for="chat_mute_minutes" class="_select">
						<p>minutes :</p>
						<select id="chat_mute_minutes" bind:value={minutes}>
							<option>00</option>
							<option>01</option>
							<option>02</option>
							<option>03</option>
							<option>04</option>
							<option>05</option>
							<option>06</option>
							<option>07</option>
							<option>10</option>
							<option>11</option>
							<option>12</option>
							<option>13</option>
							<option>14</option>
							<option>15</option>
							<option>16</option>
							<option>17</option>
							<option>20</option>
							<option>21</option>
							<option>22</option>
							<option>23</option>
							<option>24</option>
							<option>25</option>
							<option>26</option>
							<option>27</option>
							<option>30</option>
							<option>31</option>
							<option>32</option>
							<option>33</option>
							<option>34</option>
							<option>35</option>
							<option>36</option>
							<option>37</option>
							<option>40</option>
							<option>41</option>
							<option>42</option>
							<option>43</option>
							<option>44</option>
							<option>45</option>
							<option>46</option>
							<option>47</option>
							<option>50</option>
							<option>51</option>
							<option>52</option>
							<option>53</option>
							<option>54</option>
							<option>55</option>
							<option>56</option>
							<option>57</option>
							<option>60</option>
						</select>
					</label>
					<!-- hours -->
					<label for="chat_mute_hours" class="_select">
						<p>hours :</p>
						<select id="chat_mute_hours">
							<option>00</option>
							<option>01</option>
							<option>02</option>
							<option>03</option>
							<option>04</option>
							<option>05</option>
							<option>06</option>
							<option>07</option>
							<option>10</option>
							<option>11</option>
							<option>12</option>
							<option>13</option>
							<option>14</option>
							<option>15</option>
							<option>16</option>
							<option>17</option>
							<option>20</option>
							<option>21</option>
							<option>22</option>
							<option>23</option>
							<option>24</option>
							<option>25</option>
							<option>26</option>
							<option>27</option>
							<option>30</option>
							<option>31</option>
							<option>32</option>
							<option>33</option>
							<option>34</option>
							<option>35</option>
							<option>36</option>
							<option>37</option>
							<option>40</option>
							<option>41</option>
							<option>42</option>
							<option>43</option>
							<option>44</option>
							<option>45</option>
							<option>46</option>
							<option>47</option>
							<option>50</option>
							<option>51</option>
							<option>52</option>
							<option>53</option>
							<option>54</option>
							<option>55</option>
							<option>56</option>
							<option>57</option>
							<option>60</option>
						</select>
					</label>
					<!-- days -->
					<label for="chat_mute_days" class="_select">
						<p>days :</p>
						<select id="chat_mute_days">
							<option>00</option>
							<option>01</option>
							<option>02</option>
							<option>03</option>
							<option>04</option>
							<option>05</option>
							<option>06</option>
							<option>07</option>
							<option>10</option>
							<option>11</option>
							<option>12</option>
							<option>13</option>
							<option>14</option>
							<option>15</option>
							<option>16</option>
							<option>17</option>
							<option>20</option>
							<option>21</option>
							<option>22</option>
							<option>23</option>
							<option>24</option>
							<option>25</option>
							<option>26</option>
							<option>27</option>
							<option>30</option>
							<option>31</option>
						</select>
					</label>
				</div>
				<input type="submit" value="&#x2BA1">
			</form>
		{/if}
	</div>


</div>

<style>

	/* grid layout "mute"
	*/
	.grid_box :global(.back        ) {grid-area: back;}

	.grid_box :global(.back      ) {grid-area: back;}
	.grid_box :global(.user      ) {grid-area: user;}
	.grid_box :global(.close     ) {grid-area: close;}
	.grid_box :global(.panel_mute) {grid-area: panel_mute;}
	.grid_box {
		grid:
			' back        user        close       ' auto
			' panel_mute  panel_mute  panel_mute  ' 1fr
			/ auto        1fr         auto        ;
	}


	/* checkbox
	*/
	form input[type=checkbox] {
		display: none;
	}
	form label._checkbox {
		margin: 0px auto 0px 10px;
		padding-left: 10px;
		cursor: pointer;
	}
	form label._checkbox::after {
		content: "";
		position: absolute;
		top: calc(50% - 6px);
		left: 0px;
		width: 12px;
		height: 12px;
		border: 2px solid rgb(150, 150, 150);
		box-sizing: border-box;
		cursor: pointer;
	}
	form input[type=checkbox]:checked
	+ label._checkbox::after {
		background-color: rgb(200, 200, 200);
	}


	/* select
	*/
	form label._select {
		flex-direction: row;
	}
	form label._select p {
		margin: 0px;
	}
	form select {
		margin: auto auto auto 10px;
		background-color: rgb(220, 220, 220);
		border: none;
		padding: 5px;
		cursor: pointer;
	}
	form select:hover {
		background-color: rgb(200, 200, 200);
	}


	/* submit
	*/
	form input[type=submit] {
		margin-top: 20px;
	}


</style>


