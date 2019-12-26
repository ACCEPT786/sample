<template>
  <div class="newly-count">
    <el-card class="newly-day">
      <div style="display: flex;align-items: center;">
        <img :src="newlyDayImage" style="transform: scale(0.6);">
        <div style="width: 100%">
          <h1 v-loading="newlyDayLoading">{{newlyDayCount}}</h1>
          <div class="subscript">{{newlyDayDate}} 新增</div>
        </div>
      </div>
    </el-card>
    <el-card class="newly-week">
      <div style="display: flex;align-items: center;">
        <img :src="newlyWeekImage" style="transform: scale(0.6);">
        <div style="width: 100%">
          <h1 v-loading="newlyWeekLoading">{{newlyWeekCount}}</h1>
          <div class="subscript">上周新增</div>
        </div>
      </div>
    </el-card>
    <el-card class="newly-month">
      <div style="display: flex;align-items: center;">
        <img :src="newlyMonthImage" style="transform: scale(0.6);">
        <div style="width: 100%">
          <h1 v-loading="newlyMonthLoading">{{newlyMonthCount}}</h1>
          <div class="subscript">上月新增</div>
        </div>
      </div>
    </el-card>
    <el-card class="newly-quarter">
      <div style="display: flex;align-items: center;">
        <img :src="newlyQuarterImage" style="transform: scale(0.6);">
        <div style="width: 100%">
          <h1 v-loading="newlyQuarterLoading">{{newlyQuarterCount}}</h1>
          <div class="subscript">上一季度新增</div>
        </div>
      </div>
    </el-card>
  </div>
</template>


<script>
  export default {
    data() {
      return {
        newlyDayLoading: false,
        newlyDayCount: "",
        newlyDayImage: "",
        newlyDayDate: "",
        newlyWeekLoading: false,
        newlyWeekCount: "",
        newlyWeekImage: "",
        newlyMonthLoading: false,
        newlyMonthCount: "",
        newlyMonthImage: "",
        newlyQuarterLoading: false,
        newlyQuarterCount: "",
        newlyQuarterImage: "",
        httpUrl: process.env.SERVER_URL + "/api"
      }
    },

    mounted() {
      this.init()
    },

    methods: {
      init() {
        var that = this;
        that.newlyDayLoading = true;
        that.$http.get(that.httpUrl + "/newly/1/count?id=" +
          window.sessionStorage.getItem("id") + "&token=" + window.sessionStorage.getItem("token") +
          "&mcc=" + window.sessionStorage.getItem("mcc")).then(
          res => {
            if (200 == res.body.code) {
              that.newlyDayCount = res.body.data;
              that.newlyDayLoading = false;
              return
            }
            that.newlyDayLoading = false;
            this.showMsg(res.body.msg, "error");
          },
          err => {
            that.newlyDayLoading = false;
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
        that.newlyWeekLoading = true;
        that.$http.get(that.httpUrl + "/newly/2/count?id=" +
          window.sessionStorage.getItem("id") + "&token=" + window.sessionStorage.getItem("token") +
          "&mcc=" + window.sessionStorage.getItem("mcc")).then(
          res => {
            if (200 == res.body.code) {
              that.newlyWeekCount = res.body.data;
              that.newlyWeekLoading = false;
              return
            }
            that.newlyWeekLoading = false;
            this.showMsg(res.body.msg, "error");
          },
          err => {
            that.newlyWeekLoading = false;
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
        that.newlyMonthLoading = true;
        that.$http.get(that.httpUrl + "/newly/3/count?id=" +
          window.sessionStorage.getItem("id") + "&token=" + window.sessionStorage.getItem("token") +
          "&mcc=" + window.sessionStorage.getItem("mcc")).then(
          res => {
            if (200 == res.body.code) {
              that.newlyMonthCount = res.body.data;
              that.newlyMonthLoading = false;
              return
            }
            that.newlyMonthLoading = false;
            this.showMsg(res.body.msg, "error");
          },
          err => {
            that.newlyMonthLoading = false;
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
        that.newlyQuarterLoading = true;
        that.$http.get(that.httpUrl + "/newly/4/count?id=" +
          window.sessionStorage.getItem("id") + "&token=" + window.sessionStorage.getItem("token") +
          "&mcc=" + window.sessionStorage.getItem("mcc")).then(
          res => {
            if (200 == res.body.code) {
              that.newlyQuarterCount = res.body.data;
              that.newlyQuarterLoading = false;
              return
            }
            that.newlyQuarterLoading = false;
            this.showMsg(res.body.msg, "error");
          },
          err => {
            that.newlyQuarterLoading = false;
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
        that.newlyDayImage = require("../assets/Images/yellow.png");
        that.newlyWeekImage = require("../assets/Images/white.png");
        that.newlyMonthImage = require("../assets/Images/green.png");
        that.newlyQuarterImage = require("../assets/Images/red.png");

        that.$http.get(that.httpUrl + "/newly/time?id=" +
          window.sessionStorage.getItem("id") + "&token=" + window.sessionStorage.getItem("token") + "&mcc=" + window.sessionStorage.getItem("mcc")).then(
          res => {
            if (200 == res.body.code) {
              const date = new Date();
              if (null == res.body.data) {
                date.setTime(new Date() - 1000 * 3600 * 24);
                that.newlyDayDate = that.$DateFormat(date, "yyyy-mm-dd");
                return;
              }
              date.setTime(res.body.data);
              that.newlyDayDate = that.$DateFormat(date, "yyyy-mm-dd");
              return;
            }
            this.showMsg(res.body.msg, "error");
          },
          err => {
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        )
      },

    }
  }
</script>

<style scoped type="text/css">
  .newly-count {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    border-top: 1px solid #e5e5e5;
    flex-direction: row;
    width: 100%;
  }

  .newly-count .newly-day,
  .newly-count .newly-week,
  .newly-count .newly-month,
  .newly-count .newly-quarter {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    flex: 1;
    justify-content: center;
    align-items: center;
    border-right: 1px solid #e5e5e5;
    border-bottom: 1px solid #e5e5e5;
    cursor: pointer;
    margin: 1%;
  }

  .newly-count .newly-day {
    background-color: #3399CC;
  }

  .newly-count .newly-week {
    background-color: #009966;
  }

  .newly-count .newly-month {
    background-color: #663399;
  }

  .newly-count .newly-quarter {
    background-color: #FF9933;
  }

  .newly-count .newly-day .header,
  .newly-count .newly-week .header,
  .newly-count .newly-month .header {
    text-align: left;
  }

  .newly-count .newly-day .header span,
  .newly-count .newly-week .header span,
  .newly-count .newly-month .header span {
    text-align: left;
    font-size: 20px;
    font-weight: normal;
  }

  .newly-count .newly-day h1,
  .newly-count .newly-week h1,
  .newly-count .newly-month h1,
  .newly-count .newly-quarter h1 {
    font-size: 40px;
    text-align: right;
    font-weight: bold;
    width: 100%;
    color: white;
  }

  .newly-count .newly-day .subscript,
  .newly-count .newly-week .subscript,
  .newly-count .newly-month .subscript,
  .newly-count .newly-quarter .subscript {
    font-size: 15px;
    text-align: right;
    font-weight: bold;
    width: 100%;
    margin-top: 5%;
    color: white;
  }

  .newly-count .newly-day span,
  .newly-count .newly-week span,
  .newly-count .newly-month span {
    font-size: 16px;
    color: #555555;
  }
</style>
