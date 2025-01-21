<template>
  <div class="mileage-input">
    <InputNumber
      :value="props.value?.kmCount"
      :min="0"
      :precision="0"
      addonAfter="km"
      @change="onKmCountChange"
      :max="999999"
    />
    <span class="mileage-plus">+</span>
    <InputNumber
      :value="props.value?.mCount"
      :min="0"
      :max="999.99"
      :precision="2"
      addonAfter="m"
      @change="onMCountChange"
    />
  </div>
</template>

<script lang="ts" setup>
  import type { PropType } from 'vue';
  import { Form, InputNumber } from 'ant-design-vue';

  interface MileageValue {
    kmCount: number;
    mCount: number;
  }

  const props = defineProps({
    value: { type: Object as PropType<MileageValue>, isRequired: true },
  });

  const emit = defineEmits(['update:value']);

  const formItemContext = Form.useInjectFormItemContext();
  const triggerChange = (changedValue: { kmCount?: number; mCount?: number }) => {
    emit('update:value', { ...props.value, ...changedValue });
    formItemContext.onFieldChange();
  };
  const onKmCountChange = (e: any) => {
    // const newNumber = parseInt((e.target as any).value || '0', 10);
    const newNumber = e;
    triggerChange({ kmCount: newNumber });
  };
  const onMCountChange = (e: any) => {
    // const newNumber = parseInt((e.target as any).value || '0', 10);
    const newNumber = e;

    triggerChange({ mCount: newNumber });
  };
</script>

<style lang="less" scoped>
  .mileage-input {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .mileage-plus {
    padding: 0 10px;
  }
</style>
