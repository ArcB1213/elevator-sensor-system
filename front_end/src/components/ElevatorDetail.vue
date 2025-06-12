<template>
  <div v-if="loading">传感器数据加载中</div>
  <div v-else>
    <div class="elevator-detail" v-if="elevator">
      <h2>电梯详情</h2>
      <nav class="detail-nav">
        <div>
          <router-link
            :to="{
              name: 'BasicDetailPage',
              query: {
                index: elevator_id,
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
                index: elevator_id,
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
      <button @click="goBack">返回</button>
    </div>

  </div>
</template>

<script lang="ts">
export default {
  name: "ElevatorDetail",
};
</script>

<script setup lang="ts">
import {ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { Elevator } from "@/interface";
import {elevatorApi} from "@/api/elevators";

const props = defineProps<{
  index: string;
}>();
const router = useRouter();
const elevator_id=props.index;
const elevator = ref<Elevator | null>(null);
const loading = ref(false);

// 获取单个电梯信息
const getElevatorDetail = async (elevator_id:string) => {
  try {
    loading.value = true;
    const response = await elevatorApi.getElevatorInfo(elevator_id)
    elevator.value = response.data;
    loading.value = false;
  } catch (err) {
    console.error('获取电梯详情失败:', err)
    throw err
  }
}

const goBack = () => {
  router.push({ name: "ElevatorInfoPage" });
};

onMounted(() => {
  if (elevator_id) {
    getElevatorDetail(elevator_id).catch(err => {
      console.error('加载电梯详情时发生错误:', err);
    });
  }
});
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
