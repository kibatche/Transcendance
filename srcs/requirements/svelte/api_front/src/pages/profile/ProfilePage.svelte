<script lang="ts">
  import Router from "svelte-spa-router";
  import { profileRoutes, prefix } from "../../routes/profileRoutes.js";

</script>


<div>
  <Router routes={profileRoutes} {prefix} />
</div>

