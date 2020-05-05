<template>
  <div>
    <h1>Your {{name}} widget will be added here.</h1>
    <First-Component></First-Component>
  </div>
</template>

<script>
import FirstComponent from './components/FirstComponent';

export default {
  data() {
    return {};
  },
  components: {
    FirstComponent
  }
};
</script>
