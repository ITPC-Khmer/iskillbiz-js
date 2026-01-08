<template>
  <div
    :id="id"
    class="offcanvas offcanvas-end"
    tabindex="-1"
    aria-labelledby="drawerLabel"
    :style="drawerStyle"
  >
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="drawerLabel">{{ title }}</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="offcanvas-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount } from 'vue';

const props = defineProps({
  id: { type: String, default: 'rightDrawer' },
  title: { type: String, default: '' },
  // Width of the left sidebar so the drawer fills the remaining viewport
  sidebarWidth: { type: Number, default: 260 }
});

let bsInstance;

const drawerStyle = computed(() => {
  // On small screens, keep Bootstrap default width; on desktop, span remaining width
  const vwCalc = `calc(100vw - ${props.sidebarWidth}px)`;
  return {
    width: vwCalc,
    maxWidth: vwCalc
  };
});

function open() {
  // Lazy import bootstrap JS in dev; assumes bootstrap is installed
  import('bootstrap/dist/js/bootstrap.esm.min.js').then(({ Offcanvas }) => {
    const el = document.getElementById(props.id);
    bsInstance = Offcanvas.getOrCreateInstance(el, { backdrop: true, scroll: true });
    bsInstance.show();
  });
}

function close() {
  if (!bsInstance) return;
  bsInstance.hide();
}

onBeforeUnmount(() => {
  if (bsInstance) bsInstance.dispose();
});

defineExpose({ open, close });
</script>

<style scoped>
@media (max-width: 767.98px) {
  /* On mobile, use default Offcanvas width */
  .offcanvas.offcanvas-end {
    width: 100%;
    max-width: 100%;
  }
}
</style>
