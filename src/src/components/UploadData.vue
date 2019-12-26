<template>
  <el-row class="tac">

    <div style="font-size:24px;padding-bottom:20px">上传队列</div>

    <div style="padding-bottom:20px">个数：{{count}}</div>

    <div class="flex flex-item direction-row-reverse" style="padding-bottom: 20px;">
      <el-upload class="upload-demo" ref="upload" :action="uploadUrl" :on-preview="handlePreview" :on-remove="handleRemove" :before-upload="handleBefore" :on-change="handleChange" :on-success="handleSuccess" :on-progress="handleProgress" :file-list.sync="fileList" :auto-upload="false" :show-file-list="false">
        <el-button slot="trigger" size="medium" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="medium" type="success" @click="submitUpload">上传文件</el-button>
        <el-button type="danger" size="medium" @click="handleDelAll">删除全部</el-button>
        <el-button type="primary" size="medium" @click="handleExport">导出模板</el-button>
      </el-upload>
    </div>
    <el-table :data="tableData" ref="multipleTable" tooltip-effect="dark" border style="width: 100%">
      <el-table-column prop="name" label="文件名"></el-table-column>
      <el-table-column prop="size" label="大小"></el-table-column>
      <el-table-column prop="progress" label="进度">
        <template slot-scope="scope">
          <el-progress :percentage="scope.row.progress"></el-progress>
        </template>
      </el-table-column>
      <el-table-column prop="result" label="结果"></el-table-column>
      <el-table-column fixed="right" label="管理">
        <template slot-scope="scope">
          <el-button @click="handleDel(scope.row)" type="text" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
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
      count: 0,
      tableData: [],
      fileList: [],
      files: [],
      uploadUrl: ""
    };
  },
  mounted() {
    var that = this;
    var uid = window.sessionStorage.getItem("id");
    var token = window.sessionStorage.getItem("token");
    that.mcc = that.config.mcc;
    that.uploadUrl =
      process.env.SERVER_URL +
      "/api/data/upload?mcc=" +
      this.mcc +
      "&uid=" +
      uid +
      "&token=" +
      token;
  },
  methods: {
    handleDel(val) {
      var that = this;
      for (let i in that.tableData) {
        var data = that.tableData[i];
        if (val.uid == data.uid) {
          that.tableData.splice(i, 1);
          break;
        }
      }
      for (let j in that.files) {
        var file = that.files[j];
        if (val.uid == file.uid) {
          that.$refs.upload.handleRemove(file); //删除上传文件列表
          that.files.splice(j, 1);
          break;
        }
      }
      that.count--;
      console.log(this.fileList);
    },
    handleDelAll() {
      var that = this;
      that.count = 0;
      that.tableData = [];
      that.$refs.upload.clearFiles();
    },
    handleExport() {
      if (this.mcc == "460") {
        window.location.href = process.env.SERVER_URL + "/460.xlsx";
      } else {
        window.location.href = process.env.SERVER_URL + "/999.xlsx";
      }
    },
    submitUpload() {
      this.$refs.upload.submit();
    },
    handlePreview(file) {
      console.log("handlePreview");
    },
    handleRemove(file, fileList) {
      console.log("handleRemove");
      console.log(file);
    },
    handleBefore(file) {
      console.log("handleBefore");
    },
    handleSuccess(response, file, fileList) {
      var that = this;
      console.log(response);
      for (let i in that.tableData) {
        var data = that.tableData[i];
        if (file.uid == data.uid) {
          if (response.code != 200) {
            data.result = "上传失败";
            that.showMsg(response.msg, "error");
          } else {
            data.result = "上传成功";
          }
          break;
        }
      }
    },
    handleChange(file, fileList) {
      var that = this;
      if (file.status == "ready") {
        that.tableData.push({
          uid: file.uid,
          name: file.name,
          size: file.size,
          progress: 0,
          result: "未开始"
        });
        that.files.push(file);
        that.count++;
      } else {
        for (let i in that.tableData) {
          var data = that.tableData[i];
          if (file.uid == data.uid) {
            if (file.status == "fail") {
              data.result = "上传失败";
            }
            break;
          }
        }
      }
      that.$refs.upload.abort(file);
    },
    handleProgress(event, file, fileList) {
      console.log(event);
      var that = this;
      for (let i in that.tableData) {
        var data = that.tableData[i];
        if (file.uid == data.uid) {
          data.result = "上传中";
          data.progress = parseInt(event.percent);
          break;
        }
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

