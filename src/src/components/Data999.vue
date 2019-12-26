<template>
  <el-tabs type="border-card" @tab-click="handleClick">
    <el-tab-pane label="上传数据">
      <UploadData v-bind:config="{mcc:'999'}" />
    </el-tab-pane>
    <el-tab-pane label="新增数据">
      <ShowData v-bind:config="{mcc:'999'}" />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import UploadData from "@/components/UploadData";
import ShowData from "@/components/ShowData";
export default {
  components: {
    UploadData,
    ShowData
  },
  props: {
    config: Object
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {
    handleClick(tab, event) {
      if (tab.label == "新增数据") {
        this.$EventBus.$emit("dataTabChange");
      }
    }
  }
};
</script>

