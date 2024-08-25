import React from 'react';
import { ColumnType, TaskType } from './types';
import { Droppable } from 'react-beautiful-dnd';
import Task from './Task';
import { Box, Typography, Card, CardContent } from '@mui/material';

type ColumnProps = {
  column: ColumnType;
  tasks: TaskType[];
  onEditTask: (id: string, title: string, description: string) => void;
  onDeleteTask: (id: string) => void;
};

const Column: React.FC<ColumnProps> = ({
  column,
  tasks,
  onEditTask,
  onDeleteTask
}) => {
  return (
    <Droppable droppableId={column.id}>
      {(provided) => (
        <Box
          sx={{
            backgroundColor: '#e0e0e0',
            borderRadius: '8px',
            padding: '10px',
            minWidth: '250px',
            maxWidth: '100%',
            flex: '1 1 300px',
            boxSizing: 'border-box'
          }}
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          <Typography variant="h6" sx={{ textAlign: 'center', color: '#333' }}>
            {column.title}
          </Typography>
          <Box>
            {tasks.map((task, index) => (
              <Task
                key={task.id}
                task={task}
                index={index}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </Box>
        </Box>
      )}
    </Droppable>
  );
};

export default Column;
