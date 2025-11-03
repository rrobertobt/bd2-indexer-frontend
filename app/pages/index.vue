<template>
  <div>
    <h1
      class="text-3xl font-bold pb-4 text-accent-foreground flex items-center gap-2"
    >
      <Icon name="lucide:database" /> BD2 - Indexer
    </h1>
    <p>Buscador de productos con caché y paginación.</p>

    <p class="py-1 text-muted-foreground font-light">
      Ingresa el texto a buscar en el campo de búsqueda. Puedes buscar por
      nombre, categoría, marca, SKU o tipo de producto.
    </p>

    <div class="flex h-20 items-center gap-4 py-6">
      <div class="relative w-full max-w-sm items-center py-2">
        <Input
          id="search"
          type="text"
          placeholder="Buscar..."
          class="pl-10"
          @input="inputHandlers.textSearch($event.target.value)"
          :model-value="$route.query.q as string || ''"
        />
        <span
          class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
        >
          <Search class="size-4 text-muted-foreground" />
        </span>
      </div>
      <Separator orientation="vertical" />
      <div class="space-x-2">
        <Button @click="handleFirstPage">
          <Icon name="lucide:chevrons-left" class="size-4" />
        </Button>
        <Button @click="handlePreviousPage">
          <Icon name="lucide:chevron-left" class="size-4" />
          Anterior
        </Button>
        <Button @click="handleNextPage">
          <Icon name="lucide:chevron-right" class="size-4" />
          Siguiente
        </Button>
        <Button @click="handleLastPage">
          <Icon name="lucide:chevrons-right" class="size-4" />
        </Button>
      </div>
      <Separator orientation="vertical" />
      <div class="flex gap-1">
        <small class="text-muted-foreground uppercase font-light"
          >Resultados por página:</small
        >
        <Select
          :model-value="route.query.limit || '10'"
          @update:model-value="(value) => inputHandlers.limit(value as string)"
        >
          <SelectTrigger class="w-full max-w-xs">
            <SelectValue placeholder="Seleccionar" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="10"> 10 </SelectItem>
              <SelectItem value="20"> 20 </SelectItem>
              <SelectItem value="30"> 30 </SelectItem>
              <SelectItem value="40"> 40 </SelectItem>
              <SelectItem value="50"> 50 </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div>
      <small
        v-if="data && data.items.length > 0"
        class="text-muted-foreground uppercase font-light"
      >
        <strong class="font-bold">{{ data?.items.length }}</strong> resultados
        encontrados en
        <strong class="font-bold">{{ data?.tookMs }} ms</strong>
      </small>
      <small
        v-if="data?.cached"
        class="text-muted-foreground uppercase font-light"
      >
        <span> ⋅ </span>
        Resultado de caché
      </small>
    </div>
    <div>
      <small
        v-if="status === 'pending'"
        class="text-muted-foreground uppercase font-light animate-pulse"
      >
        Cargando resultados...
      </small>
    </div>
    <div>
      <small v-if="data" class="text-muted-foreground uppercase font-light">
        Página
        <strong class="font-bold">{{ data?.page }}</strong> de
        <strong class="font-bold">
          {{ data?.totalPages }}
        </strong>
      </small>
    </div>

    <section>
      <article
        v-for="item in data?.items"
        :key="item._id"
        class="border-b border-border py-4"
      >
        <h2 class="text-lg font-semibold">{{ item.title }}</h2>
        <p class="text-sm text-muted-foreground">{{ item.description }}</p>
        <p class="text-sm">
          <strong>Marca:</strong> {{ item.brand }} ⋅
          <strong>Categoría:</strong> {{ item.category }} ⋅
          <strong>SKU:</strong> {{ item.sku }} ⋅ <strong>Tipo:</strong>
          {{ item.product_type }} ⋅ <strong>Precio:</strong> ${{
            item.price.toFixed(2)
          }}
          item.price.toFixed(2) }}
        </p>
      </article>
    </section>
  </div>
</template>
<script setup lang="ts">
  import { Input } from "@/components/ui/input";
  import { Search } from "lucide-vue-next";
  import { Button } from "~/components/ui/button";
  import { Separator } from "~/components/ui/separator";
  import type { SearchResponse } from "~/lib/types";
  import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "~/components/ui/select";

  const route = useRoute();

  const { data, status } = useAsyncData<SearchResponse>(
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

  function createInputHandler(field: string, options?: { debounce?: boolean }) {
    const updateQuery = (value: string) => {
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
    limit: createInputHandler("limit"),
  };

  const handleNextPage = () => {
    const currentPage = Number(route.query.page) || 1;
    if (data.value && currentPage >= data.value?.totalPages) return;
    navigateTo({
      query: {
        ...route.query,
        page: currentPage + 1,
      },
    });
  };
  const handlePreviousPage = () => {
    const currentPage = Number(route.query.page) || 1;
    if (data.value && currentPage <= 1) return;
    navigateTo({
      query: {
        ...route.query,
        page: Math.max(currentPage - 1, 1),
      },
    });
  };

  const handleFirstPage = () => {
    navigateTo({
      query: {
        ...route.query,
        page: 1,
      },
    });
  };
  const handleLastPage = () => {
    if (data.value) {
      navigateTo({
        query: {
          ...route.query,
          page: data.value.totalPages,
        },
      });
    }
  };
</script>
<style scoped></style>
