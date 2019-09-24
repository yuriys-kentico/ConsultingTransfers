declare module 'markdown-draft-js' {
  import { RawDraftContentState } from 'draft-js';

  export function markdownToDraft(string: string, options?: any): RawDraftContentState;
  export function draftToMarkdown(rawDraftObject: RawDraftContentState, options?: any): string;
}
