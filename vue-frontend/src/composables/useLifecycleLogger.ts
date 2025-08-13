import { onBeforeMount, onMounted, onBeforeUnmount } from 'vue';

export function useLifecycleLogger(componentName: string) {
  onBeforeMount(() => {
    console.log(`[${componentName}] onBeforeMount: Component is about to mount`);
  });

  onMounted(() => {
    console.log(`[${componentName}] onMounted: Component has been mounted`);
  });

  onBeforeUnmount(() => {
    console.log(`[${componentName}] onBeforeUnmount: Component is about to unmount`);
  });
}