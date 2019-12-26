<template>
  <div class="flex direction-column">
    <!-- <el-dialog :visible.sync="initDialog.visible" title="请选择" :show-close="false" :close-on-click-modal="false" width="30%">
      <el-form>
        <el-form-item label="mcc">
          <el-select v-model="initDialog.selectedMcc" filterable placeholder="请选择国家">
            <template v-for="item in initDialog.mccs">
              <el-option :key="item.value" :label="item.label" :value="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <template v-if="'460'==initDialog.selectedMcc && 'visit_day'==table">
          <el-form-item label="mnc">
            <el-select v-model="initDialog.selectedMncName" placeholder="请选择运营商">
              <template v-for="item in initDialog.mncs">
                <el-option :key="item.value" :label="item.label" :value="item.value"></el-option>
              </template>
            </el-select>
          </el-form-item>
        </template>
        <el-form-item>
          <el-button type="primary" @click="sumbitInitDialog">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog> -->
    <div class="flex direction-row-reverse">
      <div class="flex direction-row">
        <el-button type="primary" @click="queryTableData">查询</el-button>
        <el-button type="info" @click="handleExport">导出</el-button>
      </div>
    </div>
    <div class="flex direction-row">
      <el-card class="box-card flex-item" shadow="never">
        <div slot="header" class="clearfix">
          <span>字段</span>
        </div>
        <div class="flex direction-column">
          <el-scrollbar class="field-list">
            <draggable class="flex direction-column drag-list" :list="tableCols" :group="{ name: 'tableCols', pull: 'clone', put: false }">
              <el-tag v-for="(item,index) in tableCols" :key="index">{{item.label}}</el-tag>
            </draggable>
          </el-scrollbar>
        </div>
      </el-card>
      <el-card class="box-card flex-item" shadow="never">
        <div slot="header" class="clearfix">
          <span>筛选器</span>
          <div style="float: right; padding: 3px 0" v-if="filterLoading">
            <span class="el-icon-loading"></span>
            <span>加载中...</span>
          </div>
        </div>
        <el-dialog :title="'编辑筛选器 '+filterEditField.label" :visible.sync="filterExpressionVisible">
          <el-form>
            <el-form-item label="包含">
              <el-select class="flex-item" v-model="includeFilters" multiple filterable allow-create placeholder="请选择" @change="includeFiltersChange">
                <el-option v-for="item in filterData" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="排除">
              <el-select class="flex-item" v-model="excludeFilters" multiple filterable allow-create placeholder="请选择" @change="excludeFiltersChange">
                <el-option v-for="item in filterData" :key="item" :label="item" :value="item"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer">
            <el-button type="primary" @click="onFilterOkClick">确 定</el-button>
          </div>
        </el-dialog>
        <el-scrollbar class="field-list">
          <draggable class="flex direction-column drag-list" group="tableCols" :list="filters" @add="onAddFilterItem">
            <el-tag v-for="(item,index) in filters" :key="index" closable @close="onTagClose(filters,index)" @click="filterTagClick(item)">{{item.label}}</el-tag>
          </draggable>
        </el-scrollbar>
      </el-card>
      <el-card class="box-card flex-item" shadow="never">
        <div slot="header" class="clearfix">
          <span>查询天数范围</span>
        </div>
        <el-radio-group v-model="dayType" class="flex direction-column">
          <el-radio label="1" class="radio-height">1天内</el-radio>
          <el-radio label="7" class="radio-height">7天内</el-radio>
          <el-radio label="30" class="radio-height">30天内</el-radio>
          <div @click="dayTypeCustom">
            <el-radio label="0" class="radio-height">自定义</el-radio>
          </div>
        </el-radio-group>
        <el-dialog title="自定义时间" :visible.sync="dayTypeVisible" :close-on-press-escape="false" :close-on-click-modal="false">
          <el-date-picker v-model="date" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd">
          </el-date-picker>
          <div slot="footer">
            <el-button type="primary" @click="dayTypeSubmit">确 定</el-button>
          </div>
        </el-dialog>
      </el-card>
      <el-card class="box-card flex-item" shadow="never">
        <div slot="header" class="clearfix">
          <span>行</span>
        </div>
        <el-scrollbar class="field-list">
          <draggable class="flex direction-column drag-list" group="tableCols" :list="rows" @add="onAddRowItem">
            <el-tag v-for="(item,index) in rows" :key="index" closable @close="onTagClose(rows,index)">{{item.label}}</el-tag>
          </draggable>
        </el-scrollbar>
      </el-card>
      <el-card class="box-card flex-item" shadow="never">
        <div slot="header" class="clearfix">
          <span>值(只能做数量查询)</span>
        </div>
        <el-dialog :title="'编辑 '+valueEditField.label" :visible.sync="valueExpressionVisible">
          <el-select v-model="valueEditField.expression" placeholder="请选择">
            <el-option v-for="item in expressions" :key="item.value" :label="item.name" :value="item.value"></el-option>
          </el-select>
          <div slot="footer">
            <el-button type="primary" @click="onValueExpressionOkClick">确 定</el-button>
          </div>
        </el-dialog>
        <el-scrollbar class="field-list">
          <draggable class="flex direction-column drag-list" group="tableCols" :list="vals" @add="onAddValItem">
            <el-tag v-for="(item,index) in vals" :key="index" closable @close="onTagClose(vals,index)" @click="valTagClick(item)">{{item.label}} {{item.expression}}</el-tag>
          </draggable>
        </el-scrollbar>
      </el-card>
    </div>
    <el-card>
      <!-- <div>
        <el-tag>查询国家：{{initDialog.selectedMcc}}</el-tag>
      </div>
      <div v-if="'460'==initDialog.selectedMcc && 'visit_day'==table">
        <el-tag>查询运营商：{{initDialog.selectedMncName}}</el-tag>
      </div>
      <div>
        <el-tag>查询表：{{table}}</el-tag>
      </div> -->
      <div>
        <el-tag>查询日期：{{dateText}}</el-tag>
      </div>
      <div v-for="(item,index) in filters" :key="index">
        <div>
          <el-tag>{{item.label}}包含: {{item.includeFilters}}</el-tag>
        </div>
        <div>
          <el-tag>{{item.label}}排除: {{item.excludeFilters}}</el-tag>
        </div>
      </div>
    </el-card>
    <el-card v-if="loading">
      <div class="flex flex-item justify-center">
        <span class="el-icon-loading"></span>
        <span>加载中...</span>
      </div>
    </el-card>
    <el-table :data="tableData.pageData" :summary-method="tableSummaryCall" v-loading="loading" show-summary border @sort-change="sortChanged">
      <template v-for="col in tableData.cols">
        <el-table-column :prop="col" :label="col" :key="col" sortable="custom"></el-table-column>
      </template>
    </el-table>
    <el-pagination background layout="prev, pager, next" :current-page="tableConfig.pageIndex" :page-size="tableConfig.pageSize" :total="null!=tableData.data?tableData.data.length:0" @current-change="pageChanged"></el-pagination>
  </div>
</template>
<style>
.tableScrollBar {
  overflow-x: auto;
}
.box-card {
  width: 500px;
}
.field-list {
  height: 200px;
}
.field-list > .el-scrollbar__wrap > .el-scrollbar__view {
  height: 100%;
}
.field-list > .el-scrollbar__wrap > .el-scrollbar__view > .drag-list {
  height: 100%;
}
.field-list > .el-scrollbar__wrap {
  overflow-x: hidden;
}
.scrollbar {
  height: 100%;
}
.radio-height {
  height: 30px;
  line-height: 30px;
}
#summary .el-table__header-wrapper {
  display: none;
}
#summary .el-table__row {
  background-color: #f5f7fa;
  color: #606266;
}
</style>
<script>
import draggable from "vuedraggable";
import { Loading } from "element-ui";
export default {
  components: {
    draggable
  },
  props: {
    config: Object
  },
  watch: {
    dayType(val, oldVal) {
      if (0 != val) {
        this.date = [];
        this.dateText = this.dayType + "天内";
      } else {
        this.dateText = "";
      }
    }
  },
  data() {
    return {
      loading: false,
      filterLoading: false,
      filterExpressionVisible: false,
      valueExpressionVisible: false,
      dayTypeVisible: false,
      expressions: [
        { name: "计数", value: "count" },
        { name: "求和", value: "sum" },
        { name: "最大值", value: "max" },
        { name: "最小值", value: "min" }
      ],
      includeFilters: [],
      excludeFilters: [],
      filterData: [],
      filterEditField: {},
      valueEditField: {},
      tableData: {
        cols: [],
        data: [],
        pageData: []
      },
      tableConfig: {
        pageIndex: 0,
        pageSize: 30
      },
      tableCols: [],
      filters: [],
      rows: [{ label: "厂商", name: "hsman", expression: "count" }],
      oldRows: [{ label: "厂商", name: "hsman", expression: "count" }],
      vals: [{ label: "数量", name: "ct", expression: "sum" }],
      dayType: "30",
      table: "",
      date: [],
      dateText: "1天内"
    };
  },
  mounted() {
    var that = this;
    if ("460" === that.config.mcc) {
      that.table = "report_data_460";
    } else if ("999" === that.config.mcc) {
      that.table = "report_data_mcc";
    } else {
      that.$message.error("没有外太空数据");
      return;
    }
    that.updateColumnList();
  },
  methods: {
    dayTypeCustom() {
      this.date = [];
      this.dayTypeVisible = true;
    },
    dayTypeSubmit() {
      if (this.date.length != 2) {
        this.showMsg("请选择时间", "error");
        return;
      }
      this.dateText = this.date[0] + " 至 " + this.date[1];
      this.dayTypeVisible = false;
    },
    sortChanged(column, prop, order) {
      var that = this;
      that.$http
        .post(
          process.env.SERVER_URL +
            "/data/api/pivotTable/sort?" +
            "prop=" +
            column.prop +
            "&order=" +
            column.order +
            "&id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token"),
          that.tableData.data
        )
        .then(
          res => {
            that.tableData.data = res.body;
            that.loadPageData(0);
            that.loading = false;
          },
          res => {
            that.$message.error(res.bodyText);
            that.loading = false;
          }
        );
    },
    onTagClose(list, index) {
      list.splice(index, 1);
    },
    onAddFilterItem(event) {
      if ("add" == event.type) {
        this.doAddEvent("filters", this.filters);
      }
    },
    onAddRowItem(event) {
      if ("add" == event.type) {
        this.doAddEvent("rows", this.rows);
      }
    },
    onAddValItem(event) {
      if ("add" == event.type) {
        this.doAddEvent("vals", this.vals);
      }
    },
    doAddEvent(type, list) {
      var itemsCounter = {};
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var ct = itemsCounter[item.name];
        if (null == ct) {
          itemsCounter[item.name] = [];
        }
        itemsCounter[item.name].push(i);
      }
      for (var item in itemsCounter) {
        if (itemsCounter[item].length >= 2) {
          for (
            var i = itemsCounter[item].length;
            i > itemsCounter[item].length - 1;
            i--
          ) {
            list.splice(itemsCounter[item][i - 1], 1);
          }
        }
      }
      if (this.rows.length > 3) {
        this.showMsg("行选择不能超过3个", "error");
        this.rows = JSON.parse(JSON.stringify(this.oldRows));
        return;
      }
      if ("filters" != type && "vals" != type) {
        var arrays = [this.rows];
        for (var i = 0; i < arrays.length; i++) {
          var itemList = arrays[i];
          if (list != itemList) {
            for (var j = itemList.length - 1; j >= 0; j--) {
              var item = itemList[j];
              for (var it in itemsCounter) {
                if (item.name == it) {
                  itemList.splice(j, 1);
                }
              }
            }
          }
        }
      }
      if ("vals" == type) {
        var arrays = [];
        for (var i = 0; i < this.vals.length; i++) {
          var item = this.vals[i];
          if ("ct" == item.name) {
            arrays.push(item);
          }
        }
      }
      this.oldRows = JSON.parse(JSON.stringify(this.rows));
    },
    valTagClick(item) {
      this.valueEditField = JSON.parse(JSON.stringify(item));
      this.valueExpressionVisible = true;
    },
    filterTagClick(item) {
      var that = this;
      that.filterEditField = JSON.parse(JSON.stringify(item));
      if (null != that.filterEditField.includeFilters) {
        that.includeFilters = that.filterEditField.includeFilters;
      } else {
        that.includeFilters = [];
      }
      if (null != that.filterEditField.excludeFilters) {
        that.excludeFilters = that.filterEditField.excludeFilters;
      } else {
        that.excludeFilters = [];
      }
      that.filterLoading = true;
      that.$http
        .get(
          process.env.SERVER_URL +
            "/data/api/pivotTable/public/" +
            this.table +
            "/" +
            item.name +
            "?date=" +
            this.date +
            "&dayType=" +
            this.dayType +
            "&id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token")
        )
        .then(
          res => {
            var resp = res.body;
            if (200 != resp.code) {
              that.$message.error(resp.msg);
              that.filterLoading = false;
              return;
            }
            that.filterData = resp.data;
            that.filterExpressionVisible = true;
            that.filterLoading = false;
          },
          res => {
            that.$message.error(res);
            that.filterLoading = false;
          }
        );
    },
    includeFiltersChange() {
      this.excludeFilters = [];
    },
    excludeFiltersChange() {
      this.includeFilters = [];
    },
    onFilterOkClick() {
      var that = this;
      for (var i = 0; i < this.filters.length; i++) {
        var item = this.filters[i];
        if (this.filterEditField.name == item.name) {
          item.includeFilters = this.includeFilters;
        }
      }
      for (var i = 0; i < this.filters.length; i++) {
        var item = this.filters[i];
        if (this.filterEditField.name == item.name) {
          item.excludeFilters = this.excludeFilters;
        }
      }
      this.filterExpressionVisible = false;
    },
    onValueExpressionOkClick() {
      this.onValueExpressionProcess();
    },
    onValueExpressionProcess() {
      for (var i = 0; i < this.vals.length; i++) {
        var item = this.vals[i];
        if (this.valueEditField.name == item.name) {
          item.expression = this.valueEditField.expression;
        }
      }
      this.valueExpressionVisible = false;
    },
    updateColumnList() {
      var that = this;
      that.$http
        .get(
          process.env.SERVER_URL +
            "/data/api/pivotTable/public/" +
            this.table +
            "?date=" +
            this.date +
            "&id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token")
        )
        .then(
          res => {
            var resp = res.body;
            if (200 != resp.code) {
              that.$message.error(resp.msg);
              return;
            }
            resp.data.columnList.forEach(e => {
              that.tableCols.push({
                label: e.comment,
                name: e.columnName,
                expression: "count"
              });
            });
          },
          res => {
            that.$message.error(res);
          }
        );
    },
    queryTableData() {
      var that = this;
      if (this.vals.length <= 0) {
        this.$message.error("值不能为空");
        return;
      }
      if (this.rows.length <= 0) {
        this.$message.error("行不能为空");
        return;
      }
      if (this.dayType == "0" && this.date.length != 2) {
        this.$message.error("请选择正确的时间段");
        return;
      }
      that.loading = true;
      that.tableData = [];
      this.$http
        .post(
          process.env.SERVER_URL +
            "/data/api/pivotTable/getData?&id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token"),
          {
            date: this.date,
            table: this.table,
            filters: this.filters,
            rows: this.rows,
            dayType: this.dayType,
            vals: this.vals
          }
        )
        .then(
          res => {
            that.tableData = res.body;
            that.tableConfig.pageIndex = 0;
            that.loadPageData(0);
            that.loading = false;
          },
          res => {
            that.$message.error(res.bodyText);
            that.loading = false;
          }
        );
    },
    handleExport() {
      var that = this;
      that.$http
        .get(
          process.env.SERVER_URL +
            "/data/api/pivotTable/export?id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token") +
            "&mcc=" +
            that.config.mcc +
            "&date=" +
            that.date +
            "&dateType=" +
            that.dayType
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
    loadPageData(page) {
      var that = this;
      var data = that.tableData.data.slice(
        page * that.tableConfig.pageSize,
        (page + 1) * that.tableConfig.pageSize
      );
      this.$set(that.tableData, "pageData", data);
    },
    pageChanged(page) {
      this.loadPageData(page - 1);
    },
    sumbitInitDialog() {
      if ("" == this.initDialog.selectedMcc) {
        this.$message.error("国家不能为空");
        return;
      }
      if (
        "460" == this.initDialog.selectedMcc &&
        "visit_day" == this.table &&
        "" == this.initDialog.selectedMncName
      ) {
        this.$message.error("运营商不能为空");
        return;
      }
      this.initDialog.visible = false;
      if (true == this.config.search) {
        this.queryTableData();
      }
    },
    tableSummaryCall(param) {
      var that = this;
      var { columns, data } = param;
      var sums = [];
      for (var i = 0; i < columns.length; i++) {
        if (0 == i) {
          sums.push("合计");
        } else {
          var e = columns[i];
          var label = e.label;
          var val = that.tableData.summary[label];
          sums.push(val);
        }
      }
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