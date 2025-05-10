<template>
  <div class="sign-in">
    <h1>登录</h1>
    <div>
      <label for="username">用户名: </label>
      <input type="text" id="username" v-model="username" required />
    </div>
    <div style="margin: 0.5rem">
      <label for="password">密码: </label>
      <input type="password" id="password" v-model="password" required />
    </div>
    <button type="submit" @click="handleSubmit">登录</button>
  </div>
</template>

<script lang="ts">
export default {
  name: "SignIn",
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";

const router = useRouter();
const user = useUserStore(); // Use the user store to manage user state

const username = ref("");
const password = ref("");

const handleSubmit = () => {
  if (username.value && password.value) {
    user.signStatus = true;
    user.username = username.value;
    user.password = password.value;
    alert("登录成功！");
    router.push("/"); // Redirect to the main page after login
  } else {
    alert("请输入用户名和密码！");
  }
};
</script>

<style scoped>
.sign-in {
  border: solid 3px #33f4e4;
  background-color: aliceblue;
  text-align: center;
}

.sign-in button {
  background-color: #33f4e4;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: none;
  margin: 0.5rem;
}
</style>
