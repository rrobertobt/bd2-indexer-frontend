<template>
  <div>
    <h1
      class="text-3xl font-bold pb-4 text-accent-foreground flex items-center gap-2"
    >
      <Icon name="lucide:database" /> BD2 - Indexer
    </h1>
    <p>Buscador de productos con caché y paginación.</p>

    <h2 class="text-2xl font-semibold pt-6 pb-2">Carga de datos</h2>
    <Button as-child class="mt-4">
      <NuxtLink to="/">
        <Icon name="lucide:search" class="size-4" />
        Regresar a búsqueda
      </NuxtLink>
    </Button>
    <p class="py-2 text-muted-foreground font-light">
      Selecciona el archivo CSV que contiene los datos de productos para
      cargarlos en el sistema. Asegúrate de que el archivo esté en el formato
      correcto antes de proceder con la carga.
    </p>

    <Input id="picture" type="file" class="max-w-xs" @change="e => selectedFile = e.target.files[0]" />
    <Button class="mt-4" :disabled="!selectedFile || loading" @click="handleUpload">
        <Icon name="lucide:chevron-right" class="size-4" v-if="!loading" />
        <Icon name="lucide:loader" class="size-4 animate-spin" v-else />
        Continuar
    </Button>

    <p class="mt-4 text-red-600" v-if="error">
      <span>
        <Icon name="lucide:circle-alert" class="size-4 inline-block mr-1 -mb-0.5" />
        No se pudo cargar el archivo:
      </span>
      <span class="font-semibold">{{ error }}</span>
    </p>
    <p class="mt-4 text-green-600" v-if="success">{{ success }}</p>
  </div>
</template>
<script setup lang="ts">
  import { Input } from "@/components/ui/input";
  import { Button } from "~/components/ui/button";

  const selectedFile = ref();
  const loading = ref(false);
  const error = ref("");
  const success = ref();

  const handleUpload = async () => {
    if (!selectedFile.value) return;
    console.log(selectedFile.value);

    loading.value = true;
    error.value = "";

    try {
      // Simulate file upload
      const form = new FormData();
      form.append("file", selectedFile.value);
      const response = await $fetch<{
        ok: boolean;
        totalIndexed: number;
      }>("http://localhost:8000/index/load", {
        method: "POST",
        body: form,
      });
      if (response.ok) {
        success.value = `Archivo procesado exitosamente. Total de productos indexados: ${response.totalIndexed}`;
      }
    } catch (err) {
      error.value = err.data?.message || "Error al cargar el archivo.";
    } finally {
      loading.value = false;
    }
  };

</script>
<style scoped></style>
