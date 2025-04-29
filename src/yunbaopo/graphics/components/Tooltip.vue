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
    z-index: 10;
    padding: 8px 12px;
    transform: translateY(-10px);
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
    border-radius: 4px;
    opacity: 0;
    background: rgb(50 50 50 / 85%);
    color: #fff;
    font-size: 12px;
    white-space: pre-wrap;
    pointer-events: none;
  }

  .tooltip-visible {
    transition: opacity 0.2s ease-in-out;
    opacity: 1;
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
</style>
