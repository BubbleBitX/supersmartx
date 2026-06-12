const TEMPLATE_EVENT_TYPE_ALIASES: Record<string, string> = {
  "youtube-milestone": "subscriber-milestone",
  "revenue-milestone": "mrr-milestone",
};

export function getEventTypeIdForTemplateId(templateId: string): string {
  return TEMPLATE_EVENT_TYPE_ALIASES[templateId] ?? templateId;
}

export function getCreateHrefForTemplateId(templateId: string): string {
  return `/create?template=${encodeURIComponent(templateId)}`;
}
