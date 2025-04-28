<template>
  <div
    v-if="visible"
    :class="['tooltip', `tooltip-${position}`, { 'tooltip-visible': visible }]"
    :style="tooltipStyle"
  >
    <pre>{{ content }}</pre>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed, PropType } from 'vue';

  export default defineComponent({
    name: 'Tooltip',
    props: {
      visible: {
        type: Boolean,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      position: {
        type: String as PropType<'TL' | 'TR' | 'BL' | 'BR'>,
        default: 'TL',
      },
      x: {
        type: Number,
        required: true,
      },
      y: {
        type: Number,
        required: true,
      },
    },
    setup(props) {
      const tooltipStyle = computed(() => {
        let offsetX = 0;
        let offsetY = 0;

        switch (props.position) {
          case 'TL':
          case 'BL':
            offsetX = -10;
            break;
          case 'TR':
          case 'BR':
            offsetX = 10;
            break;
        }

        switch (props.position) {
          case 'TL':
          case 'TR':
            offsetY = -10;
            break;
          case 'BL':
          case 'BR':
            offsetY = 10;
            break;
        }

        return {
          top: `${props.y + offsetY}px`,
          left: `${props.x + offsetX}px`,
        };
      });

      return { tooltipStyle };
    },
  });
</script>

<style scoped>
  .tooltip {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 4px;
    padding: 5px;
    z-index: 100;
  }
  .tooltip-visible {
    opacity: 1;
    transition: opacity 0.2s ease-in-out;
  }
  .tooltip-TL {
    transform: translate(-10px, -10px);
  }
  .tooltip-TR {
    transform: translate(10px, -10px);
  }
  .tooltip-BL {
    transform: translate(-10px, 10px);
  }
  .tooltip-BR {
    transform: translate(10px, 10px);
  }

  .tooltip-visible {
    opacity: 1;
  }
</style>
