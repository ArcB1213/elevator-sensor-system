<template>
  <div class="elevator-detail" v-if="elevator">
    <h2>电梯详情</h2>
    <nav class="detail-nav">
      <div>
        <router-link
          :to="{
            name: 'BasicDetailPage',
            query: {
              index: i,
            },
          }"
          active-class="active"
        >
          基本信息
        </router-link>
      </div>
      <div>
        <router-link
          :to="{
            name: 'SensorDetailPage',
            query: {
              acceleration: elevator.sensor.acceleration,
              speed: elevator.sensor.speed,
              position: elevator.sensor.position,
            },
          }"
          active-class="active"
        >
          传感器信息
        </router-link>
      </div>
    </nav>

    <RouterView></RouterView>
    <button @click="goBack">返回</button>
  </div>
  <div v-else class="elevator-detail">
    <p>没有选择电梯或电梯信息加载失败。</p>
    <button @click="goBack">返回列表</button>
  </div>
</template>

<script lang="ts">
export default {
  name: "ElevatorDetail",
};
</script>

<script setup lang="ts">
import { computed } from "vue";
import { useElevatorsStore } from "@/store/elevators";
import { useRouter } from "vue-router";

const props = defineProps<{
  index: string;
}>();
const elevatorlist = useElevatorsStore();
const router = useRouter();

const i = computed(() => {
  const val = parseInt(props.index, 10);
  return isNaN(val) ? -1 : val; // 返回 -1 或其他无效指示符如果解析失败
});
const elevator = elevatorlist.elevators[i.value];
//const curStatus = elevatorlist.Status[i.value];

const goBack = () => {
  router.push({ name: "ElevatorInfoPage" });
};
</script>

<style scoped>
.elevator-detail {
  border: solid 3px #33f4e4;
  background-color: #f0f8ff;
  padding: 20px;
  margin-top: 20px;
  text-align: center;
}
.elevator-detail h2 {
  margin-top: 0;
}
.elevator-detail p {
  text-align: left;
  margin-left: 20px;
}
.elevator-detail button {
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.elevator-detail button:hover {
  background-color: #0056b3;
}

.detail-nav {
  border: solid 2px #020202;
  display: flex;
}

.detail-nav div {
  flex: 1;
  text-align: center;
}

.detail-nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #007bff;
}

.detail-nav a.active {
  font-weight: bold;
  color: #f43333;
}
</style>
