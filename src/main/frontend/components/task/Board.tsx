import { useState } from 'react';
import { ColumnType, TaskType } from './types';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent
} from '@mui/material';
import Column from './Column';

type BoardState = {
  columns: {
    [key: string]: ColumnType;
  };
  tasks: {
    [key: string]: TaskType;
  };
  columnOrder: string[];
};

// Initial data for the board state
const initialData: BoardState = {
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: ['task-1', 'task-2']
    },
    'column-2': { id: 'column-2', title: 'In Progress', taskIds: [] },
    'column-3': { id: 'column-3', title: 'Done', taskIds: [] }
  },
  tasks: {
    'task-1': { id: 'task-1', title: 'Task 1', description: 'Description 1' },
    'task-2': { id: 'task-2', title: 'Task 2', description: 'Description 2' }
  },
  columnOrder: ['column-1', 'column-2', 'column-3']
};

const Board = () => {
  // State to manage the board data
  const [data, setData] = useState<BoardState>(initialData);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // Function to handle adding a new task
  const handleAddTask = () => {
    const newTaskId = `task-${Date.now()}`;
    const newTask: TaskType = {
      id: newTaskId,
      title: newTaskTitle,
      description: newTaskDescription
    };

    const newTasks = {
      ...data.tasks,
      [newTaskId]: newTask
    };

    const newTaskIds = Array.from(data.columns['column-1'].taskIds);
    newTaskIds.push(newTaskId);

    const newColumn = {
      ...data.columns['column-1'],
      taskIds: newTaskIds
    };

    const newState = {
      ...data,
      tasks: newTasks,
      columns: {
        ...data.columns,
        [newColumn.id]: newColumn
      }
    };

    setData(newState);
    setNewTaskTitle('');
    setNewTaskDescription('');
  };

  // Function to handle editing an existing task
  const handleEditTask = (id: string, title: string, description: string) => {
    const newTask = { ...data.tasks[id], title, description };

    const newTasks = {
      ...data.tasks,
      [id]: newTask
    };

    const newState = {
      ...data,
      tasks: newTasks
    };

    setData(newState);
  };

  // Function to handle deleting a task
  const handleDeleteTask = (id: string) => {
    const newTasks = { ...data.tasks };
    delete newTasks[id];

    const newColumns = { ...data.columns };
    Object.keys(newColumns).forEach((columnId) => {
      newColumns[columnId].taskIds = newColumns[columnId].taskIds.filter(
        (taskId) => taskId !== id
      );
    });

    const newState = {
      ...data,
      tasks: newTasks,
      columns: newColumns
    };

    setData(newState);
  };

  // This function will be triggered when the drag and drop interaction ends
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If there is no destination, do nothing
    if (!destination) {
      return;
    }

    // If the task is dropped in the same place it was picked up, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // If the task is moved within the same column
    if (startColumn === finishColumn) {
      const newTaskIds = Array.from(startColumn.taskIds);
      newTaskIds.splice(source.index, 1); // Remove task from its original position
      newTaskIds.splice(destination.index, 0, draggableId); // Insert task into new position

      const newColumn = {
        ...startColumn,
        taskIds: newTaskIds
      };

      const newState = {
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn
        }
      };

      setData(newState);
      return;
    }

    // If the task is moved to a different column
    const startTaskIds = Array.from(startColumn.taskIds);
    startTaskIds.splice(source.index, 1); // Remove task from the start column
    const newStart = {
      ...startColumn,
      taskIds: startTaskIds
    };

    const finishTaskIds = Array.from(finishColumn.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId); // Insert task into the finish column
    const newFinish = {
      ...finishColumn,
      taskIds: finishTaskIds
    };

    const newState = {
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish
      }
    };

    setData(newState);
  };

  /*
    `DragDropContext` is the main component that enables drag-and-drop functionality.
    It wraps the part of the app where drag-and-drop will occur 
  */
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ padding: '2rem', textAlign: 'center' }}>
        <Typography variant="h4">Drag and Drop Board</Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem'
          }}
        >
          <Box sx={{ maxWidth: '600px', width: '100%', textAlign: 'left' }}>
            <TextField
              fullWidth
              label="Task Title"
              variant="outlined"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Task Description"
              variant="outlined"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleAddTask}
            >
              Add Task
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'space-around',
            flexWrap: 'wrap'
          }}
        >
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);
            return (
              <Column
                key={column.id}
                column={column}
                tasks={tasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
              />
            );
          })}
        </Box>
      </Box>
    </DragDropContext>
  );
};

export default Board;
