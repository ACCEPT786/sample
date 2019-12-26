<template>
  <div v-loading="loading">
    <div style="padding: 1%;font-size: 20px;font-weight: bold;color: #003366">全国地图</div>

    <div class="flex direction-row">
      <div v-show="show">
        <ve-map width="1000px" height="800px" :data="chartData" :settings="chartSettings" :title="title" :visualMap="visualMap" :legend="legend"></ve-map>
      </div>
      <div class="rate">
        <el-table :data="tableData" border stripe>
          <el-table-column prop="province" label="省份" width="200"></el-table-column>
          <el-table-column prop="rate" label="占比" width="200"></el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    config: Object
  },
  data() {
    return {
      loading: false,
      show: false,
      title: {
        text: "国内数据",
        textStyle: {
          fontSize: 18
        },
        padding: 15
      },
      legend: {
        x: "center"
        // y: "bottom",
        // orient: "vertical"
      },
      visualMap: {
        //图列显示柱
        show: true,
        type: "continuous",
        min: 0,
        left: 30,
        max: 2000,
        text: ["大", "小"],
        realtime: false,
        calculable: true,
        color: ["orangered", "yellow", "lightskyblue"]
      },
      dataRange: {
        show: false,
        orient: "vertical",
        min: 0,
        max: 3000,
        text: ["高", "低"], // 文本，默认为数值文本
        splitNumber: 0
      },
      toolbox: {
        show: true,
        orient: "vertical",
        x: "right",
        y: "center",
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false }
        }
      },
      chartSettings: {
        position: "china",
        dimension: "province",
        metrics: ["新增量"],
        dataType: {
          面积: "KMB"
        }
      },
      chartData: {
        columns: ["province", "新增量"],
        rows: []
      },
      tableData: []
    };
  },
  watch: {
    config() {
      this.httpData();
    }
  },
  mounted() {
    this.httpData();
  },
  methods: {
    httpData() {
      var uid = window.sessionStorage.getItem("id");
      var that = this;
      that.show = false;
      that.loading = true;
      let url =
        process.env.SERVER_URL +
        "/api/userData/map?uid=" +
        uid +
        "&token=" +
        window.sessionStorage.getItem("token") +
        "&time=" +
        that.config.time;
      that.chartData.row = [];
      that.$http.get(url).then(
        res => {
          if (200 == res.body.code) {
            var list = res.body.data.list;
            var rows = [];
            var sum = 0;
            that.tableData = [];
            for (let i in list) {
              var item = list[i];
              sum = sum + item.ct;
              rows.push({
                province: item.province,
                新增量: item.ct
              });
            }

            for (let i in list) {
              var rate;
              var item = list[i];
              if (sum == 0) {
                rate = "0%";
              } else {
                rate = (item.ct / sum * 100).toFixed(2) + "%";
              }
              that.tableData.push({
                province: item.province,
                rate: rate
              });
              if (that.tableData.length >= 10) {
                break;
              }
            }

            that.chartData.rows = rows;
            that.title.text = res.body.data.title;
            that.visualMap.max = res.body.data.max;
            that.show = true;
            that.loading = false;
            return;
          }
          that.showMsg(res.body.msg, "error");
          that.show = false;
          that.loading = false;
        },
        err => {
          that.showMsg("服务器请求失败，请检查网络连接！", "error");
          that.show = false;
          that.loading = false;
        }
      );
    },
    showMsg(msg, type) {
      this.$message({
        message: msg,
        type: type,
        showClose: true,
        center: true
      });
    }
  }
};
</script>
