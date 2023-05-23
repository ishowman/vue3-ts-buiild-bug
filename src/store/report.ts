import { defineStore } from 'pinia';

const id = 'report';

interface Template {
  id: number;
  school_name: string;
  template_name: string;
  schools: { id: number; name: string }[];
}

export interface ReportData {
  templates: Template[];
}

export const useReportTemplatesStore = defineStore(id, {
  state: (): ReportData => ({
    templates: [],
  }),

  actions: {
    setTemplates(templates: Template[]) {
      this.templates = templates;
    },
  },

  getters: {
    templatesByIds: ({ templates }) =>
      templates.reduce(
        (acc, template) => Object.assign(acc, { [template.id]: template }),
        {}
      ),
  },
});

export const reportTemplatesStore = useReportTemplatesStore();
