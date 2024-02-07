<script lang="ts">
  import { fetchAvatar } from "./utils.js";

  export let user;
  let rank = '';

  if (user.stats.loseGame > user.stats.winGame) {
    rank = "Come on, you can do better"
  } else if (user.stats.loseGame === user.stats.winGame) {
    rank = 'Fine i guess...'
  } else {
    rank = 'You da Boss!'
  }

  // Glittery Stars and such for Rank

  let index = 0, interval = 1000;

  const rand = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const animate = (star) => {
    if (star) {
      star.style.setProperty("--star-left", `${rand(-10, 100)}%`);
      star.style.setProperty("--star-top", `${rand(-40, 80)}%`);

      star.style.animation = "none";
      star.offsetHeight;
      star.style.animation = "";
    }
  }

  let stars = [];

  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      animate(stars[i]);

      setInterval(() => animate(stars[i]), 1000);
    }, index++ * (interval / 3))
  }

</script>


<div class="outer">
  {#if user}
  <main>
    {#await fetchAvatar(user.username) then avatar}
      <img class="avatar" src="{avatar}" alt="user avatar">
    {:catch error}
      <p class="errorA">Avatar was unable to load</p>
    {/await}
    <div class="username">{user.username}</div>
    <div class="rank">Rank:
      <span class="glitter">
        <span bind:this={stars[0]} class="glitter-star">
          <svg viewBox="0 0 512 512">
          <path d="M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z" />
          </svg>
        </span>
        <span bind:this={stars[1]} class="glitter-star">
          <svg viewBox="0 0 512 512">
          <path d="M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z" />
          </svg>
        </span>
        <span bind:this={stars[2]} class="glitter-star">
          <svg viewBox="0 0 512 512">
          <path d="M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z" />
          </svg>
        </span>
        <span class="glitter-text">{rank}</span>
      </span>
    </div>
    <section class="main-stats">
      <h4>Match Statistics</h4>
      <p>Wins: {user.stats.winGame}</p>
      <p>Losses: {user.stats.loseGame}</p>
      <p>Draws: {user.stats.drawGame}</p>
      <p class="highlight">Total: {user.stats.totalGame}</p>
    </section>
  </main>
  {/if}
</div>



<style>

  div.outer{
    max-width: 960px;
    margin: 40px auto;
    margin-top: 1vw;
  }

/* The main part */
  main{
    max-width: 960px;
    margin: 40px auto;
    margin-top: 1vw;
    text-align: center;
  }

  .avatar{
    width: 15vw;
    height: 15vw;
	max-width: 130px;
	max-height: 130px;
	margin-bottom: 1vw;
  }

/* The variable rich section */
  section.main-stats{
    max-width: 600px;
    margin: 40px auto;
    text-align: center;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
  }

/* the  stuff in the grid*/
  section.main-stats h4{
    grid-column: 1 / span 3;
  }

  div.username{
    font-size: 1.5em;
    font-weight: bold;
    padding-bottom: 5px;
    /* color: white; */
  }

  div.rank {
    /* color: black; */
    font-size: 1.2em;
    font-weight: bold;
  }

  .errorA{
    font-size: 0.5em;
    font-weight: bold;
    color: rgb(152, 20, 20);
  }

  .highlight {
    font-weight: bold;
  }

  p.highlight{
    grid-column: 1 / span 3;
  }

  @media screen and (max-width: 500px) {
    section.main-stats{
      grid-template-columns: 1fr;
    }
    section.main-stats h4{
      grid-column: 1;
    }
    section.main-stats p{
      grid-column: 1;
    }

  }


  /* Glittery Star Stuff */


  :root {
    --purple: rgb(123, 31, 162);
    --violet: rgb(103, 58, 183);
    --pink: rgb(244, 143, 177);
    /* make shit gold? */
  }

  @keyframes background-pan {
    from {
      background-position: 0% center;
    }

    to {
      background-position: -200% center;
    }
  }

  @keyframes scale {
    from, to {
      transform: scale(0);
    }

    50% {
      transform: scale(1);
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(180deg);
    }
  }


  div > .glitter {
    display: inline-block;
    position: relative;
  }

  div > .glitter > .glitter-star {
    --size: clamp(20px, 1.5vw, 30px);

    animation: scale 700ms ease forwards;
    display: block;
    height: var(--size);
    left: var(--star-left);
    position: absolute;
    top: var(--star-top);
    width: var(--size);
  }

  div > .glitter > .glitter-star > svg {
    animation: rotate 1000ms linear infinite;
    display: block;
    opacity: 0.7;
  }

  div > .glitter > .glitter-star > svg > path {
    fill: var(--violet);
  }

  div > .glitter > .glitter-text {
    animation: background-pan 3s linear infinite;
    /* background-image: linear-gradient( */
    background: linear-gradient(
      to right,
      var(--purple),
      var(--violet),
      var(--pink),
      var(--purple)
    );
    background-size: 200%;

    /* Keep these for Safari and chrome */
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    /* These are for Firefox */
    background-clip: text;
    color: transparent;

    white-space: nowrap;
  }

</style>
