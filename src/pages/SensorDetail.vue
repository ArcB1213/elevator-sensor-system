<template>
  <p :class="getAccClass(acceleration)"><strong>电梯加速度:</strong> {{ acceleration }}</p>
  <p :class="getSpdClass(speed)"><strong>电梯速度:</strong> {{ speed }}</p>
  <p :class="getPosClass(position)"><strong>电梯所在楼层:</strong> {{ position }}</p>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const { acceleration: accRaw, speed: spdRaw, position: posRaw } = route.query;
const acceleration: number = Number(accRaw ?? 0) || 0;
const speed: number = Number(spdRaw ?? 0) || 0;
const position: number = Number(posRaw ?? 0) || 0;

const getAccClass = (data: number): string => {
  if (data >= 0 && data <= 5) return "normal";
  else return "highlight";
};

const getSpdClass = (data: number): string => {
  if (data >= 0 && data <= 30) return "normal";
  else return "highlight";
};

const getPosClass = (data: number): string => {
  if (data > 0 && data <= 12) return "normal";
  else return "highlight";
};
</script>

<style scoped>
.highlight {
  color: red;
  font-weight: bold;
}
</style>
