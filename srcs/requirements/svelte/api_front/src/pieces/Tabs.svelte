<script lang='ts'>
  import { createEventDispatcher } from "svelte";
  export let items;
  export let activeItem;
  export let size = 'medium';
  // big, medium, small, default (responsive)

  const dispatch = createEventDispatcher();

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="tabs" class:size={size}>
  <ul>
    {#each items as item}
      <li class={size} on:click={() => dispatch('tabChange', item)}>
        <div class:active={activeItem === item}>{item}</div>
      </li>
    {/each}
  </ul>
</div>

<style>

  .tab.big{
    margin-bottom: 50px;
  }
  .tab.medium{
    margin-bottom: 40px;
    /* the OG size */
  }
  .tab.small{
    margin-bottom: 10px;
  }
  ul{
    display: flex;
    justify-content: center;
    padding: 0;
    list-style-type: none;
  }
  li{
    color: #555;
    cursor: pointer;
  }
  li.big{
    margin: 0 20px;
    font-size: 22px;
  }
  li.medium{
    margin: 0 16px;
    font-size: 18px;
    /* the OG size */
  }
  li.small{
    margin: 8px;
    font-size: 10px;
  }

  .active{
    color: #d91b42;
    border-bottom: 2px solid #d91b42;
    padding-bottom: 8px;
  }

  li div:hover {
    color: rgb(0, 166, 255) !important;
  }

  /* default is medium */
  .tab.default {
    margin-bottom: 40px;
  }
  li.default{
    margin: 0 16px;
    font-size: 18px;
  }

  @media screen and (max-width: 700px) {
    /* they turn .small */
    .tab.default {
      margin-bottom: 10px;
    }
    li.default {
      margin: 8px;
      font-size: 10px;
    }
  }

</style>