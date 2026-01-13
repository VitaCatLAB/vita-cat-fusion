<template>
  <div class="container">
    <h2>注册</h2>
    <input v-model="register.username" placeholder="用户名" />
    <input v-model="register.password" type="password" placeholder="密码" />
    <button @click="handleRegister">注册</button>
    <p class="result">{{ registerResult }}</p>

    <hr />

    <h2>登录</h2>
    <input v-model="login.username" placeholder="用户名" />
    <input v-model="login.password" type="password" placeholder="密码" />
    <button @click="handleLogin">登录</button>
    <p class="result">{{ loginResult }}</p>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';

  const API_BASE = 'http://127.0.0.1:3000';

  const register = reactive({
    username: '',
    password: '',
  });

  const login = reactive({
    username: '',
    password: '',
  });

  const registerResult = ref('');
  const loginResult = ref('');

  async function handleRegister() {
    registerResult.value = '注册中...';

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(register),
      });

      const data = await res.json();

      if (!res.ok) {
        registerResult.value = data.message || '注册失败';
        return;
      }

      registerResult.value = `注册成功：${data.username}`;
    } catch (e) {
      registerResult.value = '网络错误';
    }
  }

  async function handleLogin() {
    loginResult.value = '登录中...';

    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(login),
      });

      const data = await res.json();

      if (!res.ok) {
        loginResult.value = data.message || '登录失败';
        return;
      }

      loginResult.value = `登录成功：${data.username}`;
    } catch (e) {
      loginResult.value = '网络错误';
    }
  }
</script>

<style scoped>
  .container {
    max-width: 360px;
    margin: 40px auto;
  }

  input {
    display: block;
    width: 100%;
    margin-bottom: 8px;
    padding: 6px;
  }

  button {
    width: 100%;
    margin-bottom: 8px;
    padding: 6px;
    cursor: pointer;
  }

  .result {
    min-height: 20px;
    color: #333;
    font-size: 14px;
  }

  hr {
    margin: 20px 0;
  }
</style>
