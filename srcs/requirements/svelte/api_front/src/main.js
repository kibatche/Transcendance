import App from './App.svelte';
import dotenv from 'dotenv';

dotenv.config();
const app = new App({
    target: document.body,
    props: {
    // name: 'world'
    }
});
export default app;
//# sourceMappingURL=main.js.map
