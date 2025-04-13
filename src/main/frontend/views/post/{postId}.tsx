import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { ChangeEvent, useEffect, useState, KeyboardEvent, useCallback } from 'react';
import Editor from 'Frontend/components/Editor';
import { PostService } from 'Frontend/generated/endpoints';
import { useQueryClient } from '@tanstack/react-query';
import PostDto from 'Frontend/generated/io/github/dutianze/yotsuba/cms/application/dto/PostDto';
import { useNavigate, useParams } from 'react-router';
import { Tree } from 'react-arborist';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderIcon from '@mui/icons-material/Folder';
import { GlassBox } from 'Frontend/components/GlassBox';

export const config: ViewConfig = {
  menu: { exclude: true },
};

export type TreeNode = {
  id: string;
  name: string;
  type?: string;
  children?: TreeNode[];
};

const moveNode = (data: any[], dragIds: string[], parentId: string | null, index: number): any[] => {
  let dragged: any[] = [];

  // 递归删除被拖动的节点
  const remove = (nodes: any[]): any[] => {
    return nodes
      .map((node) => {
        if (dragIds.includes(node.id)) {
          dragged.push(node);
          return null;
        }
        if (node.children) {
          node.children = remove(node.children);
        }
        return node;
      })
      .filter(Boolean);
  };

  const newData = remove([...data]);

  const insert = (nodes: any[]): boolean => {
    for (const node of nodes) {
      if (node.id === parentId) {
        node.children = node.children || [];
        node.children.splice(index, 0, ...dragged);
        return true;
      }
      if (node.children && insert(node.children)) return true;
    }
    return false;
  };

  if (parentId) {
    insert(newData);
  } else {
    newData.splice(index, 0, ...dragged);
  }

  return newData;
};

export const initialData: TreeNode[] = [
  {
    id: 'folder-1',
    name: 'Folder 1',
    type: 'folder',
    children: [
      { id: 'file-1', name: 'File A.txt', type: 'file' },
      { id: 'file-2', name: 'File B.md', type: 'file' },
    ],
  },
  {
    id: 'folder-2',
    name: 'Folder 2',
    type: 'folder',
    children: [],
  },
  {
    id: 'file-3',
    name: 'Root File.png',
    type: 'file',
  },
];

export default function MilkdownEditorWrapper() {
  const { postId } = useParams();
  if (!postId) {
    throw new Error('postId is required but not found');
  }
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDto>();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [paperHeight, setPaperHeight] = useState<number>(0);
  const [treeData, setTreeData] = useState<TreeNode[]>(initialData);

  const measuredRef = useCallback((node: any) => {
    if (node !== null) {
      setPaperHeight(node.getBoundingClientRect().height);
    }
  }, []);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (postId) {
      PostService.findById(postId)
        .then((data) => {
          if (data) {
            setPost(data);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch post:', error);
        });
    }
  }, [postId]);

  const onChange = (content: string) => {
    setPost((prevPost) => (prevPost ? { ...prevPost, content: content } : prevPost));
  };

  const handleSave = async (closeAfterSave = false) => {
    try {
      await PostService.updatePost(postId, post?.title, post?.cover, post?.content);

      // 使 'posts' 查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['posts'] });

      if (closeAfterSave) {
        closePostEditor();
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      // 这里可以添加错误处理，比如显示一个错误消息
    }
  };

  const closePostEditor = () => {
    navigate('/post');
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const handleDeleteTag = (tagToDelete: string) => () => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPost((prevPost) => (prevPost ? { ...prevPost, title: e.target.value } : prevPost));
  };

  const handleTagInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event?.target?.files?.[0]) {
      return;
    }

    const formData = new FormData();
    formData.append('file', event.target.files[0]);
    console.log(formData);

    fetch('http://localhost:8080/api/file-resource', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to upload image');
        }
        return response.text();
      })
      .then((imageUrl) => {
        setPost((prevPost) => (prevPost ? { ...prevPost, cover: imageUrl } : undefined));
      })
      .catch((error) => {
        console.error('Failed to upload image:', error);
      });
  };

  const handleImageClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setPost((prevPost) => (prevPost ? { ...prevPost, cover: undefined } : prevPost));
  };

  return (
    <Box sx={{ display: 'flex', height: '100%', p: 2, gap: 2 }}>
      {/* 左侧 Tree */}
      <GlassBox
        sx={{
          width: 260,
          minWidth: 200,
          borderRight: '1px solid rgba(0,0,0,0.08)',
          overflowY: 'auto',
          overflowX: 'hidden',
          p: 2,
          boxSizing: 'border-box',
        }}>
        <Tree
          data={treeData}
          padding={12}
          rowHeight={36}
          indent={20}
          openByDefault
          disableEdit
          onMove={({ dragIds, parentId, index }) => {
            const newData = moveNode(treeData, dragIds, parentId, index);
            setTreeData(newData);
          }}>
          {({ node, style, dragHandle }) => {
            const isFolder = node.children != null;

            return (
              <Box
                ref={dragHandle} // 整行拖动
                style={style}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  cursor: 'grab',
                  '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' },
                }}>
                {isFolder ? <FolderIcon fontSize="small" /> : <InsertDriveFileIcon fontSize="small" />}

                <Typography variant="body2" noWrap>
                  {node.data.name}
                </Typography>
              </Box>
            );
          }}
        </Tree>
      </GlassBox>

      {/* 右侧 编辑区 */}
      <GlassBox sx={{ flexGrow: 1, display: 'flex', p: 2, flexDirection: 'column', overflow: 'hidden' }}>
        {postId && post && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="body1"
                  color="primary"
                  fontWeight="bold"
                  sx={{ cursor: 'pointer' }}
                  onClick={closePostEditor}>
                  post /
                </Typography>
                <TextField
                  label="Title"
                  value={post.title}
                  onChange={handleTitleChange}
                  size="small"
                  sx={{ maxWidth: 300 }}
                />
              </Box>

              <Stack direction="row" spacing={1}>
                <Button variant="outlined" color="secondary" onClick={closePostEditor}>
                  Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={() => handleSave(true)}>
                  Save
                </Button>
              </Stack>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {/* 富文本编辑器区域 */}
              <Editor content={post?.content ?? ''} onChange={onChange} />
            </Box>
          </>
        )}
      </GlassBox>
    </Box>
  );
}
