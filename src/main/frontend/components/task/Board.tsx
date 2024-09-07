import { useState } from 'react';
import { ColumnType, TaskType, BoardState } from './types';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import Column from './Column';

// 修改初始数据结构
const initialData: BoardState = {
  columns: {
    todo: { id: 'todo', title: 'TO DO', taskIds: [] },
    inProgress: { id: 'inProgress', title: 'IN PROGRESS', taskIds: [] },
    inReview: { id: 'inReview', title: 'IN REVIEW', taskIds: [] },
    done: { id: 'done', title: 'DONE', taskIds: [] }
  },
  tasks: {},
  columnOrder: ['todo', 'inProgress', 'inReview', 'done']
};

const Board = () => {
  // State to manage the board data
  const [data, setData] = useState<BoardState>(initialData);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

  // 修改打开对话框的函数
  const openDialog = (mode: 'add' | 'edit', task?: TaskType) => {
    setDialogMode(mode);
    setEditingTask(
      mode === 'add' ? { id: '', title: '', description: '' } : task || null
    );
    setIsDialogOpen(true);
  };

  // 修改保存任务的函数
  const handleSaveTask = () => {
    if (editingTask) {
      if (dialogMode === 'add') {
        // 添加新任务
        const newTaskId = `task-${Date.now()}`;
        const newTask: TaskType = {
          ...editingTask,
          id: newTaskId
        };

        // 更新状态
        setData((prevData) => {
          const newTasks = { ...prevData.tasks, [newTaskId]: newTask };
          const newColumns = { ...prevData.columns };
          newColumns.todo.taskIds.push(newTaskId);

          return {
            ...prevData,
            tasks: newTasks,
            columns: newColumns
          };
        });
      } else {
        // 更新现有任务
        // ... 更新任务的逻辑 ...
      }
    }
    setIsDialogOpen(false);
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

  const handleEditTask = (task: TaskType) => {
    openDialog('edit', task);
  };

  const handleAddTask = (columnId: string) => {
    openDialog('add');
  };

  const renderColumnHeaderContent = (columnId: string) => {
    const commonStyles = { margin: '0 0 8px 0' };

    switch (columnId) {
      case 'todo':
        return (
          <Box
            sx={{
              ...commonStyles,
              display: 'flex',
              alignItems: 'center',
              position: 'relative'
            }}
          >
            <span style={{ flex: 1, textAlign: 'center' }}>待办任务</span>
            <Button
              variant="contained"
              size="small"
              onClick={() => openDialog('add')}
              sx={{
                position: 'absolute',
                right: 0,
                minWidth: 0,
                width: '24px',
                height: '24px',
                p: 0
              }}
            >
              +
            </Button>
          </Box>
        );
      case 'inProgress':
        return <Box sx={commonStyles}>进行中的任务</Box>;
      case 'inReview':
        return <Box sx={commonStyles}>待审核的任务</Box>;
      case 'done':
        return <Box sx={commonStyles}>已完成的任务</Box>;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // 设置整个Board组件高度为100%视口高度
        overflow: 'hidden' // 防止出现滚动条
      }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            flexGrow: 1, // 允许这个Box占据剩余的垂直空间
            height: '100%' // 设置高度为100%
          }}
        >
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds
              .map((taskId) => data.tasks[taskId])
              .filter((task): task is TaskType => task !== undefined); // 添加这个过滤器
            return (
              <Column
                key={column.id}
                column={column}
                tasks={tasks}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={() => handleAddTask(columnId)} // 修改这一行
                renderHeaderContent={renderColumnHeaderContent(columnId)}
              />
            );
          })}
        </Box>
      </DragDropContext>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>
          {dialogMode === 'add' ? '创建新任务' : '编辑任务'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="标题"
            fullWidth
            value={editingTask?.title || ''}
            onChange={(e) =>
              setEditingTask((prev) =>
                prev ? { ...prev, title: e.target.value } : null
              )
            }
          />
          <TextField
            margin="dense"
            label="描述"
            fullWidth
            multiline
            rows={4}
            value={editingTask?.description || ''}
            onChange={(e) =>
              setEditingTask((prev) =>
                prev ? { ...prev, description: e.target.value } : null
              )
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>取消</Button>
          <Button onClick={handleSaveTask}>
            {dialogMode === 'add' ? '创建' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Board;
