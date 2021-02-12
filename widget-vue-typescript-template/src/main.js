import Application from './Application.vue';

new Vue({
  el: '#{{safeName}}',
  render: (createElement) => {
    return createElement(Application);
  }
});
