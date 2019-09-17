declare module 'react-prosemirror-document' {
  export default function ProseMirrorDocument(props: {
    document: { [key: string]: any };
    className?: string;
    skipUnknownMarks?: boolean;
    skipUnknownTypes?: boolean;
    typeMap?: any;
    markMap?: any;
  });

  export const typeMap: any;
}
