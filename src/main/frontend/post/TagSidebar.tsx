import React, { useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import TagChip from './TagChip';
import { GlassBox } from 'Frontend/components/GlassBox';
import { Tag, useSelectedTagsStore } from './hook/useSelectedTagsStore';

const TagSidebar = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const addTag = useSelectedTagsStore((s) => s.addTag);

  useEffect(() => {
    const fetchTags = async () => {
      const mockTags: Tag[] = [
        {
          id: 1,
          title: 'Tag1 语言',
          image: 'https://picsum.photos/seed/tag1/100/100',
          content: 'Tag1 是一种流行的开发工具。',
        },
        {
          id: 2,
          title: 'Tag2 设计',
          image: 'https://picsum.photos/seed/tag2/100/100',
          content: 'Tag2 用于 UI 设计流程。',
        },
        {
          id: 3,
          title: 'Tag3 AI',
          image: 'https://picsum.photos/seed/tag3/100/100',
          content: 'Tag3 是 AI 热门标签。',
        },
      ];
      setTags(mockTags);
    };

    fetchTags();
  }, []);

  return (
    <GlassBox
      sx={{
        position: 'sticky',
        top: '50px',
        height: 'calc(100dvh - 50px)',
        overflow: 'auto',
      }}>
      <Typography variant="subtitle1" gutterBottom>
        タグ一覧
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {tags.map((tag) => (
          <TagChip key={tag.id} tag={tag} onClick={() => addTag(tag)} />
        ))}
      </Stack>
    </GlassBox>
  );
};

export default TagSidebar;
