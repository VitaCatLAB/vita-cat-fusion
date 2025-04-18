<template>
  <div
    v-if="visible"
    :style="{
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '10px',
      borderRadius: '5px',
      whiteSpace: 'pre-wrap',
    }"
  >
    <pre>{{ formattedData }}</pre>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  const props = defineProps({
    visible: Boolean,
    position: Object,
    data: Object,
  });

  const formattedData = computed(() => JSON.stringify(props.data, null, 2));
</script>
