import { useEffect, useRef } from 'react';
import RichTextEditor, { BaseKit, type Editor } from 'reactjs-tiptap-editor';
import { Bold } from 'reactjs-tiptap-editor/bold';
import { SlashCommand } from 'reactjs-tiptap-editor/slashcommand';
import { Italic } from 'reactjs-tiptap-editor/italic';
import { TextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { Strike } from 'reactjs-tiptap-editor/strike';
import { Heading } from 'reactjs-tiptap-editor/heading';
import { BulletList } from 'reactjs-tiptap-editor/bulletlist';
import { OrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { Blockquote } from 'reactjs-tiptap-editor/blockquote';
import { CodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { Link } from 'reactjs-tiptap-editor/link';
import { Image } from 'reactjs-tiptap-editor/image';
import { Video } from 'reactjs-tiptap-editor/video';
import { HorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { History } from 'reactjs-tiptap-editor/history';
import 'reactjs-tiptap-editor/style.css';
import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';
import 'katex/dist/katex.min.css';
import { Box } from '@mui/material';
import { useUpload } from 'Frontend/features/note/hooks/useUpload';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  dark?: boolean;
}

const LightweightEditor: React.FC<EditorProps> = ({ content, onChange, dark = false }) => {
  const editorRef = useRef<{ editor: Editor | null }>(null);
  const { upload } = useUpload();

  const extensions = [
    BaseKit.configure({
      placeholder: { showOnlyCurrent: true },
      characterCount: { limit: 50_000 },
    }),
    SlashCommand,
    History,
    Heading,
    Bold,
    Italic,
    TextUnderline,
    Strike,
    BulletList,
    OrderedList,
    Blockquote,
    Link,
    HorizontalRule,
    CodeBlock.configure({ defaultTheme: 'github-dark' }),
    Image.configure({
      upload: (file: File) => upload(file),
    }),
    Video.configure({
      upload: (file: File) => upload(file),
    }),
  ];

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        '.reactjs-tiptap-editor': {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        },
        '.editor': {
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          paddingBottom: '20vh',
        },
      }}>
      <RichTextEditor
        ref={editorRef}
        output="html"
        content={content as any}
        onChangeContent={onChange}
        extensions={extensions}
        dark={dark}
        removeDefaultWrapper={true}
        contentClass="editor"
      />
    </Box>
  );
};

export default LightweightEditor;
