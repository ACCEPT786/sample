<template>
  <div>
    <div v-if="460==customerMcc">
      <newlyLine460/>
    </div>
    <div v-if="999==customerMcc">
      <newlyLine999/>
    </div>
  </div>
</template>

<script>
  import newlyLine460 from "../components/NewlyLine460";
  import newlyLine999 from "../components/NewlyLine999";

  export default {
    components: {
      newlyLine460,
      newlyLine999,
    },

    data() {
      return {
        customerMcc: "",
      }
    },

    mounted() {
      this.customerMcc = window.sessionStorage.getItem('mcc')
    }
  }
</script>

<style scoped>

</style>
