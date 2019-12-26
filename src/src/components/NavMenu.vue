<template>
    <el-container>
        <el-header style="background-color:#30466f">
            <div class="flex direction-row align-center" style="height: 100%;font-size: 20px;color:#fff">
                <div class="flex flex-item " style="font-size: 20px;color:#fff">
                    销量统计后台
                </div>
                <div class="flex direction-row-reverse">
                    <el-dropdown @command="handleCommand" trigger="click" style="color:#fff">
                        <span class="el-dropdown-link">
                            用户名：{{username}}
                            <i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="changePwd">&nbsp; &nbsp; &nbsp;修改密码&nbsp; &nbsp; &nbsp;</el-dropdown-item>
                            <el-dropdown-item command="logout">&nbsp; &nbsp; &nbsp;退出</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </div>
            </div>
        </el-header>
        <el-container v-if="level === '1'">
            <el-aside width="300px" background-color="#30466f">
                <el-menu :router=true :default-active=$route.path class="el-menu-vertical-demo" background-color="#30466f" text-color="#fff" active-text-color="#23b8db">
                    <el-menu-item index="/privilege">
                        <span slot="title">权限管理</span>
                    </el-menu-item>
                    <el-menu-item index="/channel">
                        <span slot="title">渠道管理</span>
                    </el-menu-item>
                    <el-submenu index="data">
                        <template slot="title">
                            <span>数据管理</span>
                        </template>
                        <el-menu-item-group>
                            <el-menu-item index="/data460">国内数据</el-menu-item>
                            <el-menu-item index="/data999">国外数据</el-menu-item>
                        </el-menu-item-group>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <el-container>
                <el-main>
                    <Privilege v-if="'privilege'==$route.path.split('/')[1] "></Privilege>
                    <Channel v-if="'channel'==$route.path.split('/')[1]"></Channel>
                    <Data460 v-if="'data460'==$route.path.split('/')[1]"></Data460>
                    <Data999 v-if="'data999'==$route.path.split('/')[1]"></Data999>
                </el-main>
            </el-container>
        </el-container>
        <el-container v-if="level === '2'">
            <el-aside width="300px" background-color="#30466f">
                <el-menu :router=true :default-active=$route.path class="el-menu-vertical-demo" background-color="#30466f" text-color="#fff" active-text-color="#23b8db">
                    <el-menu-item index="/panel">
                        <span slot="title">仪表盘</span>
                    </el-menu-item>
                    <el-menu-item index="/newlyTable">
                        <span slot="title">销量统计查询</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-container>
                <el-main>
                    <Panel v-if="'panel'==$route.path.split('/')[1] "></Panel>
                    <PivotTableHorizontal v-if="'newlyTable'==$route.path.split('/')[1]" v-bind:config="{mcc:mcc}"></PivotTableHorizontal>
                </el-main>
            </el-container>
        </el-container>
    </el-container>
</template>

<script>
import Privilege from "@/components/Privilege";
import Channel from "@/components/ChannelManage";
import Data460 from "@/components/Data460";
import Data999 from "@/components/Data999";

import Panel from "@/components/Panel";
import NewlyTable460 from "@/components/NewlyTable460";
import NewlyTable999 from "@/components/NewlyTable999";
import PivotTableHorizontal from "@/components/PivotTableHorizontal";
export default {
  components: {
    Privilege,
    Channel,
    Data460,
    Data999,
    Panel,
    NewlyTable460,
    NewlyTable999,
    PivotTableHorizontal
  },
  data() {
    return {
      level: "",
      title: "",
      username: "",
      mcc: ""
    };
  },
  mounted() {
    this.username = window.sessionStorage.getItem("username");
    this.level = window.sessionStorage.getItem("level");
    this.mcc = window.sessionStorage.getItem("mcc");
  },
  methods: {
    handleCommand(command) {
      if ("logout" == command) {
        window.sessionStorage.clear();
        this.$router.push({ path: "/login" });
      } else if ("changePwd" == command) {
        this.$router.push({ path: "/changePassword" });
      }
    }
  }
};
</script>