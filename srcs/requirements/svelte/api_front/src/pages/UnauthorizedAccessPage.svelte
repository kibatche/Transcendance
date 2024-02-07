<script lang="ts">
  import { replace } from "svelte-spa-router";
</script>

<div class="wrapper">
  <h1>You're not supposed to be here...</h1>
  <button on:click={ () => (replace('/'))}>Go Home</button>
</div>

<style>

  div.wrapper{
    display: flexbox;
    align-items: center;
  }

</style>