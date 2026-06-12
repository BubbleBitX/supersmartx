import { Template } from "./templates";

export function generateCaption(template: Template, values: Record<string, string>): string {
  let caption = template.captionTemplate;
  Object.entries(values).forEach(([key, value]) => {
    caption = caption.replaceAll(`{{${key}}}`, value || `[${key}]`);
  });
  return caption;
}
