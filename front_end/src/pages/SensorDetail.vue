<template>
  <div v-if="sensorsLoading">传感器数据加载中</div>
  <div v-else>
    <table>
      <thead>
        <tr>
          <th>传感器ID</th>
          <th>传感器类型</th>
          <th>传感器数据</th>
          <th>数据更新时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(sensor, index) in sensorData" :key="index">
          <td>{{ sensor.id }}</td>
          <td>{{ sensor.type }}</td>
          <td :class="getClass(sensor.is_abnormal)">{{ sensor.value }}</td>
          <td>{{ sensor.timestamp }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import type {SensorData} from "@/interface.ts";
import {elevatorApi} from "@/api/elevators";

const route = useRoute();
const elevator_id = typeof route.query.index === "string" ? route.query.index : null;
const sensorData = ref<SensorData[]>([]);
const sensorsLoading = ref(false);
const error = ref('');

const fetchSensorData = async (elevator_id: string) => {
  try {
    sensorsLoading.value = true
    const response = await elevatorApi.getElevatorSensors(elevator_id)
    sensorData.value = response.data
  } catch (err: any) {
    error.value = err.message
    console.error('获取传感器数据失败:', err)
  } finally {
    sensorsLoading.value = false
  }
}

const getClass = (is_abnormal:boolean): string => {
  if(is_abnormal)
    return 'highlight';
  else
    return 'normal';
};

onMounted(() => {
  if(!elevator_id) {
    console.error('电梯ID未提供');
    return;
  }

  fetchSensorData(elevator_id);
});
</script>

<style scoped>
.highlight {
  color: red;
  font-weight: bold;
}
</style>
