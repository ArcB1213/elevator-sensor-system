<template>
  <div v-if="loading">电梯信息加载中</div>
  <div v-else>
    <p><strong>电梯ID:</strong> {{ elevator?.id }}</p>
    <p><strong>电梯名称:</strong> {{ elevator?.name }}</p>
    <p><strong>电梯所在建筑:</strong> {{ elevator?.location }}</p>
    <p><strong>运行状态:</strong> {{ elevator?.status }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import {ref, onMounted } from "vue";
import type { Elevator } from "@/interface";
import {elevatorApi} from "@/api/elevators";

const route = useRoute();

const elevator_id = typeof route.query.index === "string" ? route.query.index : null;
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

onMounted(() => {
  if (elevator_id) {
    getElevatorDetail(elevator_id).catch(err => {
      console.error('加载电梯详情时发生错误:', err);
    });
  }
});
</script>
