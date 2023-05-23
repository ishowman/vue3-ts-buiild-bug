<template>
  <div id="froala" />
</template>
<script lang="ts" setup>
  import { onMounted, ref, onBeforeUnmount } from 'vue';
  import '@public/froala-editor/css/froala_editor.pkgd.min.css';
  import '@public/froala-editor/css/plugins/emoticons.min.css';
  const editor = ref();
  const emits = defineEmits(['change']);
  async function initFroala() {
    editor.value = new FroalaEditor('#froala', {
      inlineMode: false,
      pastePlain: true,
      paragraphy: false,
      quickInsertEnabled: false,

      language: 'ja',
      height: 240,
      placeholderText: '内容を入力してください',

      toolbarButtons: [
        'fullscreen',
        'bold',
        'italic',
        'underline',
        '|',
        'subscript',
        'superscript',
        '|',
        'fontFamily',
        'fontSize',
        'paragraphFormat',
        'color',
        'emoticons',
        '|',
        'indent',
        'outdent',
        '|',
        'formatOL',
        'formatUL',
        '|',
        'align',
        '-',
        'insertTable',
        'insertHR',
        'insertLink',
        'insertImage',
        'insertVideo',
        'quote',
        '|',
        'undo',
        'redo',
        '|',
        'clearFormatting',
        'selectAll',
        'insertReview',
      ],

      attribution: false,
      disableRightClick: true,
      fileUpload: false,
      imageUpload: true,
      imagePaste: true,
      imagePasteProcess: false,
      imageResize: true,
      crossDomain: false,
      events: {
        contentChanged: function () {
          emits('change', getHTML());
        },
      },
    });
  }

  onMounted(() => {
    initFroala();
  });

  onBeforeUnmount(() => {
    if (editor.value) {
      editor.value.destroy();
    }
  });

  function getHTML() {
    const htmlStr = editor.value.html.get();
    // 删除水印
    return htmlStr.replace(
      `<p data-f-id="pbf" style="text-align: center; font-size: 14px; margin-top: 30px; opacity: 0.65; font-family: sans-serif;">Powered by <a href="https://www.froala.com/wysiwyg-editor?pb=1" title="Froala Editor">Froala Editor</a></p>`,
      ''
    );
  }

  function setHtml(html: string) {
    editor.value.html.set(html);
  }

  defineExpose({
    getHTML,
    setHtml,
  });
</script>
<style scoped></style>
