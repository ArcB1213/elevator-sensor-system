<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from "./store/user";

const user = useUserStore();

// 在组件挂载后初始化
onMounted(() => {
  user.initializeAuth()
  if (user.token) {
    user.verifyToken().catch(() => {
      user.clearUserState()
    })
  }
})
</script>

<template>
  <main id="app">
    <header>
      <nav>
        <ul>
          <li><router-link to="/" active-class="active">首页</router-link></li>
          <li><router-link to="/ElevatorInfo" active-class="active">电梯信息</router-link></li>
          <li>
            <span v-if="user.isAuthenticated"
              ><RouterLink to="/SignOut" active-class="active">登出</RouterLink></span
            >
            <span v-else><RouterLink to="/SignIn" active-class="active">登录</RouterLink></span>
          </li>
        </ul>
      </nav>
    </header>
    <RouterView />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

nav {
  border: solid 3px;
  padding: 1rem;
  font-size: 3vh;
  background-color: aliceblue;
  margin-bottom: 1rem;
}
nav ul {
  list-style: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

nav li {
  padding-left: 1em;
  padding-right: 1em;
}

nav li:hover {
  background-color: aquamarine;
  border-radius: 9px;
}

.active {
  color: rgb(244, 123, 102);
  font-weight: bold;
  border-radius: 5px;
}

#app {
  font-family: Arial, sans-serif;
  margin: 20px;
  border: 3px solid #5191ea;
  border-radius: 5px;
  background-color: #67cff1;
  min-height: 80vh;
}
</style>
