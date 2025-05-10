<template>
  <div class="elevator-list">
    <h2>电梯列表</h2>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>名称</th>
            <th>位置</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="elevator in filteredElevators" :key="elevator.id">
            <td>{{ elevator.id }}</td>
            <td>{{ elevator.name }}</td>
            <td>{{ elevator.location }}</td>
            <td :class="getStatusClass(elevatorlist.Status[elevator.id - 1])">
              {{ elevatorlist.Status[elevator.id - 1] }}
            </td>
            <td>
              <button @click="getDetails(elevator.id - 1)">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <label for="status">根据状态检索: </label>
    <select v-model="selectedStatus">
      <option value="">全部</option>
      <option v-for="status in elevatorlist.elevatorStatus" :key="status" :value="status">
        {{ status }}
      </option>
    </select>

    <label for="location">根据位置检索: </label>
    <select v-model="selectedLocation">
      <option value="">全部</option>
      <option v-for="location in uniqueLocations" :key="location" :value="location">
        {{ location }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
export default {
  name: "ElevatorList",
};
</script>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useElevatorsStore } from "@/store/elevators";

const elevatorlist = useElevatorsStore();
const selectedStatus = ref("");
const selectedLocation = ref("");
const emit = defineEmits(["view-details"]);

const uniqueLocations = computed(() => {
  const locationSet = new Set(elevatorlist.elevators.map((elevator) => elevator.location));
  return Array.from(locationSet).sort();
});

//根据状态和位置过滤电梯列表
const filteredElevators = computed(() => {
  if (!selectedStatus.value && !selectedLocation.value) {
    return elevatorlist.elevators;
  }
  return elevatorlist.elevators.filter(
    (elevator) =>
      (selectedStatus.value
        ? elevatorlist.Status[elevator.id - 1] === selectedStatus.value
        : true) && (selectedLocation.value ? elevator.location === selectedLocation.value : true)
  );
});

//根据状态决定样式
const getStatusClass = (status: string) => {
  switch (status) {
    case elevatorlist.elevatorStatus[0]:
      return "status-running";
    case elevatorlist.elevatorStatus[1]:
      return "status-warning";
    case elevatorlist.elevatorStatus[2]:
      return "status-error";
    default:
      return "";
  }
};

//进入详情
const getDetails = (index: number) => {
  emit("view-details", index);
};
</script>

<style scoped>
.elevator-list {
  border: solid 3px #33f4e4;
  background-color: aliceblue;
  text-align: center;
  padding: 1rem;
}

th,
td {
  border: 1.5px solid #928f8f;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}

.status-running {
  background-color: #4caf50;
  color: white;
}
.status-warning {
  background-color: #ff9800;
  color: white;
}
.status-error {
  background-color: #f44336;
  color: white;
}

select {
  margin-top: 1rem;
  margin-left: 0.5rem;
  margin-right: 2rem;
}
</style>
