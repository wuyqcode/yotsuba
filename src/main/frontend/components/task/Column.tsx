import React from 'react';
import { ColumnType, TaskType } from './types';
import { Droppable } from 'react-beautiful-dnd';
import Task from './Task';
import { Box, Typography, Card, CardContent } from '@mui/material';

interface Props {
  column: ColumnType;
  tasks: TaskType[];
  onEditTask: (task: TaskType) => void; // 修改这里
  onDeleteTask: (id: string) => void;
  onAddTask: () => void; // 新增属性
  renderHeaderContent?: React.ReactNode;
}

const Column: React.FC<Props> = ({
  column,
  tasks,
  onEditTask,
  onDeleteTask,
  onAddTask,
  renderHeaderContent
}) => {
  return (
    <Droppable droppableId={column.id}>
      {(provided) => (
        <Box
          sx={{
            backgroundColor: '#e0e0e0',
            borderRadius: '8px',
            padding: '10px',
            paddingTop: '20px', // 增加内上边距
            minWidth: '250px',
            maxWidth: '100%',
            flex: '1 1 300px',
            boxSizing: 'border-box'
          }}
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          {renderHeaderContent && (
            <Typography
              variant="h6"
              sx={{ textAlign: 'center', color: '#333' }}
            >
              {renderHeaderContent}
            </Typography>
          )}
          <Box>
            {tasks.map((task, index) => (
              <Task
                key={task.id}
                task={task}
                index={index}
                onEdit={() => onEditTask(task)} // 修改这里
                onDelete={() => onDeleteTask(task.id)}
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
