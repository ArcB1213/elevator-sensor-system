import { createRouter, createWebHistory } from "vue-router";
import ElevatorInfo from "../pages/ElevatorInfo.vue";
import Home from "../pages/HomePage.vue";
import SignIn from "@/components/sign_in.vue";
import SignOut from "@/pages/SignOut.vue";
import BasicDetail from "../pages/BasicDetail.vue";
import SensorDetail from "../pages/SensorDetail.vue";
import ElevatorDetail from "@/components/ElevatorDetail.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "Home",
      path: "/",
      component: Home,
    },
    {
      name: "ElevatorInfoPage",
      path: "/ElevatorInfo",
      component: ElevatorInfo,
    },
    {
      name: "ElevatorDetailLayout",
      path: "/ElevatorInfo/detail/:index",
      component: ElevatorDetail,
      props: true,
      redirect: (to) => {
        return { name: "BasicDetailPage", query: { index: to.params.index } };
      },
      children: [
        {
          name: "BasicDetailPage",
          path: "basic",
          component: BasicDetail,
          meta: {
            tabName: "basic",
          },
        },
        {
          name: "SensorDetailPage",
          path: "sensor",
          component: SensorDetail,
          meta: {
            tabName: "sensor",
          },
        },
      ],
    },
    { name: "SignInPage", path: "/SignIn", component: SignIn },
    { name: "SignOutPage", path: "/SignOut", component: SignOut },
  ],
});

export default router;
