<template>
  <div>
    <button @click="handleError">test</button>
  </div>
</template>

<script lang="ts" setup>
  const handleError = () => {
    let time = new Date().getTime() as any;

    let date = time.split('xx');
    console.log(date);
  };
</script>
