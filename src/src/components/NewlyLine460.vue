<template>
  <div>
    <el-card style="min-width: 1200px">
      <div>
        <newlyCount/>
      </div>
    </el-card>
    <el-card style="min-width: 1200px">
      <div>
        <div v-loading="loading" style="width: 100%">
          <div style="padding: 2%">
            <span style="padding-left: 7%">时间段：</span>
            <el-date-picker v-model="time" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" @change="timeOnPick">
            </el-date-picker>
            <span style="padding-left: 4%">省份：</span>
            <el-select v-model="province" @change="changeProvince">
              <el-option v-for="item in selectProvinces" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
            <span style="padding-left: 2%">城市：</span>
            <el-select v-model="city" @focus="cityFocus" ref="selectCityRef" @change="changeCity">
              <el-option v-for="item in selectCities" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
          </div>
          <div style="padding: 1%;font-size: 20px;font-weight: bold;color: #003366">新增量折线图</div>
          <div style="padding: 1%;padding-bottom: 0px">
            <span style="padding-left: 12%">渠道：</span>
            <el-select v-model="channels" :disabled="channelsDisable" filterable multiple collapse-tags @change="selectAll">
              <el-option v-for="item in selectChannels" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
          <div style="width: 94%;padding-left: 3%">
            <ve-line :data="chartData" :settings="chartSettings" :legend="legend" :title="title" :extend="extend"></ve-line>
          </div>
        </div>
      </div>
      <div style="padding-top: 3%">
        <newUserPie v-bind:config="{time:time, province:province, city:city}" />
      </div>
    </el-card>
    <el-card style="min-width: 1200px">
      <div style="min-width: 1200px">
        <map460 v-bind:config="{time:time}" />
      </div>
    </el-card>
  </div>
</template>

<script>
import newlyCount from "../components/NewlyCount";
import newUserPie from "../components/NewUserPie";
import map460 from "../components/Map460";

export default {
  components: {
    newlyCount,
    newUserPie,
    map460
  },
  data() {
    this.chartSettings = {};
    this.extend = {
      "xAxis.0.axisLabel.rotate": 45
    };
    return {
      loading: false,
      chartData: {
        columns: [],
        rows: []
      },
      legend: {
        bottom: 0
      },
      title: {
        subtext: "",
        subtextStyle: {
          fontSize: 20
        },
        x: "left"
      },
      channels: [],
      selectChannels: [],
      channelAll: false,
      oldChannels: [],
      channelsDisable: false,
      province: "",
      selectProvinces: [],
      city: "",
      selectCities: [],
      provincesCities: {},
      time: [],
      httpUrl: process.env.SERVER_URL + "/api",
      oldOptions: []
    };
  },

  mounted() {
    this.init();
  },

  methods: {
    init() {
      var that = this;
      that.selectChannels = [];
      that.selectCities = [];
      that.selectProvinces = [];
      that.province = "全部";
      that.city = "全部";
      that.$http
        .get(
          that.httpUrl +
            "/newly/time?id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token") +
            "&mcc=" +
            "460"
        )
        .then(
          res => {
            if (200 == res.body.code) {
              const end = new Date();
              const start = new Date();
              if (null == res.body.data) {
                end.setTime(new Date() - 3600 * 1000 * 24);
                start.setTime(new Date() - 3600 * 1000 * 24 * 7);
              } else {
                end.setTime(res.body.data);
                start.setTime(res.body.data - 3600 * 1000 * 24 * 6);
              }
              var startFormat = that.$DateFormat(start, "yyyy-mm-dd");
              var endFormat = that.$DateFormat(end, "yyyy-mm-dd");
              that.time.push(startFormat);
              that.time.push(endFormat);
              that.handleOption();
              that.getNewlyLine();
              return;
            }
            this.showMsg(res.body.msg, "error");
          },
          err => {
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
    },

    handleOption() {
      var that = this;
      that.province = "全部";
      that.city = "全部";
      //that.channels = [],
      that.$http
        .get(
          that.httpUrl +
            "/newly/option/460?id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token") +
            "&time=" +
            that.time
        )
        .then(
          res => {
            //that.selectChannels = [];
            that.selectProvinces = [];
            if (200 == res.body.code) {
              // if (1 == res.body.data.channels.length) {
              //   that.selectChannels.push({"label": res.body.data.channels[0], "value": res.body.data.channels[0]});
              //   that.channels.push(res.body.data.channels[0])
              //   that.channelsDisable = true;
              // } else {
              //   that.selectChannels.push({"label": "全部", "value": "all"});
              //   that.channels.push("all");
              //   for (var i = 0; i < res.body.data.channels.length; i++) {
              //     var item = {"label": res.body.data.channels[i], "value": res.body.data.channels[i]};
              //     that.selectChannels.push(item);
              //     that.channels.push(res.body.data.channels[i]);
              //     that.channelsDisable = false;
              //   }
              // }
              that.selectProvinces.push("全部");
              for (var i = 0; i < res.body.data.provinces.length; i++) {
                that.selectProvinces.push(res.body.data.provinces[i]);
              }
              that.provincesCities = res.body.data.provincesCities;
              return;
            }
            this.showMsg(res.body.msg, "error");
          },
          err => {
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
    },

    getNewlyLine() {
      var that = this;
      that.chartData.columns = [];
      that.channels = [];
      that.selectChannels = [];
      that.$http
        .get(
          that.httpUrl +
            "/newly/count/460?id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token") +
            "&time=" +
            that.time +
            "&province=" +
            that.province +
            "&city=" +
            that.city
        )
        .then(
          res => {
            if (200 == res.body.code) {
              that.chartData.columns.push("createTime");
              var channels = res.body.data.channels;
              if (null != channels && channels <= 1) {
                that.selectChannels.push(channels[0]);
                if (channels.length != 0) {
                  that.selectAll(channels[0]);
                  that.chartData.columns.push(channels[0]);
                }
                that.channelsDisable = true;
              } else {
                that.selectChannels.push("全部");
                if (null != channels) {
                  for (var i = 0; i < channels.length; i++) {
                    that.selectChannels.push(channels[i]);
                  }
                }
                var items = [];
                for (let j in res.body.data.top10) {
                  var item = res.body.data.top10[j];
                  if (that.selectChannels.includes(item)) {
                    that.chartData.columns.push(item);
                    items.push(item);
                  }
                  if (items.length >= 10) {
                    break;
                  }
                }
                that.channels = items;
                that.selectAll(items);
                that.channelsDisable = false;
              }
              that.chartData.rows = res.body.data.mapList;
              return;
            }
            this.showMsg(res.body.msg, "error");
          },
          err => {
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
    },

    selectAll(val) {
      var that = this;
      var allValues = [];
      for (var i = 0; i < that.selectChannels.length; i++) {
        allValues.push(that.selectChannels[i]);
      }
      var oldVal = that.oldOptions.length === 1 ? that.oldOptions[0] : [];
      if (val.includes("全部")) {
        that.channels = allValues;
      }
      if (oldVal.includes("全部") && !val.includes("全部")) {
        that.channels = [];
      }
      if (oldVal.includes("全部") && val.includes("全部")) {
        var index = val.indexOf("全部");
        val.splice(index, 1); // 排除全选选项
        that.channels = val;
      }
      if (!oldVal.includes("全部") && !val.includes("全部")) {
        if (val.length === allValues.length - 1) {
          that.channels = ["全部"].concat(val);
        }
      }
      that.oldOptions[0] = that.channels;
    },

    timeOnPick() {
      this.channelAll = true;
      this.handleOption();
      this.getNewlyLine();
    },

    handleSearch() {
      var that = this;
      that.chartData.columns = [];
      that.chartData.columns.push("createTime");
      for (var i = 0; i < that.channels.length; i++) {
        if (that.channels[i] != "全部") {
          that.chartData.columns.push(that.channels[i]);
        }
      }
    },

    changeProvince(val) {
      var that = this;
      that.channelAll = true;
      that.selectCities = [];
      that.selectCities.push("全部");
      that.city = "全部";
      if ("全部" == val) {
        that.getNewlyLine();
        return;
      }
      for (var i = 0; i < that.provincesCities[val].length; i++) {
        that.selectCities.push(that.provincesCities[val][i]);
      }
      that.getNewlyLine();
      return;
    },

    changeCity(val) {
      this.channelAll = true;
      this.getNewlyLine();
    },

    cityFocus() {
      if (undefined == this.province || "" == this.province) {
        this.$alert("请先选择省份", "提示", {
          confirmButtonText: "确定"
        });
        this.$refs.selectCityRef.blur();
        return;
      }
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

<style scoped>
</style>
