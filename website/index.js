// MIT © 2019 azu
import * as Vue from "vue";
import App from "./components/App.vue";

const app = Vue.createApp(App);
// https://github.com/parcel-bundler/parcel/issues/2178#issuecomment-431590679
app.mount("#root");
