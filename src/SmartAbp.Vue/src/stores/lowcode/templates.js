import { defineStore } from "pinia";
import { ref } from "vue";
import { databaseApi } from "@smartabp/lowcode-api";
export const useTemplatesStore = defineStore("templates", () => {
    const templates = ref([]);
    const isLoading = ref(false);
    const error = ref(null);
    const fetchTemplates = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            templates.value = await databaseApi.getTemplates();
        }
        catch (e) {
            error.value = e;
        }
        finally {
            isLoading.value = false;
        }
    };
    return {
        templates,
        isLoading,
        error,
        fetchTemplates,
    };
});
