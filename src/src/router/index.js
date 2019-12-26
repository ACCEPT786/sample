import Vue from 'vue'
import Router from 'vue-router'
import login from '@/components/Login'
import adminLogin from '@/components/AdminLogin'
import changePassword from '@/components/ChangePassword'
import Privilege from '@/components/Privilege'
import NavMenu from '@/components/NavMenu'
import channel from '@/components/ChannelManage'
import Data460 from '@/components/Data460.vue'
import Data999 from '@/components/Data999.vue'

import Panel from "@/components/Panel";
import NewlyTable460 from "@/components/NewlyTable460";
import NewlyTable999 from "@/components/NewlyTable999";
import PivotTableHorizontal from "@/components/PivotTableHorizontal";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      redirect: "/login"
    },
    {
      path: "/login",
      component: login
    },
    {
      path: "/adminLogin",
      component: adminLogin
    },
    {
      path: "/changePassword",
      component: changePassword
    },
    {
      path: '/navMenu',
      name: 'navMenu',
      component: NavMenu,
      children: [
        {
          path: '/privilege',
          name: 'Privilege',
          component: Privilege
        },
        {
          path: '/channel',
          name: 'channel',
          component: channel
        },
        {
          path: '/data460',
          name: 'Data460',
          component: Data460
        },
        {
          path: '/data999',
          name: 'Data999',
          component: Data999
        },
        {
          path: '/panel',
          name: 'Panel',
          component: Panel
        },
        {
          path: '/newlyTable',
          name: 'PivotTableHorizontal',
          component: PivotTableHorizontal
        },
        {
          path: '/newlyTable',
          name: 'NewlyTable999',
          component: NewlyTable999
        }
      ]
    }
  ]
})
