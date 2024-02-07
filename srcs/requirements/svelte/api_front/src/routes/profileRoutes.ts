
import NotFound from "../pages/NotFound.svelte";
import ProfileDisplay from '../pages/profile/ProfileDisplay.svelte';
import ProfileSettings from '../pages/profile/ProfileSettings.svelte';
import ProfileUsers from '../pages/profile/ProfileUsers.svelte';
import ProfileDisplayOneUser from "../pages/profile/ProfileDisplayOneUser.svelte";

// establishing the prefix here very clearly so we can have a coherent repeatable structure
export const prefix = '/profile';

export const profileRoutes = {
  '/': ProfileDisplay,
  '/settings': ProfileSettings,
  '/users': ProfileUsers,
  '/users/:username': ProfileDisplayOneUser,
  '*': NotFound
};
