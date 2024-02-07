<script lang="ts">
  // things to make the button more generic, modifable and reusable
  export let type:string = 'primary';
  export let flat:boolean = false;
  export let inverse:boolean = false;


</script>

<!-- the class is not conditional as in class:type={some condition}, no it's just the value of type -->
<!-- but class:flat and class:inverse are conditionally dependant, not a function tho, just a var -->
<!-- we could do class={flat} but it would just be true or false, what would we do with class:inverse then? -->
<!-- basically we are naming the classes flat and inverse directly since the var value can't name them -->
<button class={type} class:flat={flat} class:inverse={inverse} on:click>
  <slot></slot>
</button>

<style>
  button{
    border: 0;
    cursor: pointer;
    border-radius: 6px;
    padding: 8px 12px;
    font-weight: bold;
    box-shadow: 1px 2px 3px rgba(0,0,0,0.2);
  }
  .primary{
    background: #d91b42;
    color: white;
  }
  .secondary{
    background: #45c496;
    color: white;
  }
  .flat{
    box-shadow: none;
  }
  .primary.inverse{
    color: #d91b42;
    background: white;
    border: 2px solid #d91b42;
  }
  .secondary.inverse{
    color: #45c496;
    background: white;
    border: 2px solid #45c496;
  }
</style>
