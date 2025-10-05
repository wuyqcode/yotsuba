import { useEffect, useRef, useState } from 'react';
import RichTextEditor, { BaseKit, type Editor } from 'reactjs-tiptap-editor';
import { Attachment } from 'reactjs-tiptap-editor/attachment';
import { Blockquote } from 'reactjs-tiptap-editor/blockquote';
import { Bold } from 'reactjs-tiptap-editor/bold';
import { BulletList } from 'reactjs-tiptap-editor/bulletlist';
import { Clear } from 'reactjs-tiptap-editor/clear';
import { Code } from 'reactjs-tiptap-editor/code';
import { CodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { Color } from 'reactjs-tiptap-editor/color';
import { ColumnActionButton } from 'reactjs-tiptap-editor/multicolumn';
import { Emoji } from 'reactjs-tiptap-editor/emoji';
import { ExportPdf } from 'reactjs-tiptap-editor/exportpdf';
import { ExportWord } from 'reactjs-tiptap-editor/exportword';
import { FontFamily } from 'reactjs-tiptap-editor/fontfamily';
import { FontSize } from 'reactjs-tiptap-editor/fontsize';
import { FormatPainter } from 'reactjs-tiptap-editor/formatpainter';
import { Heading } from 'reactjs-tiptap-editor/heading';
import { Highlight } from 'reactjs-tiptap-editor/highlight';
import { History } from 'reactjs-tiptap-editor/history';
import { HorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { Iframe } from 'reactjs-tiptap-editor/iframe';
import { Image } from 'reactjs-tiptap-editor/image';
import { ImportWord } from 'reactjs-tiptap-editor/importword';
import { Indent } from 'reactjs-tiptap-editor/indent';
import { Italic } from 'reactjs-tiptap-editor/italic';
import { LineHeight } from 'reactjs-tiptap-editor/lineheight';
import { Link } from 'reactjs-tiptap-editor/link';
import { Mention } from 'reactjs-tiptap-editor/mention';
import { MoreMark } from 'reactjs-tiptap-editor/moremark';
import { OrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { SearchAndReplace } from 'reactjs-tiptap-editor/searchandreplace';
import { SlashCommand } from 'reactjs-tiptap-editor/slashcommand';
import { Strike } from 'reactjs-tiptap-editor/strike';
import { Table } from 'reactjs-tiptap-editor/table';
import { TaskList } from 'reactjs-tiptap-editor/tasklist';
import { TextAlign } from 'reactjs-tiptap-editor/textalign';
import { TextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { Video } from 'reactjs-tiptap-editor/video';
import { TextDirection } from 'reactjs-tiptap-editor/textdirection';
import { Drawer } from 'reactjs-tiptap-editor/drawer';
import { Twitter } from 'reactjs-tiptap-editor/twitter';
import 'reactjs-tiptap-editor/style.css';
import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';

import 'katex/dist/katex.min.css';
import 'easydrawer/styles.css';
import { useUpload } from 'Frontend/features/post/hooks/useUpload';
import { Box, Stack } from '@mui/material';
import { Toc } from 'Frontend/components/Toc';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const EditorWrapper: React.FC<EditorProps> = ({ content, onChange }) => {
  const [disable, setDisable] = useState(false);

  const { upload, loading } = useUpload();
  // locale.setLang('zh_CN');

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
    FormatPainter.configure({ spacer: true }),
    Clear,
    FontFamily,
    Heading.configure({ spacer: true }),
    FontSize,
    Bold,
    Italic,
    TextUnderline,
    Strike,
    MoreMark,
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
  const boxRef = useRef<HTMLDivElement | null>(null);

  const editorRef = useRef<{ editor: Editor | null }>(null);
  const [offsetTop, setOffsetTop] = useState(0);
  useEffect(() => {
    if (boxRef.current) {
      const top = boxRef.current.getBoundingClientRect().top;
      setOffsetTop(top);
    }
  }, []);
  return (
    <Stack direction="row" spacing={1}>
      <Toc editor={editorRef.current?.editor} />
      <Box
        ref={boxRef}
        sx={{
          overflowY: 'hidden',
          width: 'calc(100%-250px)',
          height: `calc(100vh - ${offsetTop}px)`,
          '.reactjs-tiptap-editor': {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            '& > *': {
              display: 'contents',
              '& > *': {
                display: 'contents',
              },
            },
          },
          '.editor': {
            flex: '1 1 auto',
            overflowY: 'auto',
            minHeight: 0,
            paddingBottom: '40vh',
          },
        }}>
        <RichTextEditor
          output="html"
          content={content as any}
          onChangeContent={onChange}
          extensions={extensions}
          disabled={disable}
          dark={false}
          removeDefaultWrapper={true}
          contentClass={'editor'}
          useEditorOptions={{ autofocus: true }}
          ref={editorRef}
        />
      </Box>
    </Stack>
  );
};

export default EditorWrapper;
