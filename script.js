const taskModal = document.getElementById('taskModal');
const openAddTask = document.getElementById('openAddTask');
const closeModal = document.getElementById('closeModal');
const cancelTask = document.getElementById('cancelTask');
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskPriority = document.getElementById('taskPriority');
const taskTags = document.getElementById('taskTags');
const taskStatus = document.getElementById('taskStatus');
const columns = {
  todo: document.getElementById('todoColumn'),
  inprogress: document.getElementById('inprogressColumn'),
  completed: document.getElementById('completedColumn'),
};

let tasks = [];
let editingTaskId = null;
let draggedTaskId = null;

const defaultTasks = [
  {
    id: 'task-1',
    title: 'Define app structure',
    description: 'Create columns, cards, and draggable task behavior.',
    priority: 'High',
    tags: ['planning', 'setup'],
    status: 'todo',
  },
  {
    id: 'task-2',
    title: 'Build add task form',
    description: 'Allow users to add a title, description, priority, tags, and status.',
    priority: 'Medium',
    tags: ['ui', 'forms'],
    status: 'inprogress',
  },
  {
    id: 'task-3',
    title: 'Move tasks across board',
    description: 'Use drag and drop to update task status in a Kanban workflow.',
    priority: 'Low',
    tags: ['ux', 'interaction'],
    status: 'completed',
  },
];

function openModal() {
  taskModal.classList.remove('hidden');
  taskModal.querySelector('input, textarea, select').focus();
}

function closeModalDialog() {
  taskModal.classList.add('hidden');
  taskForm.reset();
  editingTaskId = null;
  taskStatus.value = 'todo';
  document.getElementById('modalTitle').textContent = 'Add New Task';
}

function renderTasks() {
  Object.values(columns).forEach((column) => (column.innerHTML = ''));

  tasks.forEach((task) => {
    const card = document.createElement('article');
    card.className = 'task';
    card.draggable = true;
    card.dataset.id = task.id;

    card.innerHTML = `
      <div class="meta-row">
        <span class="badge" data-priority="${task.priority}">${task.priority}</span>
        <button type="button" class="edit-button" aria-label="Edit ${task.title}">Edit</button>
        <button type="button" class="delete-button" aria-label="Delete ${task.title}">✕</button>
      </div>
      <h3>${escapeHtml(task.title)}</h3>
      <p>${escapeHtml(task.description)}</p>
      <div class="tag-list">
        ${task.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
      </div>
    `;

    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    const editButton = card.querySelector('.edit-button');
    editButton.addEventListener('click', () => startEditTask(task.id));

    const deleteButton = card.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    columns[task.status].appendChild(card);
  });

  updateCounts();
}

function updateCounts() {
  document.querySelectorAll('.column').forEach((column) => {
    const status = column.dataset.status;
    const count = tasks.filter((task) => task.status === status).length;
    column.querySelector('.column-count').textContent = `${count} item${count === 1 ? '' : 's'}`;
  });
}

function handleDragStart(event) {
  const target = event.currentTarget;
  draggedTaskId = target.dataset.id;
  target.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(event) {
  event.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.drag-over').forEach((el) => el.classList.remove('drag-over'));
  draggedTaskId = null;
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
  if (event.currentTarget.contains(event.relatedTarget)) return;
  event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event) {
  event.preventDefault();
  const status = event.currentTarget.dataset.status;
  event.currentTarget.classList.remove('drag-over');
  if (!draggedTaskId) return;

  const task = tasks.find((item) => item.id === draggedTaskId);
  if (task) {
    task.status = status;
    saveTasks();
    renderTasks();
  }
}

function startEditTask(taskId) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  editingTaskId = task.id;
  taskTitle.value = task.title;
  taskDescription.value = task.description;
  taskPriority.value = task.priority;
  taskTags.value = task.tags.join(', ');
  taskStatus.value = task.status;
  document.getElementById('modalTitle').textContent = 'Edit Task';
  openModal();
}

function getTaskDataFromForm() {
  return {
    title: taskTitle.value.trim(),
    description: taskDescription.value.trim(),
    priority: taskPriority.value,
    tags: taskTags.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    status: taskStatus.value,
  };
}

function saveTask(event) {
  event.preventDefault();
  const formData = getTaskDataFromForm();
  if (!formData.title) return;

  if (editingTaskId) {
    const taskIndex = tasks.findIndex((item) => item.id === editingTaskId);
    if (taskIndex >= 0) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...formData };
    }
  } else {
    tasks.push({
      id: `task-${Date.now()}`,
      ...formData,
    });
  }

  closeModalDialog();
  saveTasks();
  renderTasks();
}

function saveTasks() {
  localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

openAddTask.addEventListener('click', () => {
  document.getElementById('modalTitle').textContent = 'Add New Task';
  taskStatus.value = 'todo';
  openModal();
});

closeModal.addEventListener('click', closeModalDialog);
cancelTask.addEventListener('click', closeModalDialog);
taskForm.addEventListener('submit', saveTask);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !taskModal.classList.contains('hidden')) {
    closeModalDialog();
  }
});

document.querySelectorAll('.column').forEach((column) => {
  column.addEventListener('dragover', handleDragOver);
  column.addEventListener('dragleave', handleDragLeave);
  column.addEventListener('drop', handleDrop);
});

document.addEventListener('click', (event) => {
  if (event.target === taskModal) {
    closeModalDialog();
  }
});

const stored = localStorage.getItem('kanban-tasks');
tasks = stored ? JSON.parse(stored) : defaultTasks.slice();
renderTasks();
