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
          class="pl-8"
          @input="inputHandlers.textSearch($event.target.value)"
          :model-value="$route.query.q as string || ''"
        />
        <span
          class="absolute start-0 inset-y-0 flex items-center justify-center px-2"
        >
          <Icon
            name="lucide:loader"
            class="size-4 text-muted-foreground animate-spin"
            v-if="status === 'pending'"
          />
          <Search class="size-4 text-muted-foreground" v-else />
        </span>
      </div>
      <Button
        size="icon"
        variant="destructive"
        @click="setQuery({ q: undefined, page: 1 })"
      >
        <Icon name="lucide:trash" class="size-4" />
      </Button>
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
          :model-value="$route.query.limit || '10'"
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
      <Separator orientation="vertical" />
      <Button as-child>
        <NuxtLink to="/load">
          <Icon name="lucide:upload" class="size-4" />
          Cargar datos (CSV)
        </NuxtLink>
      </Button>
    </div>

    <div
      v-if="suggestions && suggestions?.suggestions.length > 0"
      class="mb-4 transition"
      :class="{
        'opacity-40 pointer-events-none': suggestionsStatus === 'pending',
      }"
    >
      <h2 class="uppercase font-light text-muted-foreground">Sugerencias</h2>
      <div class="flex gap-x-3 gap-y-1.5 flex-wrap">
        <Button
          v-for="suggestion in suggestions?.suggestions"
          :key="suggestion"
          variant="link"
          size="sm"
          class="p-0 cursor-pointer"
          @click="
            navigateTo({ query: { ...$route.query, q: suggestion, page: 1 } })
          "
        >
          {{ suggestion }}
        </Button>
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

    <section
      class="transition grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-2"
      :class="{
        'opacity-40 pointer-events-none': status === 'pending',
      }"
    >
      <Card
        v-for="item in data?.items"
        :key="item._id"
        class="border-b border-border"
      >
        <CardHeader>
          <CardTitle class="text-xl">{{ item.title }}</CardTitle>
          <CardDescription>{{ item.description }}</CardDescription>
        </CardHeader>
        <CardContent class="h-full flex flex-col justify-between">
          <p class="text-sm">
            <strong>Marca:</strong> {{ item.brand }} ⋅
            <strong>Categoría:</strong> {{ item.category }} ⋅
            <strong>SKU:</strong> {{ item.sku }} ⋅ <strong>Tipo:</strong>
            {{ item.product_type }}
          </p>
          <strong class="text-2xl">
            {{
              Intl.NumberFormat("es-GT", {
                style: "currency",
                currency: item.currency || "GTQ",
              }).format(item.price)
            }}
          </strong>
          <Badge variant="secondary" class="mt-1">
            <Icon
              name="lucide:star"
              class="size-4 inline-block mr-1 text-yellow-400"
            />
            <strong>{{ item.rating }}</strong> / 5
          </Badge>
        </CardContent>
      </Card>
    </section>
  </div>
</template>
<script setup lang="ts">
  import { Input } from "@/components/ui/input";
  import { Search } from "lucide-vue-next";
  import { Badge } from "~/components/ui/badge";
  import { Button } from "~/components/ui/button";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "~/components/ui/card";
  import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "~/components/ui/select";
  import { Separator } from "~/components/ui/separator";
  import type { SearchResponse } from "~/lib/types";

  const route = useRoute();

  function setQuery(patch: Record<string, unknown>) {
    const query: Record<string, any> = { ...route.query, ...patch };
    // elimina vacíos/undefined para no “ensuciar” la URL
    Object.keys(query).forEach((k) => {
      const v = query[k];
      if (v === "" || v === undefined || v === null) delete query[k];
    });
    navigateTo({ query });
  }

  // Data fetch atado a los query params
  const { data, status } = useAsyncData<SearchResponse>(
    "search",
    () =>
      $fetch("http://localhost:8000/search", {
        query: { ...route.query },
      }),
    { watch: [() => route.query] },
  );

  const { data: suggestions, status: suggestionsStatus } = useAsyncData<{
    suggestions: string[];
  }>(
    "suggestions",
    () =>
      $fetch("http://localhost:8000/suggest", {
        query: {
          q: route.query.q,
        },
      }),
    { watch: [() => route.query] },
  );

  // Estado derivado para paginación
  const totalPages = computed(() => data.value?.totalPages ?? 1);
  const currentPage = computed(() => {
    const n = Number(route.query.page) || 1;
    return Math.min(Math.max(1, n), totalPages.value);
  });
  const canPrev = computed(() => currentPage.value > 1);
  const canNext = computed(() => currentPage.value < totalPages.value);

  // Utilidad simple
  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));

  function goToPage(p: number) {
    setQuery({ page: clamp(p, 1, totalPages.value) });
  }
  const handleNextPage = () => canNext.value && goToPage(currentPage.value + 1);
  const handlePreviousPage = () =>
    canPrev.value && goToPage(currentPage.value - 1);
  const handleFirstPage = () => goToPage(1);
  const handleLastPage = () => goToPage(totalPages.value);

  // Handlers de inputs (resetean page a 1)
  const handleTextSearch = useDebounceFn((value: string) => {
    setQuery({ q: value || undefined, page: 1 });
  }, 500);

  const handleLimit = (value: string | number) => {
    const n = Number(value);
    setQuery({ limit: Number.isFinite(n) ? n : undefined, page: 1 });
  };

  const inputHandlers = {
    textSearch: handleTextSearch,
    limit: handleLimit,
  };
</script>
<style scoped></style>
