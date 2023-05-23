<template>
  <c-dialog
    v-bind="$attrs"
    v-model="dialogVisible"
    custom-class="student-leave-dialog"
    :confirm-disabled="isLoading"
    @confirm="setLeaveStudents"
    @open="resetForm"
  >
    <el-form ref="formRef" label-position="top" :model="leaveForm">
      <el-form-item required label="アカウント停止の種別:" prop="leave_status">
        <el-radio-group v-model="leaveForm.leave_status">
          <el-radio
            v-for="[value, label] in leaveStatus"
            :key="value"
            :label="value"
          >
            {{ label }}
          </el-radio>
        </el-radio-group>
        <p class="text-secondary">
          ※アカウント停止処理をした生徒は退会者一覧に移動します。
          復帰処理をするには１ヶ月経過する必要があります。
        </p>
      </el-form-item>
      <el-form-item required label="理由:" prop="quit_reason">
        <el-radio-group v-model="leaveForm.quit_reason">
          <el-radio
            v-for="reason in QuiteReasons"
            :key="reason"
            :label="reason"
          >
            {{ reason }}
          </el-radio>
        </el-radio-group>
        <el-input
          v-if="leaveForm.quit_reason === OtherQuiteReason"
          v-model="leaveForm.quit_reason_text"
          :rows="2"
          type="textarea"
          placeholder="入力"
        />
      </el-form-item>
      <el-form-item label="予約日:">
        <el-date-picker
          v-model="leaveForm.schedule_date"
          type="date"
          value-format="YYYY-MM-DD"
          :disabled-date="isInvalidDate"
          placeholder="入力予約日"
        />
        <p class="text-secondary mt-1">
          予約日を入力しない場合はすぐに処理されます。<br />
          予約日を3月31日に設定した場合、3月31日までComiruをご利用いただけます。
          4月1日からはログインできなくなり、利用料金にも加算されません。
        </p>
      </el-form-item>
    </el-form>
  </c-dialog>
</template>

<script lang="ts" setup>
  import { ref, computed, useAttrs } from 'vue';
  import {
    LeaveStatusTranslation,
    QuiteReasons,
    OtherQuiteReason,
    MaxTimestamp,
  } from '@/constants';
  import { setStudentsLeavings } from '@/services';
  const formRef = ref<InstanceType<typeof ElForm>>();
  const isValidForm = ref(true);
  const leaveStatus = LeaveStatusTranslation.slice(2, 5);

  const initialState = {
    leave_status: leaveStatus[0][0],
    quit_reason: QuiteReasons[0],
    quit_reason_text: '',
    schedule_date: null,
  };
  const isLoading = ref(false);
  const leaveForm = ref(initialState);

  const emit = defineEmits(['update:modelValue', 'confirm-success']);
  interface IProps {
    studentIds: number[];
  }

  const props = withDefaults(defineProps<IProps>(), {
    studentIds: () => [],
  });

  const dialogVisible = computed<typeof ElDialog.modelValue>({
    get: () => useAttrs().modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  function resetForm() {
    leaveForm.value = { ...initialState };
  }

  async function setLeaveStudents() {
    await formRef.value?.validate((isValid) => {
      isValidForm.value = isValid;
    });

    if (!isValidForm.value) {
      isValidForm.value = true;
      return;
    }
    ElMessage.closeAll();

    try {
      isLoading.value = true;
      const params = {
        student_ids: props.studentIds.join(),
        ...leaveForm.value,
      };
      await setStudentsLeavings(params);
      emit('confirm-success');
      dialogVisible.value = false;
      ElMessage.success('更新しました！');
    } catch (err) {
      console.error('err', err);
      ElMessage.error('更新に失敗しました！');
    } finally {
      isLoading.value = false;
    }
  }

  function isInvalidDate(date) {
    const timestamp = new Date(date).getTime();
    return (
      timestamp > MaxTimestamp || timestamp < Date.now() - 3600 * 24 * 1000
    );
  }
</script>
<style scoped lang="postcss">
  .student-leave-dialog .el-radio {
    margin-right: 16px;
  }
  .text-secondary {
    font-size: 12px;
    line-height: 16px;
  }
</style>
