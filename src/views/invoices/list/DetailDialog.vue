<template>
  <c-dialog
    v-bind="$attrs"
    size="large"
    :title="invoice ? invoice?.texthead ?? '請求書' : ''"
    :confirm-type="type === 'regular-list' ? 'danger' : 'primary'"
    :confirm-text="type === 'regular-list' ? 'ゴミ箱' : '復元'"
    :confirm-disabled="deleting"
    @open="initialize"
    @confirm="confirm"
  >
    <div v-if="invoice" class="detail">
      <header>
        <dl>
          <dt class="no">請求番号：</dt>
          <dd class="no">{{ invoice.invoice_no }}</dd>

          <dt class="date">日付：</dt>
          <dd class="date">{{ invoice.date }}</dd>
        </dl>
      </header>

      <main>
        <dl>
          <div class="left">
            <div>
              <dt class="name">生徒名</dt>
              <dd class="name">{{ invoice.student_name }} 様</dd>
            </div>

            <div>
              <dd class="text1">{{ invoice.text1 }}</dd>
            </div>

            <div>
              <dt class="total-price">ご請求金額</dt>
              <dd class="total-price">
                {{
                  new Intl.NumberFormat('ja-JP', {
                    style: 'currency',
                    currency: 'JPY',
                  }).format(Number(invoice.total_price))
                }}
              </dd>
            </div>

            <div>
              <dd class="text2">{{ invoice.text2 }}</dd>
            </div>

            <div>
              <dt class="pay-type">お支払方法：</dt>
              <dd class="pay-type">{{ invoice.pay_type }}</dd>
            </div>

            <div>
              <dt class="pay-date">お支払期限：</dt>
              <dd class="pay-date">{{ invoice.pay_date }}</dd>
            </div>
          </div>

          <div class="right">
            <dd class="text3">{{ invoice.text3 }}</dd>
          </div>
        </dl>

        <el-table :data="fundList" :span-method="spanFund">
          <template v-for="field in invoiceFundListFields" :key="field">
            <!--単価-->
            <el-table-column
              v-if="field.prop === 'unit_price'"
              :label="field.label"
              :width="field.width"
            >
              <template #default="scope">
                {{
                  scope.row.unit_price >= 0
                    ? new Intl.NumberFormat('ja-JP').format(
                        Number(scope.row.unit_price)
                      )
                    : ''
                }}
              </template>
            </el-table-column>

            <!--金額-->
            <el-table-column
              v-else-if="field.prop === 'total_price'"
              :label="field.label"
              :width="field.width"
            >
              <template #default="scope">
                <span v-if="scope.row.discount_detail" class="text-danger">
                  -{{
                    new Intl.NumberFormat('ja-JP').format(scope.row.total_price)
                  }}
                </span>

                <span v-else>
                  {{
                    new Intl.NumberFormat('ja-JP').format(
                      scope.row.amount * scope.row.unit_price
                    )
                  }}
                </span>
              </template>
            </el-table-column>

            <!--割引方法-->
            <el-table-column
              v-else-if="field.prop === 'discount_type'"
              :label="field.label"
              :width="field.width"
            >
              <template #default="scope">
                {{
                  scope.row.discount_detail
                    ? ''
                    : scope.row.is_using_discount
                    ? scope.row.discount_type === 'percent'
                      ? '%割引'
                      : '円割引'
                    : ''
                }}
              </template>
            </el-table-column>

            <!--割引値-->
            <el-table-column
              v-else-if="field.prop === 'discount'"
              :label="field.label"
              :width="field.width"
            >
              <template #default="scope">
                <span>{{ scope.row.discount }}</span>
                <span v-if="scope.row.is_using_discount">
                  {{ scope.row.discount_type === 'percent' ? '%' : '' }}
                </span>
              </template>
            </el-table-column>

            <!--割引/消費税対象外-->
            <el-table-column
              v-else-if="['tax_free', 'is_using_discount'].includes(field.prop)"
              :label="field.label"
              :width="field.width"
            >
              <template #default="scope">
                <c-icon-font
                  v-if="scope.row[field.prop]"
                  name="icon-right1"
                  :size="ButtonIconHeight.default"
                />
              </template>
            </el-table-column>

            <el-table-column
              v-else
              :label="field.label"
              :prop="field.prop"
              :width="field.width"
              show-overflow-tooltip
            />
          </template>
        </el-table>
      </main>

      <footer>
        <dl>
          <!--
          <div class="reason">
            <dt class="change-reason">調整依頼</dt>
            <dd class="change-reason">{{ invoice.change_reason }}</dd>
          </div>
          -->
          <div class="total">
            <dt>小計</dt>
            <dd>
              {{
                new Intl.NumberFormat('ja-JP').format(invoice.real_total_price)
              }}
            </dd>

            <template v-if="invoice.is_using_discount">
              <dt>全体割引（{{ invoice.discount }}%）</dt>
              <dd class="text-danger">
                -{{
                  new Intl.NumberFormat('ja-JP').format(
                    invoice.all_discount_price
                  )
                }}
              </dd>
            </template>

            <dt>消費税（{{ invoice.tax }}%内税）</dt>
            <dd>
              {{ new Intl.NumberFormat('ja-JP').format(invoice.total_tax) }}
            </dd>

            <dt class="font-bold">合計</dt>
            <dd class="font-bold">
              {{ new Intl.NumberFormat('ja-JP').format(invoice.total_price) }}
            </dd>
          </div>
        </dl>
      </footer>
    </div>

    <div v-else v-loading="true" />
  </c-dialog>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue';

  import {
    getInvoiceDetail,
    moveInvoicesToTrash,
    recoverInvoicesFromTrash,
    type IInvoiceDetail,
    type IInvoiceFund,
  } from '@/services';

  import { typedConfirm } from '@/utils';

  import { invoiceFundListFields, ButtonIconHeight } from '@/constants';

  interface DetailDialogProps {
    id?: number;
    type: 'regular-list' | 'trash-list';
    afterEditing: () => void | Promise<void>;
  }

  const props = defineProps<DetailDialogProps>();
  const deleting = ref<boolean>(false);
  const invoice = ref<IInvoiceDetail | undefined>(undefined);

  const fundList = computed(() =>
    invoice?.value?.funds?.reduce(
      (acc, fund) =>
        fund.discount > 0
          ? [
              ...acc,
              fund,
              {
                discount_detail: true,
                detail:
                  fund.discount_type === 'percent'
                    ? `${fund.discount}%割引`
                    : '',
                total_price:
                  fund.discount_type === 'percent'
                    ? Math.floor(
                        (fund.unit_price * fund.amount * fund.discount) / 100
                      )
                    : fund.discount,
              } as IInvoiceFund,
            ]
          : [...acc, fund],
      [] as IInvoiceFund[]
    )
  );

  async function initialize() {
    invoice.value = undefined;

    if (!props.id) {
      return;
    }

    invoice.value = await getInvoiceDetail(props.id);
  }

  async function confirm() {
    if (!props.id) {
      return;
    }

    const fn =
      props.type === 'regular-list'
        ? moveInvoicesToTrash
        : recoverInvoicesFromTrash;

    try {
      deleting.value = true;

      await typedConfirm({
        title:
          props.type === 'regular-list'
            ? 'ゴミ箱リストに移しますか？'
            : '復元しますか？',
        content: '',
        confirmButtonText: props.type === 'regular-list' ? '移動' : '復元',
      });

      await fn([props.id]);
      ElMessage.success(
        props.type === 'regular-list'
          ? 'ゴミ箱へ移しました！'
          : '復元しました！'
      );
      props.afterEditing();
    } catch (e) {
      console.error(e);
      ElMessage.error(
        props.type === 'regular-list'
          ? 'ゴミ箱へ移動に失敗しました！'
          : '復元に失敗しました！'
      );
    } finally {
      deleting.value = false;
    }
  }

  function spanFund({ row, columnIndex }) {
    return {
      rowspan: row.discount > 0 && columnIndex === 0 ? 2 : 1,
      colspan: row.discount_detail && columnIndex === 0 ? 0 : 1,
    };
  }
</script>

<style>
  .el-dialog:has(.detail) .el-dialog__header {
    text-align: center;
  }
</style>

<style scoped lang="postcss">
  .detail::v-deep(td) {
    vertical-align: top;
  }

  .detail :where(dd, dt) {
    display: inline-block;
    line-height: 1.5;
  }
  .detail header dl {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .detail dt.date {
    display: none;
  }
  .detail dd.date {
    flex: 100%;
    display: flex;
    justify-content: flex-end;
  }

  .detail main dl {
    position: relative;
    margin-bottom: 2em;
  }
  .detail main dl div div {
    display: block;
    margin: 1em 0;
  }
  .detail main dl {
    display: flex;
    margin-top: 0;
  }

  .detail main .left {
    padding-right: 2rem;
    flex: 2 2 calc(100% - 320px);
  }

  .detail main .right {
    flex: 1 1 320px;
    padding-top: 1em;
  }

  .text1,
  .text2,
  .text3 {
    display: block;
    white-space: pre-wrap;
  }

  .name,
  .total-price {
    font-weight: bold;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  dt.name::after {
    content: '\3000';
  }
  dt.total-price::after {
    content: '\A0';
  }

  dd.pay-date {
    font-weight: bold;
  }

  .detail footer {
    margin-top: 1.25em;
  }

  .detail footer dl {
    display: flex;
    justify-content: space-between;
  }

  .change-reason {
    line-height: 2rem;
  }

  dt.change-reason {
    font-weight: bold;
  }

  dd.change-reason {
    display: block;
  }

  .total {
    flex: 0 0 280px;
    display: flex;
    flex-wrap: wrap;
    margin-left: auto;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .total :where(dt, dd) {
    flex: 50%;
    line-height: 2rem;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .total dd {
    text-align: end;
  }
</style>
