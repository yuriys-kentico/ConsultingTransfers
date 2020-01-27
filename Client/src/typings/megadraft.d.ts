declare module 'megadraft' {
import {
    CompositeDecorator,
    DraftInlineStyleType,
    EditorProps,
    EditorState,
    RawDraftContentState
} from 'draft-js';
import defaultDecorator from 'megadraft/decorators/defaultDecorator';
import { Component, FC, ReactNode } from 'react';

    export const actions: IAction[];

  //   export DraftJS: _draftJs["default"],
  // export insertDataBlock: _insertDataBlock["default"],
  // export Media: _Media["default"],
  export interface IMegadraftEditorProps extends EditorProps {
    plugins?: IPlugin[];
    onAction?: () => void;
    sidebarRendererFn?: FC<ISidebarProps>;
    Toolbar?: FC<IToolbarProps>;
    actions?: IAction[];
    keyBindings?: { name: string; isKeyBound: (event: any) => boolean; action: () => void }[];
    handleBlockNotFound?: (block: any) => { blockComponent: Component };
    softNewLines?: boolean;
    resetStyleNewLine?: boolean;
    blocksWithoutStyleReset?: string[];
    maxSidebarButtons?: number;
    modalOptions?: { width: number; height: number };
    shouldDisplayToolbarFn?: (props: IToolbarProps) => boolean;
    language?: string;
    i18n?: { [key: string]: string };

    hideSidebarOnBlur?: boolean;
    movableBlocks?: boolean;
  }

  export interface IToolbarProps {
    i18n: { [key: string]: string };
    editor: Element;
    draft: Element;
    editorState: EditorState;
    editorHasFocus: boolean;
    readOnly: boolean;
    onChange: (editorState: EditorState) => void;
    actions?: { type: string; label: string; style: string; icon: Component }[];
    entityInputs: Component[];
    shouldDisplayToolbarFn?: (props: IToolbarProps) => boolean;
  }

  export interface ISidebarProps {
    i18n: { [key: string]: string };
    editorState: EditorState;
    onChange: (editorState: EditorState) => void;
    plugins: IPlugin[];
    maxSidebarButtons: number;
    editorHasFocus: any;
    hideSidebarOnBlur: boolean;
    modalOptions: any;
  }

  export interface IPlugin {
    title: string;
    type: string;
    buttonComponent: Component;
    blockComponent: Component;
  }

  export interface IAction {
    type: 'entity' | 'block' | 'inline' | 'separator';
    label?: string;
    style?: DraftInlineStyleType | string;
    entity?: string;
    icon?: Component | FC;
  }

  export class MegadraftEditor extends Component<IMegadraftEditorProps> {}

  export const MegadraftIcons: {
    BoldIcon: Component;
    ItalicIcon: Component;
    ULIcon: Component;
    OLIcon: Component;
    H2Icon: Component;
    BlockQuoteIcon: Component;
    LinkIcon: Component;
    CrossIcon: Component;
    ImageIcon: Component;
    VideoIcon: Component;
    EditIcon: Component;
    DeleteIcon: Component;
    CropIcon: Component;
    MediaBigIcon: Component;
    MediaMediumIcon: Component;
    MediaSmallIcon: Component;
    DropdownArrow: Component;
    ErrorIcon: Component;
    UnlinkIcon: Component;
    CloseIcon: Component;
    MoreIcon: Component;
  };
  // export MegadraftMediaMessage: _MediaMessage["default"],
  // export MegadraftPlugin: MegadraftPlugin,
  // export Sidebar: _Sidebar["default"],
  // export Toolbar: _Toolbar["default"],

  export function editorStateFromRaw(
    rawContent: RawDraftContentState | null,
    decorator: CompositeDecorator = defaultDecorator
  ): EditorState;

  // export editorStateToJSON: utils.editorStateToJSON,
  // export createTypeStrategy: utils.createTypeStrategy
}
