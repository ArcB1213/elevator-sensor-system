<template>
  <p><strong>电梯ID:</strong> {{ elevator.id }}</p>
  <p><strong>电梯名称:</strong> {{ elevator.name }}</p>
  <p><strong>电梯所在建筑:</strong> {{ elevator.location }}</p>
  <p><strong>运行状态:</strong> {{ curStatus }}</p>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { useElevatorsStore } from "@/store/elevators";
import { ref } from "vue";

const route = useRoute();
const elevatorlist = useElevatorsStore();

const indexParam = route.query.index;
const index = ref(Array.isArray(indexParam) ? Number(indexParam[0]) : Number(indexParam ?? 0));
const elevator = elevatorlist.elevators[index.value];
const curStatus = elevatorlist.Status[index.value];
</script>
