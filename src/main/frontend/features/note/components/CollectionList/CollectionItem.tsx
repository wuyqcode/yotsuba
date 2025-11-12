import React from 'react';
import { Box, Card, CardContent, Typography, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CollectionDto from 'Frontend/generated/io/github/dutianze/yotsuba/note/application/dto/CollectionDto';

interface Props {
  col: CollectionDto;
  isSelected: boolean;
  onSelect: (collection: CollectionDto) => void;
  onEdit: (collection: CollectionDto) => void;
  onDelete: (collection: CollectionDto) => void;
}

const CollectionItem: React.FC<Props> = ({ col, isSelected, onSelect, onEdit, onDelete }) => {

  return (
    <Card
      component="div"
      variant="outlined"
      onClick={() => onSelect(col)}
      sx={{
        cursor: 'pointer',
        borderRadius: 1.5,
        boxShadow: 'none',
        border: 0,
        bgcolor: isSelected ? '#5E81AC' : 'transparent', // 选中蓝
        color: isSelected ? '#ECEFF4' : '#2E3440', // 蓝底白字，普通深灰
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: isSelected ? '#81A1C1' : '#D8DEE9', // 选中提亮蓝，未选中 hover 中灰蓝
          color: isSelected ? '#ECEFF4' : '#2E3440',
        },
        mb: 0.5,
      }}>
      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 0.5,
          px: 1.5,
          '&:last-child': { pb: 0.5 },
        }}>
        <Typography
          variant="body2"
          noWrap
          sx={{
            fontSize: 14,
            fontWeight: 500,
          }}>
          {col.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(col);
            }}
            sx={{
              color: isSelected ? '#ECEFF4' : '#4C566A',
              '&:hover': {
                color: '#81A1C1', // 编辑按钮 hover 蓝
              },
            }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(col);
            }}
            sx={{
              color: isSelected ? '#ECEFF4' : '#4C566A',
              '&:hover': {
                color: '#BF616A', // 删除按钮 hover 红
              },
            }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CollectionItem;
