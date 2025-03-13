<template>
  <BasicModal
    title="切换API"
    v-bind="$attrs"
    @register="register"
    @ok="handelSubmit"
    @cancel="handelCancel"
  >
    <div>其他自定义地址，请任选其一，并在local storage中修改API_ADDRESS__</div>
    <div><Button type="primary" @click="handleReset">重置</Button></div>
    <BasicForm @register="registerForm">
      <template #api="{ model, field }">
        <RadioGroup v-model:value="model[field]">
          <Radio :style="radioStyle" :value="key" v-for="(val, key) in addresses" :key="key"
            >{{ key }}: {{ val }}</Radio
          >
        </RadioGroup>
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { Radio, Button } from 'ant-design-vue';
  import { useI18n } from '@/hooks/web/useI18n';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  import { ref } from 'vue';
  import { useAppStore } from '@/store/modules/app';
  import type { ApiAddress } from '#/store';

  const appStore = useAppStore();
  const RadioGroup = Radio.Group;
  const { t } = useI18n();
  const [register, { closeModal }] = useModalInner(async () => {
    initData();
  });
  // perf 能读取所有.env.xxx文件最好, 另外key与--mode XXX最好相同
  const addresses = ref({
    development: '/dev-api',
    basic: '/basic-api',
    sunyanfeng: 'http://192.168.31.80:48080',
    liyang: 'http://192.168.31.249:48080',
    gengyi: 'http://192.168.31.239:48080',
    xuxiaodong: 'http://192.168.31.134:48080',
    dev: 'http://api.duobangbox.cn/yunbaopo',
  });
  const radioStyle = ref({
    display: 'flex',
    height: '30px',
    lineHeight: '30px',
  });
  const [registerForm, { validateFields, setFieldsValue }] = useForm({
    showActionButtonGroup: false,
    schemas: [
      {
        field: 'api',
        label: t('layout.header.dropdownChangeApi'),
        colProps: {
          span: 24,
        },
        defaultValue: import.meta.env.MODE || 'development', // 当前环境
        required: true,
        // component: 'Input',
        slot: 'api',
      },
    ],
  });
  const handelSubmit = async () => {
    const values = await validateFields();
    appStore.setApiAddress({
      key: values.api,
      val: addresses.value[values.api],
    });
    location.reload();
  };

  const handleReset = () => {
    localStorage.removeItem('API_ADDRESS__');
    location.reload();
  };
  const handelCancel = () => {
    closeModal();
  };
  const initData = () => {
    const { key = '' } = appStore.getApiAddress as ApiAddress;
    if (key) {
      setFieldsValue({
        api: key,
      });
    }
  };
</script>
