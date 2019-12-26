<template>
  <el-row>
    <div style="padding-bottom:10px">
      <el-button @click="handleDelAll()" type="danger">全部删除</el-button>
    </div>
    <el-table :data="tableData.pageData" ref="tableData" @selection-change="handleSelectionChange" tooltip-effect="dark" border style="width: 100%" v-loading="loading">
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="id" label="序号"></el-table-column>
      <el-table-column prop="date" label="日期"></el-table-column>
      <el-table-column fixed="right" label="管理">
        <template slot-scope="scope">
          <el-button @click="handleDetailsData(scope.row)" type="primary" size="small">浏览</el-button>
          <el-button @click="handleDel(scope.row)" type="danger" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination background layout="total, prev, pager, next" :current-page="tableConfig.pageIndex" :page-size="tableConfig.pageSize" :total="null!=tableData.data?tableData.data.length:0" @current-change="pageChanged"></el-pagination>

    <el-dialog :title="title" :visible.sync="dialogVisible" :before-close="handleClose" v-loading="detailsLoading" :close-on-press-escape="false" :close-on-click-modal="false">
      <div class="flex direction-row" style="padding-bottom: 20px;">
        <div class="flex-item direction-row">
          省份
          <el-select v-model="search.province" placeholder="请选择" @change="provinceChange">
            <el-option v-for="item in provinceOptions" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          城市
          <el-select v-model="search.city" placeholder="请选择">
            <el-option v-for="item in cityOptions" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </div>
        <div class="flex direction-row-reverse">
          <el-button type="primary" @click="detailsSearch">查询</el-button>
        </div>
      </div>

      <el-table :data="detailsData.pageData" ref="tableData" tooltip-effect="dark" border style="width: 100%">
        <el-table-column prop="date" label="日期"></el-table-column>
        <el-table-column prop="province" label="省份"></el-table-column>
        <el-table-column prop="city" label="城市"></el-table-column>
        <el-table-column prop="hsman" label="厂商"></el-table-column>
        <el-table-column prop="hstype" label="机型"></el-table-column>
         <el-table-column prop="exthstype" label="拓展机型"></el-table-column>
        <el-table-column prop="ct" label="数量"></el-table-column>
      </el-table>

      <el-pagination background layout="total, prev, pager, next" :current-page="detailsConfig.pageIndex" :page-size="detailsConfig.pageSize" :total="null!=detailsData.showData?detailsData.showData.length:0" @current-change="detailsPageChanged"></el-pagination>

      <div class="flex justify-center" style="padding-top: 20px">
        <el-button @click="handleClose" type="primary" size="medium" style="width:100%">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="title" :visible.sync="mccDialogVisible" :before-close="mccHandleClose" v-loading="mccDetailsLoading" :close-on-press-escape="false" :close-on-click-modal="false">
      <div class="flex direction-row" style="padding-bottom: 20px;">
        <div class="flex-item direction-row">
          国家
          <el-select v-model="search.mcc" placeholder="请选择">
            <el-option v-for="item in mccOptions" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </div>
        <div class="flex direction-row-reverse">
          <el-button type="primary" @click="mccDetailsSearch">查询</el-button>
        </div>
      </div>

      <el-table :data="detailsData.pageData" ref="tableData" tooltip-effect="dark" border style="width: 100%">
        <el-table-column prop="date" label="日期"></el-table-column>
        <el-table-column prop="mcc" label="国家"></el-table-column>
        <el-table-column prop="hsman" label="厂商"></el-table-column>
        <el-table-column prop="hstype" label="机型"></el-table-column>
         <el-table-column prop="exthstype" label="拓展机型"></el-table-column>
        <el-table-column prop="ct" label="数量"></el-table-column>
      </el-table>

      <el-pagination background layout="total, prev, pager, next" :current-page="detailsConfig.pageIndex" :page-size="detailsConfig.pageSize" :total="null!=detailsData.showData?detailsData.showData.length:0" @current-change="detailsPageChanged"></el-pagination>

      <div class="flex justify-center" style="padding-top: 20px">
        <el-button @click="mccHandleClose" type="primary" size="medium" style="width:100%">关闭</el-button>
      </div>
    </el-dialog>

  </el-row>
</template>

<script>
export default {
  props: {
    config: Object
  },
  data() {
    return {
      mcc: "",
      loading: false,
      tableData: {
        pageData: [],
        data: []
      },
      tableConfig: {
        pageIndex: 0,
        pageSize: 10
      },
      dialogVisible: false,
      detailsLoading: false,
      mccDialogVisible: false,
      mccDetailsLoading: false,
      title: "",
      detailsData: {
        pageData: [],
        showData: [],
        data: []
      },
      detailsConfig: {
        pageIndex: 0,
        pageSize: 10
      },
      search: {
        mcc: "",
        province: "",
        city: ""
      },
      mccOptions: [],
      provinceOptions: [],
      cityOptions: [],
      cityMap: [],
      multipleSelection: []
    };
  },
  mounted() {
    var that = this;
    that.mcc = that.config.mcc;
    that.httpGetTableData();
    this.$EventBus.$on("dataTabChange", () => {
      that.httpGetTableData();
    });
  },
  methods: {
    httpGetTableData() {
      var that = this;
      var uid = window.sessionStorage.getItem("id");
      var token = window.sessionStorage.getItem("token");
      let url =
        process.env.SERVER_URL +
        "/api/data/list?mcc=" +
        that.mcc +
        "&uid=" +
        uid +
        "&token=" +
        token;
      that.loading = true;
      that.tableData.data = [];
      that.$http.get(url).then(
        res => {
          that.loading = false;
          that.tableData.pageData = [];
          var body = res.body;
          if (200 == body.code) {
            for (let i in body.data.data) {
              var id = parseInt(i) + 1;
              that.tableData.data.push({
                id: id,
                date: body.data.data[i].date
              });
            }
            that.pageChanged(1);
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
    pageChanged(page) {
      this.tableConfig.pageIndex = page;
      this.loadPageData(page - 1);
    },
    loadPageData(page) {
      var that = this;
      var data = that.tableData.data.slice(
        page * that.tableConfig.pageSize,
        (page + 1) * that.tableConfig.pageSize
      );
      this.$set(that.tableData, "pageData", data);
    },
    handleDel(val) {
      var that = this;
      var uid = window.sessionStorage.getItem("id");
      var token = window.sessionStorage.getItem("token");
      that
        .$confirm("确认删除这些项目?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          let url =
            process.env.SERVER_URL +
            "/api/data/del?mcc=" +
            that.mcc +
            "&uid=" +
            uid +
            "&token=" +
            token;
          var body = [];
          body.push(val.date);
          that.httpDel(url, body);
        })
        .catch(err => {});
    },
    handleDelAll() {
      var that = this;
      var uid = window.sessionStorage.getItem("id");
      var token = window.sessionStorage.getItem("token");
      that
        .$confirm("确认删除这些项目?", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          var body = [];
          let url =
            process.env.SERVER_URL +
            "/api/data/del?mcc=" +
            that.mcc +
            "&uid=" +
            uid +
            "&token=" +
            token;
          for (let i in that.multipleSelection) {
            var data = that.multipleSelection[i];
            body.push(data.date);
          }
          that.httpDel(url, body);
        })
        .catch(err => {});
    },
    handleClose() {
      var that = this;
      that.dialogVisible = false;
      that.search = {
        mcc: "",
        province: "",
        city: ""
      };
    },
    mccHandleClose() {
      var that = this;
      that.mccDialogVisible = false;
      that.search = {
        mcc: "",
        province: "",
        city: ""
      };
    },
    handleDetailsData(val) {
      var that = this;
      var uid = window.sessionStorage.getItem("id");
      var token = window.sessionStorage.getItem("token");
      if ("460" == that.mcc) {
        that.detailsLoading = true;
        that.dialogVisible = true;
      } else {
        that.mccDetailsLoading = true;
        that.mccDialogVisible = true;
      }
      that.title = val.date;
      let url =
        process.env.SERVER_URL +
        "/api/data/details?mcc=" +
        that.mcc +
        "&date=" +
        val.date +
        "&uid=" +
        uid +
        "&token=" +
        token;
      that.$http.get(url).then(
        res => {
          if ("460" == that.mcc) {
            that.detailsLoading = false;
            that.search.province = "全部";
            that.search.city = "全部";
          } else {
            that.mccDetailsLoading = false;
            that.search.mcc = "全部";
          }
          that.detailsData.pageData = [];
          var body = res.body;
          console.log(body);
          if (200 == body.code) {
            that.detailsData.data = body.data.data.data;
            that.detailsData.showData = that.detailsData.data;
            if ("460" == that.mcc) {
              that.provinceOptions = body.data.data.provinces;
              that.cityMap = body.data.data.citys;
            } else {
              that.mccOptions = body.data.data.mccs;
            }
            that.detailsPageChanged(1);
            return;
          }
          that.showMsg(body.msg, "error");
        },
        err => {
          if ("460" == that.mcc) {
            that.detailsLoading = false;
          } else {
            that.mccDetailsLoading = false;
          }
          that.showMsg("服务器请求失败，请检查网络连接！", "error");
        }
      );
    },
    detailsPageChanged(page) {
      this.detailsConfig.pageIndex = page;
      this.detailsLoadPageData(page - 1);
    },
    detailsLoadPageData(page) {
      var that = this;
      var data = that.detailsData.showData.slice(
        page * that.detailsConfig.pageSize,
        (page + 1) * that.detailsConfig.pageSize
      );
      this.$set(that.detailsData, "pageData", data);
    },
    provinceChange(val) {
      var that = this;
      that.cityOptions = that.cityMap[val];
      that.search.city = "全部";
    },
    detailsSearch() {
      var that = this;
      that.detailsData.showData = [];
      var province = that.search.province;
      var city = that.search.city;
      if ("全部" == province || that.testIsEmpty(province)) {
        that.detailsData.showData = that.detailsData.data;
      } else {
        if ("全部" == city || that.testIsEmpty(city)) {
          for (let i in that.detailsData.data) {
            var data = that.detailsData.data[i];
            if (province == data.province) {
              that.detailsData.showData.push(data);
            }
          }
        } else {
          for (let i in that.detailsData.data) {
            var data = that.detailsData.data[i];
            if (province == data.province && city == data.city) {
              that.detailsData.showData.push(data);
            }
          }
        }
      }
      that.detailsPageChanged(1);
    },
    mccDetailsSearch() {
      var that = this;
      that.detailsData.showData = [];
      var mcc = that.search.mcc;
      if ("全部" == mcc || that.testIsEmpty(mcc)) {
        that.detailsData.showData = that.detailsData.data;
      } else {
        for (let i in that.detailsData.data) {
          var data = that.detailsData.data[i];
          if (mcc == data.mcc) {
            that.detailsData.showData.push(data);
          }
        }
      }
      that.detailsPageChanged(1);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    httpDel(url, data) {
      var that = this;
      that.$http.post(url, data).then(
        res => {
          that.loading = false;
          var body = res.body;
          if (200 == body.code) {
            that.httpGetTableData();
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
    }
  }
};
</script>
