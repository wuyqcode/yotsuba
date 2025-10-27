import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Stack,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  useTheme,
  Paper,
  Tooltip,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import QrCodeIcon from '@mui/icons-material/QrCode';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import ForumIcon from '@mui/icons-material/Forum';
import ArticleIcon from '@mui/icons-material/Article';

import RichTextEditor, { BaseKit, type Editor } from 'reactjs-tiptap-editor';
import { Heading } from 'reactjs-tiptap-editor/heading';
import { Bold } from 'reactjs-tiptap-editor/bold';
import { Italic } from 'reactjs-tiptap-editor/italic';
import { TextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { Strike } from 'reactjs-tiptap-editor/strike';
import { BulletList } from 'reactjs-tiptap-editor/bulletlist';
import { OrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { Blockquote } from 'reactjs-tiptap-editor/blockquote';
import { Link } from 'reactjs-tiptap-editor/link';
import { Image } from 'reactjs-tiptap-editor/image';
import { CodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { HorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { SlashCommand } from 'reactjs-tiptap-editor/slashcommand';

import { useUpload } from 'Frontend/features/note/hooks/useUpload';
import { useTableOfContents } from 'Frontend/features/note/hooks/useToc';
import type { HeadingItem } from 'Frontend/features/note/hooks/useToc';

import 'reactjs-tiptap-editor/style.css';
import 'prism-code-editor-lightweight/layout.css';
import 'prism-code-editor-lightweight/themes/github-dark.css';

/* -------------------------------
 * TOC（目录）
 * ------------------------------- */
function WikiToc({ editor }: { editor: Editor | null | undefined }) {
  const theme = useTheme();
  const headings = useTableOfContents(editor);
  const [open, setOpen] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleJump = (item: HeadingItem) => {
    if (!editor) return;
    setActiveId(item.id);

    let targetPos = item.pos;
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading' && node.attrs.id === item.id) {
        targetPos = pos;
        return false;
      }
      return true;
    });

    try {
      editor.chain().setTextSelection(targetPos).scrollIntoView().run();
      const node = editor.view.nodeDOM(targetPos);
      if (node instanceof HTMLElement) {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } catch (err) {
      console.error('TOC jump failed:', err);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: '1px solid',
        borderColor: 'divider',
        bgcolor: '#f8f9fa',
        position: 'sticky',
        top: 0,
        height: 'calc(100vh - 50px)', // 占满视口高度
        display: 'flex',
        flexDirection: 'column',
        zIndex: 2,
      }}>
      {/* 顶部标题栏 */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0, // 标题栏固定高度，不被压缩
          bgcolor: '#f8f9fa',
          backdropFilter: 'blur(4px)',
          zIndex: 3,
        }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13 }}>
          目录
        </Typography>
        <IconButton size="small" onClick={() => setOpen((o) => !o)}>
          {open ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
        </IconButton>
      </Box>

      {/* 可滚动内容区 */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <Collapse in={open}>
          {headings.length === 0 ? (
            <Typography variant="body2" sx={{ p: 2, fontSize: 12, color: 'text.secondary' }}>
              No headings found
            </Typography>
          ) : (
            <List dense disablePadding sx={{ py: 1 }}>
              {headings.map((item) => {
                const isActive = activeId === item.id;
                const paddingLeft = 1 + (item.level - 1) * 2;
                return (
                  <ListItemButton
                    key={item.id}
                    onClick={() => handleJump(item)}
                    selected={isActive}
                    sx={{
                      pl: paddingLeft,
                      '&.Mui-selected': {
                        bgcolor: theme.palette.action.selected,
                        '& .MuiListItemText-primary': {
                          color: 'primary.main',
                          fontWeight: 600,
                        },
                      },
                    }}>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        noWrap: true,
                        sx: {
                          fontSize: item.level === 1 ? 13 : 12,
                          fontWeight: item.level === 1 ? 600 : 400,
                          lineHeight: 1.4,
                          color: isActive ? 'primary.main' : 'text.secondary',
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Collapse>
      </Box>
    </Paper>
  );
}

/* -------------------------------
 * 主编辑器布局
 * ------------------------------- */
export default function WikiEditorLayout() {
  const { upload } = useUpload();
  const [title, setTitle] = useState('进击的巨人');
  const editorRef = useRef<{ editor: Editor | null }>(null);
  const [mode, setMode] = useState<'read' | 'edit' | 'comment'>('edit');

  const [content, setContent] = useState<string>(`
    <h1>切尔诺贝利 (迷你剧)</h1>
    <p><b>《切尔诺贝利》</b>（英语：<i>Chernobyl</i>）是一部英美合拍的五集历史题材电视迷你剧，
    由克雷格·马津创作，约翰·伦克执导。讲述1986年苏联切尔诺贝利核事故的发生及其后续应对。</p>

    <h2>剧情概览</h2>
    <p>本剧聚焦核电站爆炸后，苏联政府高层、科学家与普通民众的抉择与牺牲。</p>

    <h2>演员</h2>
    <ul>
      <li>贾里德·哈里斯 饰 瓦列里·列加索夫</li>
      <li>斯特兰·斯卡斯加德 饰 鲍里斯·谢尔比纳</li>
      <li>艾米丽·沃森 饰 乌拉娜·霍缪克</li>
    </ul>
  `);

  const extensions = useMemo(
    () => [
      BaseKit.configure({
        placeholder: { showOnlyCurrent: true, placeholder: '请输入正文内容...' },
      }),
      Heading,
      Bold,
      Italic,
      TextUnderline,
      Strike,
      BulletList,
      OrderedList,
      Blockquote,
      Link,
      Image.configure({ upload: (file: File) => upload(file) }),
      CodeBlock.configure({ defaultTheme: 'dracula' }),
      HorizontalRule,
      SlashCommand,
    ],
    [upload]
  );

  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 50px)', bgcolor: '#fff' }}>
      {/* 左侧目录 */}
      <WikiToc editor={editorRef.current?.editor} />

      {/* 右侧正文 */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 50px)',
          overflow: 'auto',
        }}>
        {/* 顶部标题栏 */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            bgcolor: '#f8f9fa',
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 3,
            py: 2,
            zIndex: 10,
          }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* 标题输入 */}
            <Typography variant="h5" sx={{ fontWeight: 600, flex: 1 }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 600,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontFamily: 'sans-serif',
                }}
                readOnly={mode === 'read' || mode === 'comment'}
              />
            </Typography>

            {/* 模式切换按钮 */}
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<VisibilityIcon />}
                size="small"
                sx={{
                  textTransform: 'none',
                  color: mode === 'read' ? 'primary.main' : 'text.secondary',
                  bgcolor: mode === 'read' ? 'action.selected' : 'transparent',
                }}
                onClick={() => setMode('read')}>
                阅读
              </Button>

              <Button
                startIcon={<EditIcon />}
                size="small"
                sx={{
                  textTransform: 'none',
                  color: mode === 'edit' ? 'primary.main' : 'text.secondary',
                  bgcolor: mode === 'edit' ? 'action.selected' : 'transparent',
                }}
                onClick={() => setMode('edit')}>
                编辑
              </Button>

              <Button
                startIcon={<ForumIcon />}
                size="small"
                sx={{
                  textTransform: 'none',
                  color: mode === 'comment' ? 'primary.main' : 'text.secondary',
                  bgcolor: mode === 'comment' ? 'action.selected' : 'transparent',
                }}
                onClick={() => setMode('comment')}>
                评论
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* 主体内容 */}
        <Box
          sx={{
            flex: 1,
            px: 4,
            py: 3,
            '.reactjs-tiptap-editor': {
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100%',
            },
            '.wiki-editor-content': {
              fontSize: '0.95rem',
              lineHeight: 1.7,
              color: '#202122',
              maxWidth: 820,
              margin: '0 auto',
            },
          }}>
          {/* 编辑器或评论区切换 */}
          {mode === 'comment' ? (
            <Box sx={{ maxWidth: 820, mx: 'auto', mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                评论区
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                （此处可以放评论输入框和评论列表）
              </Typography>
            </Box>
          ) : (
            <RichTextEditor
              ref={editorRef}
              output="html"
              content={content}
              onChangeContent={setContent}
              extensions={extensions}
              dark={false}
              removeDefaultWrapper
              contentClass="wiki-editor-content"
              useEditorOptions={{ autofocus: true }}
              disabled={mode === 'read'} // 阅读模式下禁用编辑
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
