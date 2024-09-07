import { Draggable } from 'react-beautiful-dnd';
import {
  Paper,
  Typography,
  IconButton,
  Box,
  Checkbox,
  Chip,
  Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { TaskType } from './types';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

interface Props {
  task: TaskType;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

const Task = ({ task, index, onEdit, onDelete }: Props) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{ mb: 1, p: 2, borderRadius: '8px', boxShadow: 3 }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6">{task.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton size="small" onClick={onEdit}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={onDelete}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {task.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {task.description}
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            {/* Adding label style */}
            <Chip
              label="SPACE TRAVEL PARTNERS"
              color="warning"
              variant="outlined"
            />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon />}
                checkedIcon={<CheckBoxIcon />}
                size="small"
              />
              <Typography
                variant="body2"
                sx={{ mx: 1, display: 'flex', alignItems: 'center' }}
              >
                <ArrowUpwardIcon fontSize="small" sx={{ color: 'red' }} />
                <span>5</span>
              </Typography>
              <Avatar
                src="/path-to-profile-pic.jpg"
                sx={{ width: 24, height: 24 }}
              />
            </Box>
          </Box>
        </Paper>
      )}
    </Draggable>
  );
};

export default Task;
