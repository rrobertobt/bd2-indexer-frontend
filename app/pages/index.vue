<template>
  <div>
    <h1 class="text-3xl font-bold pb-4 text-accent-foreground">
      BD2 - Indexer
    </h1>
    <p>Buscador de productos con caché y paginación.</p>

    <p class="py-1 text-muted-foreground font-light">
      Ingresa el texto a buscar en el campo de búsqueda. Puedes buscar por
      nombre, categoría, marca, SKU o tipo de producto.
    </p>

    <div class="relative w-full max-w-sm items-center py-2">
      <Input
        id="search"
        type="text"
        placeholder="Buscar..."
        class="pl-10"
        @input="inputHandlers.textSearch($event.target.value)"
        :model-value="$route.query.q || ''"
      />
      <span
        class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
      >
        <Search class="size-4 text-muted-foreground" />
      </span>
    </div>

    {{ data }}
  </div>
</template>
<script setup>
  import { Input } from "@/components/ui/input";
  import { Search } from "lucide-vue-next";

  const route = useRoute();

  const { data } = useAsyncData(
    () =>
      $fetch("http://localhost:8000/search", {
        query: {
          ...route.query,
        },
      }),
    {
      watch: [() => route.query],
    },
  );

  function createInputHandler(field, options) {
    const updateQuery = (value) => {
      navigateTo({
        query: {
          ...route.query,
          // page: 0,
          [field]: value || undefined,
        },
      });
    };

    return options?.debounce ? useDebounceFn(updateQuery, 500) : updateQuery;
  }

  const inputHandlers = {
    textSearch: createInputHandler("q", { debounce: true }),
  };
</script>
<style scoped></style>
