<template>
  <div v-if="user.signStatus">
    <ElevatorList @view-details="switchToDetailView" />
  </div>
  <div v-else>
    <h2>请先登录</h2>
    <SignIn />
  </div>
</template>

<script lang="ts">
export default {
  name: "ElevatorInfo",
};
</script>

<script setup lang="ts">
import SignIn from "@/components/sign_in.vue";
import ElevatorList from "@/components/ElevatorList.vue";
import { useUserStore } from "@/store/user";
import { useRouter } from "vue-router";

const router = useRouter();
const user = useUserStore();

const switchToDetailView = (index: number) => {
  router.push({ name: "ElevatorDetailLayout", params: { index: index } });
};
</script>
