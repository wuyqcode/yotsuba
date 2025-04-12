import { useState } from 'react';

import RichTextEditor from 'reactjs-tiptap-editor';

import { locale } from 'reactjs-tiptap-editor/locale-bundle';

import {
  Attachment,
  BaseKit,
  Blockquote,
  Bold,
  BulletList,
  Clear,
  Code,
  CodeBlock,
  Color,
  ColumnActionButton,
  Emoji,
  ExportPdf,
  ExportWord,
  FontFamily,
  FontSize,
  FormatPainter,
  Heading,
  Highlight,
  History,
  HorizontalRule,
  Iframe,
  Image,
  ImportWord,
  Indent,
  Italic,
  Katex,
  LineHeight,
  Link,
  Mention,
  MoreMark,
  OrderedList,
  SearchAndReplace,
  SlashCommand,
  Strike,
  Table,
  TableOfContents,
  TaskList,
  TextAlign,
  TextDirection,
  Twitter,
  Underline,
  Video,
  Drawer,
} from 'reactjs-tiptap-editor/extension-bundle';

import 'reactjs-tiptap-editor/style.css';
import 'katex/dist/katex.min.css';
import 'easydrawer/styles.css';
import { useUpload } from 'Frontend/hooks/useUpload';
import { Box } from '@mui/material';

locale.setLang('zh_CN');

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const Editor: React.FC<EditorProps> = ({ content, onChange }) => {
  const [disable, setDisable] = useState(false);

  const { upload, loading } = useUpload();

  const extensions = [
    BaseKit.configure({
      placeholder: {
        showOnlyCurrent: true,
      },
      characterCount: {
        limit: 50_000,
      },
    }),
    History,
    SearchAndReplace,
    TableOfContents,
    FormatPainter.configure({ spacer: true }),
    Clear,
    FontFamily,
    Heading.configure({ spacer: true }),
    FontSize,
    Bold,
    Italic,
    Underline,
    Strike,
    MoreMark,
    Katex,
    Emoji,
    Color.configure({ spacer: true }),
    Highlight,
    BulletList,
    OrderedList,
    TextAlign.configure({ types: ['heading', 'paragraph'], spacer: true }),
    Indent,
    LineHeight,
    TaskList.configure({
      spacer: true,
      taskItem: {
        nested: true,
      },
    }),
    Link,
    Image.configure({
      upload: (file: File) => {
        return upload(file);
      },
    }),
    Video.configure({
      upload: (file: File) => {
        return upload(file);
      },
    }),
    Blockquote,
    SlashCommand,
    HorizontalRule,
    Code.configure({
      toolbar: false,
    }),
    CodeBlock.configure({ defaultTheme: 'dracula' }),
    ColumnActionButton,
    Table,
    Iframe,
    ExportPdf.configure({ spacer: true }),
    ImportWord.configure({
      upload: (files: File[]) => {
        const f = files.map((file) => ({
          src: upload(file),
          alt: file.name,
        }));
        return Promise.resolve(f);
      },
    }),
    ExportWord,
    TextDirection,
    Mention,
    Attachment.configure({
      upload: (file: any) => {
        return upload(file);
      },
    }),
    Drawer.configure({
      upload: (file: any) => {
        return upload(file);
      },
    }),
    Twitter,
  ];

  return (
    <RichTextEditor
      output="html"
      content={content as any}
      onChangeContent={onChange}
      extensions={extensions}
      disabled={disable}
      dark={false}
      toolbar={{
        render: (props, toolbarItems, dom, containerDom) => {
          return (
            <Box style={{ position: 'sticky', top: 0, zIndex: 100, background: 'white' }}>{containerDom(dom)}</Box>
          );
        },
      }}
    />
  );
};

export default Editor;
