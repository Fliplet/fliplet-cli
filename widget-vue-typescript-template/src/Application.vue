<template>
  <div>
    <h1>Your {{name}} widget will be added here.</h1>
    <First-Component></First-Component>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import * as FirstComponent from './components/FirstComponent';

export default Vue.extend({
  data() {
    return {};
  },
  components: {
    FirstComponent
  }
});
</script>
