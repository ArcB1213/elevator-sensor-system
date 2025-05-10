<template>
  <p :class="getAccClass(acceleration)"><strong>电梯加速度:</strong> {{ acceleration }}</p>
  <p :class="getSpdClass(speed)"><strong>电梯速度:</strong> {{ speed }}</p>
  <p :class="getPosClass(position)"><strong>电梯所在楼层:</strong> {{ position }}</p>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
const { acceleration, speed, position } = route.query;

const getAccClass = (data) => {
  if (data >= 0 && data <= 5) return "normal";
  else return "highlight";
};

const getSpdClass = (data) => {
  if (data >= 0 && data <= 30) return "normal";
  else return "highlight";
};

const getPosClass = (data) => {
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
