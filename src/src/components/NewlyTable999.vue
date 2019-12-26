<template>
  <div class="tac">
    <div>
      <el-select v-model="mcc" placeholder="选择国家" @change="changeMcc" style="padding-top: 1%; padding-bottom: 1%">
        <el-option v-for="item in selectMcc" :key="item" :label="item" :value="item">
        </el-option>
      </el-select>
      <el-select v-model="hsman" placeholder="选择厂商" @change="changeHsman" style="padding-top: 1%; padding-bottom: 1%">
        <el-option v-for="item in selectHsman" :key="item" :label="item" :value="item">
        </el-option>
      </el-select>
      <el-select v-model="hstype" placeholder="选择机型" @change="changeHstype" style="padding-top: 1%; padding-bottom: 1%">
        <el-option v-for="item in selectHstype" :key="item" :label="item" :value="item">
        </el-option>
      </el-select>
      <el-select v-model="exthstype" placeholder="选择拓展机型" @change="changeExtHstype" style="padding-top: 1%; padding-bottom: 1%">
        <el-option v-for="item in selectExtHstype" :key="item" :label="item" :value="item">
        </el-option>
      </el-select>
      <el-date-picker v-model="time" type="daterange" align="right" unlink-panels range-separator="" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" @change="timeOnPick">
      </el-date-picker>
    </div>
    <div class="flex direction-row">
      <el-button type="primary" @click="handleSearch" style="margin-top: 1%; margin-bottom: 1%">查询</el-button>
      <el-button type="info" @click="handleExport" style="margin-top: 1%; margin-bottom: 1%">导出</el-button>
    </div>
    <el-table :data="tableData" ref="multipleTable" tooltip-effect="dark" border style="width: 100%; padding-top: 1%" show-summary :summary-method="getSummaries">
      <el-table-column prop="mcc" label="国家"></el-table-column>
      <el-table-column prop="hsman" label="厂商"></el-table-column>
      <el-table-column prop="hstype" label="机型"></el-table-column>
      <el-table-column prop="exthstype" label="拓展机型"></el-table-column>
      <el-table-column prop="ct" label="数量"></el-table-column>
      <el-table-column prop="date" label="日期"></el-table-column>
    </el-table>

    <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="pageSize" layout="total, prev, pager, next" :total="count">
    </el-pagination>

  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [],
      selectMcc: [],
      mcc: "",
      hsman: "",
      selectHsman: [],
      hstype: "",
      selectHstype: [],
      exthstype: "",
      selectExtHstype: [],
      httpUrl: process.env.SERVER_URL + "/api",
      time: [],
      currentPage: 1,
      pageSize: 13,
      count: 0,
      offset: 0,
      sum: 0,
      change: false
    };
  },

  mounted() {
    this.init();
  },

  methods: {
    init() {
      var that = this;
      that.selectMcc = [];
      that.mcc = "";
      that.offset = 0;
      that.$http
        .get(
          that.httpUrl +
            "/newly/time?id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token") +
            "&mcc=999"
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
              that.handleTable();
              return;
            }
            this.showMsg(res.body.msg, "error");
          },
          err => {
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
    },

    handleCurrentChange() {
      this.offset = (this.currentPage - 1) * this.pageSize;
      this.handleTable();
    },

    handleTable() {
      var that = this;
      that.tableData = [];
      if (that.change) {
        this.offset = 0;
        this.currentPage = 1;
      }
      that.$http
        .get(
          that.httpUrl +
            "/newly/table/count/999?id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token") +
            "&time=" +
            that.time +
            "&mcc=" +
            that.mcc +
            "&hsman=" +
            that.hsman +
            "&hstype=" +
            that.hstype +
            "&exthstype=" +
            that.exthstype +
            "&offset=" +
            that.offset +
            "&limit=" +
            that.pageSize
        )
        .then(
          res => {
            that.tableData = [];
            if (200 == res.body.code) {
              for (var i = 0; i < res.body.data.list.length; i++) {
                that.tableData.push(res.body.data.list[i]);
              }
              that.count = res.body.data.count;
              that.sum = res.body.data.sum;
              this.change = false;
              return;
            }
            that.showMsg(res.body.msg, "error");
          },
          err => {
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
    },

    handleOption() {
      var that = this;
      that.mcc = "";
      that.hsman = "";
      that.hstype = "";
      that.exthstype = "";
      that.$http
        .get(
          that.httpUrl +
            "/newly/option/999?id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token") +
            "&time=" +
            that.time
        )
        .then(
          res => {
            that.selectMcc = [];
            that.selectHsman = [];
            that.selectHstype = [];
            that.selectExtHstype = [];
            if (200 == res.body.code) {
              that.selectMcc.push("全部");
              for (var i = 0; i < res.body.data.mccs.length; i++) {
                that.selectMcc.push(res.body.data.mccs[i]);
              }
              that.selectHsman.push("全部");
              for (var i = 0; i < res.body.data.channels.length; i++) {
                that.selectHsman.push(res.body.data.channels[i]);
              }
              that.selectHstype.push("全部");
              for (var i = 0; i < res.body.data.hstypes.length; i++) {
                that.selectHstype.push(res.body.data.hstypes[i]);
              }
              that.selectExtHstype.push("全部");
              for (let i in res.body.data.exthstype) {
                that.selectExtHstype.push(res.body.data.exthstype[i]);
              }
              return;
            }
            this.showMsg(res.body.msg, "error");
          },
          err => {
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
    },

    timeOnPick() {
      this.change = true;
      this.handleOption();
    },

    changeMcc(val) {
      this.change = true;
    },

    changeHsman(val) {
      this.change = true;
    },

    changeHstype(val) {
      this.change = true;
    },

    changeExtHstype(val) {
      this.change = true;
    },

    handleSearch() {
      this.offset = 0;
      this.currentPage = 1;
      this.handleTable();
    },

    handleExport() {
      var that = this;
      that.$http
        .get(
          that.httpUrl +
            "/newly/export/count/999?id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token") +
            "&time=" +
            that.time +
            "&mcc=" +
            that.mcc +
            "&hsman=" +
            that.hsman +
            "&hstype=" +
            that.hstype +
            "&exthstype=" +
            that.exthstype
        )
        .then(
          res => {
            if (200 == res.body.code) {
              window.open(res.body.data);
              return;
            }
            that.showMsg(res.body.msg, "error");
          },
          err => {
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
    },

    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计:";
          return;
        }
        if (index === 4) {
          const values = data.map(item => Number(item[column.property]));
          if (!values.every(value => isNaN(value))) {
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return this.sum;
              } else {
                return this.sum;
              }
            }, 0);
          }
        }
      });

      return sums;
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
