<template>
  <el-row v-loading="loading">
    <div style="padding: 1%;font-size: 20px;font-weight: bold;color: #003366">
      新增量占比饼图
    </div>
    <div class="flex direction-row" style="padding-bottom: 20px;">
      <div class="flex-item direction-row" style="padding-left:100px">
        渠道:
        <el-select v-model="search.hsman" placeholder="请选择" @change="hsmanChange" filterable remote>
          <el-option v-for="item in hsmanOptions" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
        <el-select v-model="search.type" placeholder="请选择" @change="typeChange" collapse-tags>
          <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        :
        <el-select v-model="search.value" placeholder="请选择" @change="valueChange" multiple filterable collapse-tags remote>
          <el-option v-for="item in valueOptions" :key="item" :label="item" :value="item">
          </el-option>
        </el-select>
        <el-button type="primary" @click="handleSelect">查询</el-button>
      </div>
    </div>

    <div class="flex direction-row">
      <div class="pie">
        <ve-pie :title="title" :data="chartData" :settings="chartSettings" :legend="legend" width="800px"></ve-pie>
      </div>
      <div class="rate">
        <el-table :data="tableData" border max-height="400" stripe>
          <el-table-column prop="name" label="机型" width="200"></el-table-column>
          <el-table-column prop="rate" label="占比" width="200"></el-table-column>
        </el-table>
      </div>
    </div>
  </el-row>
</template>

<script>
import numerify from "numerify";
export default {
  props: {
    config: Object
  },
  data() {
    return {
      uid: "",
      token: "",
      mccType: "",
      loading: false,
      search: {
        hsman: "",
        type: 1,
        value: []
      },
      hsmanOptions: [],
      typeOptions: [
        {
          label: "机型",
          value: 1
        },
        {
          label: "拓展机型",
          value: 2
        }
      ],
      valueOptions: [],
      oldOptions: [],
      hstypeMap: {},
      extHstypeMap: {},
      title: {
        text: "",
        // subtext: "总数",
        textStyle: {
          fontSize: 20
        },
        // subtextStyle: {
        //   fontSize: 20
        // },
        x: "center",
        y: "top"
      },
      chartData: {
        columns: ["name", "ct"],
        rows: []
      },
      chartSettings: {
        dimension: "name",
        metrics: "ct"
      },
      legend: {
        selectorLabel: {
          show: false
        },
        orient: "horizontal",
        // x: "right",
        y: "bottom",
        textStyle: {
          fontSize: 14
        },
        icon: "roundRect",
        formatter: function(param) {
          return param;
        }
      },
      tableData: [],
      hstypeData: [],
      exthstypeData: [],
      reload: true
    };
  },
  mounted() {
    var that = this;
    that.uid = window.sessionStorage.getItem("id");
    that.token = window.sessionStorage.getItem("token");
    that.mccType = window.sessionStorage.getItem("mcc");
    // that.httpGetData();
  },
  watch: {
    config(val, oldVal) {
      var valStr = JSON.stringify(val);
      var oldValStr = JSON.stringify(oldVal);
      if (this.reload) {
        if (this.config.time.length == 2) {
          this.reload = false;
          this.init();
        }
      }
      if (this.testIsEmpty(oldValStr) || valStr !== oldValStr) {
        if (this.config.time.length == 2) {
          this.init();
        }
      }
    }
  },
  methods: {
    hsmanChange(val) {
      var that = this;
      that.tableData = [];
      that.chartData.rows = [];
      that.hstypeOptions = that.hstypeMap[val];
      that.extHstypeOptions = that.extHstypeMap[val];
      that.httpGetData(val);
    },
    typeChange(val) {
      var that = this;
      var hstype = [];
      that.oldOptions = [];

      if (1 === val) {
        that.valueOptions = that.hstypeMap[that.search.hsman];
        for (let i in that.hstypeData) {
          var item = that.hstypeData[i];
          if (item.hsman == that.search.hsman) {
            hstype.push(item.hstype);
            if (hstype.length >= 10) {
              break;
            }
          }
        }
      } else {
        that.valueOptions = that.extHstypeMap[that.search.hsman];
        for (let i in that.exthstypeData) {
          var item = that.exthstypeData[i];
          if (item.hsman == that.search.hsman) {
            hstype.push(item.hstype);
            if (hstype.length >= 10) {
              break;
            }
          }
        }
      }

      that.search.value = hstype;
      that.valueChange(hstype);
      that.handleSelect();
    },
    valueChange(val) {
      var that = this;
      var allValues = [];
      if ("undefined" != typeof that.valueOptions) {
        for (var i = 0; i <= that.valueOptions.length; i++) {
          allValues.push(that.valueOptions[i]);
        }
      }
      var oldVal = that.oldOptions.length === 1 ? that.oldOptions[0] : [];
      if (val.includes("全部")) {
        that.search.value = allValues;
      }
      if (oldVal.includes("全部") && !val.includes("全部")) {
        that.search.value = [];
      }
      if (oldVal.includes("全部") && val.includes("全部")) {
        var index = val.indexOf("全部");
        val.splice(index, 1); // 排除全选选项
        that.search.value = val;
      }
      if (!oldVal.includes("全部") && !val.includes("全部")) {
        if (val.length === allValues.length - 1) {
          that.search.value = ["全部"].concat(val);
        }
      }
      that.oldOptions[0] = that.search.value;
    },
    hstypeChange(val) {
      var that = this;
      that.search.exthstype = [];
      that.oldExtOptions = [];
      var allValues = [];
      for (var i = 0; i < that.hstypeOptions.length; i++) {
        allValues.push(that.hstypeOptions[i]);
      }
      var oldVal = that.oldOptions.length === 1 ? that.oldOptions[0] : [];
      if (val.includes("全部")) {
        that.search.hstype = allValues;
      }
      if (oldVal.includes("全部") && !val.includes("全部")) {
        that.search.hstype = [];
      }
      if (oldVal.includes("全部") && val.includes("全部")) {
        var index = val.indexOf("全部");
        val.splice(index, 1); // 排除全选选项
        that.search.hstype = val;
      }
      if (!oldVal.includes("全部") && !val.includes("全部")) {
        if (val.length === allValues.length - 1) {
          that.search.hstype = ["全部"].concat(val);
        }
      }
      that.oldOptions[0] = that.search.hstype;
    },
    extHstypeChange(val) {
      var that = this;
      that.search.hstype = [];
      that.oldOptions = [];
      var allValues = [];
      for (var i = 0; i < that.extHstypeOptions.length; i++) {
        allValues.push(that.extHstypeOptions[i]);
      }
      var oldVal = that.oldExtOptions.length === 1 ? that.oldExtOptions[0] : [];
      if (val.includes("全部")) {
        that.search.exthstype = allValues;
      }
      if (oldVal.includes("全部") && !val.includes("全部")) {
        that.search.exthstype = [];
      }
      if (oldVal.includes("全部") && val.includes("全部")) {
        var index = val.indexOf("全部");
        val.splice(index, 1); // 排除全选选项
        that.search.exthstype = val;
      }
      if (!oldVal.includes("全部") && !val.includes("全部")) {
        if (val.length === allValues.length - 1) {
          that.search.exthstype = ["全部"].concat(val);
        }
      }
      that.oldExtOptions[0] = that.search.exthstype;
    },
    handleSelect() {
      var that = this;
      var sum = 0;
      var valueList = [];
      that.tableData = [];
      that.chartData.rows = [];
      if (that.search.type === 1) {
        for (let i in that.hstypeData) {
          var item = that.hstypeData[i];
          if (
            item.hsman == that.search.hsman &&
            that.search.value.includes(item.hstype)
          ) {
            that.chartData.rows.push({ name: item.hstype, ct: item.ct });
            valueList.push(item.ct);
            sum = sum + item.ct;
          }
        }
      } else {
        for (let i in that.exthstypeData) {
          var item = that.exthstypeData[i];
          if (
            item.hsman == that.search.hsman &&
            that.search.value.includes(item.hstype)
          ) {
            that.chartData.rows.push({ name: item.hstype, ct: item.ct });
            valueList.push(item.ct);
            // sum += item.ct;
          }
        }
      }
      for (let j in that.chartData.rows) {
        var rate;
        var item = that.chartData.rows[j];
        // if (sum == 0) {
        // rate = "0%";
        // } else {
        rate = this.getRate(valueList, valueList.indexOf(item.ct), 2) + "%";
        // rate = numerify(item.ct / sum, "0,0.[00]%");
        // }
        that.tableData.push({
          name: item.name,
          rate: rate
        });
      }
    },
    init() {
      var uid = window.sessionStorage.getItem("id");
      var that = this;

      var mcc = this.config.mcc;
      var province = this.config.province;
      var city = this.config.city;
      if (this.testIsEmpty(mcc)) {
        mcc = "";
      }
      if (this.testIsEmpty(province)) {
        province = "";
      }
      if (this.testIsEmpty(city)) {
        city = "";
      }
      let url =
        process.env.SERVER_URL +
        "/api/userData/pie/channel?uid=" +
        that.uid +
        "&token=" +
        that.token +
        "&mccType=" +
        that.mccType +
        "&date=" +
        that.config.time +
        "&mcc=" +
        mcc +
        "&province=" +
        province +
        "&city=" +
        city;
      that.loading = true;
      that.hstypeData = [];
      that.exthstypeData = [];
      that.hsmanOptions = [];
      that.hstypeMap = {};
      that.extHstypeMap = {};
      that.search.hsman = "";
      that.$http.get(url).then(
        res => {
          that.loading = false;
          that.tableData = [];
          var body = res.body;
          console.log(body);
          if (200 == body.code) {
            that.hsmanOptions = body.data.hsmans;
            that.hstypeMap = body.data.hstypeMap;
            that.extHstypeMap = body.data.extHstypeMap;
            that.search.hsman = that.hsmanOptions[0];

            that.tableData = [];
            that.chartData.rows = [];
            that.hstypeOptions = that.hstypeMap[that.hsmanOptions[0]];
            that.extHstypeOptions = that.extHstypeMap[that.hsmanOptions[0]];
            that.httpGetData(that.hsmanOptions[0]);
            return;
          }
          that.showMsg(body.msg, "error");
        },
        err => {
          that.loading = false;
          that.showMsg("服务器请求失败，请检查网络连接！", "error");
        }
      );
    },
    httpGetData(hsman) {
      var uid = window.sessionStorage.getItem("id");
      var that = this;

      var mcc = this.config.mcc;
      var province = this.config.province;
      var city = this.config.city;
      if (this.testIsEmpty(mcc)) {
        mcc = "";
      }
      if (this.testIsEmpty(province)) {
        province = "";
      }
      if (this.testIsEmpty(city)) {
        city = "";
      }
      let url =
        process.env.SERVER_URL +
        "/api/userData/pie/data?uid=" +
        that.uid +
        "&token=" +
        that.token +
        "&mccType=" +
        that.mccType +
        "&date=" +
        that.config.time +
        "&mcc=" +
        mcc +
        "&province=" +
        province +
        "&city=" +
        city +
        "&hsman=" +
        hsman;
      that.loading = true;
      that.hstypeData = [];
      that.exthstypeData = [];
      that.$http.get(url).then(
        res => {
          that.loading = false;
          that.tableData = [];
          var body = res.body;
          console.log(body);
          if (200 == body.code) {
            that.hstypeData = body.data.hstypeData;
            that.exthstypeData = body.data.extHstypeData;

            that.search.type = 1;
            that.typeChange(1);
            return;
          }
          that.showMsg(body.msg, "error");
        },
        err => {
          that.loading = false;
          that.showMsg("服务器请求失败，请检查网络连接！", "error");
        }
      );
    },
    testIsEmpty(s) {
      if ("undefined" == typeof s || null == s || s.trim().length == 0) {
        return true;
      }
      return false;
    },
    showMsg(msg, type) {
      this.$message({
        message: msg,
        type: type,
        showClose: true,
        center: true
      });
    },
    getRate(valueList, idx, precision) {
      var zrUtil = require("zrender/lib/core/util");
      if (!valueList[idx]) {
        return 0;
      }

      var sum = zrUtil.reduce(
        valueList,
        function(acc, val) {
          return acc + (isNaN(val) ? 0 : val);
        },
        0
      );

      if (sum === 0) {
        return 0;
      }

      var digits = Math.pow(10, precision);
      var votesPerQuota = zrUtil.map(valueList, function(val) {
        return (isNaN(val) ? 0 : val) / sum * digits * 100;
      });
      var targetSeats = digits * 100;
      var seats = zrUtil.map(votesPerQuota, function(votes) {
        // Assign automatic seats.
        return Math.floor(votes);
      });
      var currentSum = zrUtil.reduce(
        seats,
        function(acc, val) {
          return acc + val;
        },
        0
      );
      var remainder = zrUtil.map(votesPerQuota, function(votes, idx) {
        return votes - seats[idx];
      }); // Has remainding votes.

      while (currentSum < targetSeats) {
        // Find next largest remainder.
        var max = Number.NEGATIVE_INFINITY;
        var maxId = null;

        for (var i = 0, len = remainder.length; i < len; ++i) {
          if (remainder[i] > max) {
            max = remainder[i];
            maxId = i;
          }
        } // Add a vote to max remainder.

        ++seats[maxId];
        remainder[maxId] = 0;
        ++currentSum;
      }

      return seats[idx] / digits;
    } // Number.MAX_SAFE_INTEGER, ie do not support.
  }
};
</script>
