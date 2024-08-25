import React, { useState } from 'react';
import { TaskType } from './types';
import { Draggable } from 'react-beautiful-dnd';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box
} from '@mui/material';

export type TaskProps = {
  task: TaskType;
  index: number;
  onEditTask: (id: string, title: string, description: string) => void;
  onDeleteTask: (id: string) => void;
};

const Task: React.FC<TaskProps> = ({
  task,
  index,
  onEditTask,
  onDeleteTask
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(task.title);
  const [newDescription, setNewDescription] = useState(task.description);

  const handleSave = () => {
    onEditTask(task.id, newTitle, newDescription);
    setIsEditing(false);
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <Card
          sx={{ marginBottom: '10px' }}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <CardContent>
            {isEditing ? (
              <>
                <Box sx={{ marginBottom: '16px' }}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    margin="normal"
                    multiline
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ marginBottom: '16px' }}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    multiline
                    rows={4}
                  />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    sx={{ padding: '10px 20px' }} // Adds more padding for a better look
                  >
                    Save
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Typography variant="h6">{task.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {task.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <Button variant="outlined" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => onDeleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};

export default Task;
