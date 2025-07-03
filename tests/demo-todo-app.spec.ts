import { test, expect, type Page } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

const TODO_ITEMS = [
  'buy some cheese',
  'feed the cat',
  'book a doctors appointment'
] as const;

// Helper functions using TodoPage
async function createDefaultTodos(todoPage: TodoPage) {
  await todoPage.addTodos([...TODO_ITEMS]);
}

// --- New Todo ---
test.describe('New Todo', () => {
  let todoPage: TodoPage;
  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('should allow me to add todo items', async () => {
    await todoPage.addTodo(TODO_ITEMS[0]);
    await todoPage.expectTodoTitles([TODO_ITEMS[0]]);
    await todoPage.addTodo(TODO_ITEMS[1]);
    await todoPage.expectTodoTitles([TODO_ITEMS[0], TODO_ITEMS[1]]);
  });

  test('should clear text input field when an item is added', async () => {
    await todoPage.addTodo(TODO_ITEMS[0]);
    await expect(todoPage.newTodo).toBeEmpty();
  });

  test('should append new items to the bottom of the list', async () => {
    await createDefaultTodos(todoPage);
    await todoPage.expectTodoCountText('3 items left');
    await todoPage.expectTodoTitles([...TODO_ITEMS]);
  });
});

// --- Mark all as completed ---
test.describe('Mark all as completed', () => {
  let todoPage: TodoPage;
  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await createDefaultTodos(todoPage);
  });

  test('should allow me to mark all items as completed', async () => {
    await todoPage.toggleAll.check();
    await expect(todoPage.todoItems).toHaveClass(['completed', 'completed', 'completed']);
  });

  test('should allow me to clear the complete state of all items', async () => {
    await todoPage.toggleAll.check();
    await todoPage.toggleAll.uncheck();
    await expect(todoPage.todoItems).toHaveClass(['', '', '']);
  });

  test('complete all checkbox should update state when items are completed / cleared', async () => {
    await todoPage.toggleAll.check();
    await expect(todoPage.toggleAll).toBeChecked();
    await todoPage.unToggleTodo(0);
    await expect(todoPage.toggleAll).not.toBeChecked();
    await todoPage.toggleTodo(0);
    await expect(todoPage.toggleAll).toBeChecked();
  });
});

// --- Item ---
test.describe('Item', () => {
  let todoPage: TodoPage;
  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('should allow me to mark items as complete', async () => {
    await todoPage.addTodos([...TODO_ITEMS.slice(0, 2)]);
    await todoPage.toggleTodo(0);
    await expect(todoPage.todoItems.nth(0)).toHaveClass('completed');
    await expect(todoPage.todoItems.nth(1)).not.toHaveClass('completed');
    await todoPage.toggleTodo(1);
    await expect(todoPage.todoItems.nth(0)).toHaveClass('completed');
    await expect(todoPage.todoItems.nth(1)).toHaveClass('completed');
  });

  test('should allow me to un-mark items as complete', async () => {
    await todoPage.addTodos([...TODO_ITEMS.slice(0, 2)]);
    await todoPage.toggleTodo(0);
    await expect(todoPage.todoItems.nth(0)).toHaveClass('completed');
    await expect(todoPage.todoItems.nth(1)).not.toHaveClass('completed');
    await todoPage.unToggleTodo(0);
    await expect(todoPage.todoItems.nth(0)).not.toHaveClass('completed');
    await expect(todoPage.todoItems.nth(1)).not.toHaveClass('completed');
  });

  test('should allow me to edit an item', async () => {
    await createDefaultTodos(todoPage);
    await todoPage.editTodo(1, 'buy some sausages');
    await todoPage.expectTodoTitles([
      TODO_ITEMS[0],
      'buy some sausages',
      TODO_ITEMS[2]
    ]);
  });
});

// --- Editing ---
test.describe('Editing', () => {
  let todoPage: TodoPage;
  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await createDefaultTodos(todoPage);
  });

  test('should hide other controls when editing', async () => {
    await todoPage.doubleClickTodo(1);
    const todo = await todoPage.getTodoItem(1);
    await expect(todo.getByRole('checkbox')).not.toBeVisible();
    await expect(todo.locator('label', { hasText: TODO_ITEMS[1] })).not.toBeVisible();
  });

  test('should save edits on blur', async () => {
    await todoPage.editTodoBlur(1, 'buy some sausages');
    await todoPage.expectTodoTitles([
      TODO_ITEMS[0],
      'buy some sausages',
      TODO_ITEMS[2],
    ]);
  });

  test('should trim entered text', async () => {
    await todoPage.doubleClickTodo(1);
    const editBox = await todoPage.getEditBox(1);
    await editBox.fill('    buy some sausages    ');
    await editBox.press('Enter');
    await todoPage.expectTodoTitles([
      TODO_ITEMS[0],
      'buy some sausages',
      TODO_ITEMS[2],
    ]);
  });

  test('should remove the item if an empty text string was entered', async () => {
    await todoPage.removeTodoByEmptyEdit(1);
    await todoPage.expectTodoTitles([
      TODO_ITEMS[0],
      TODO_ITEMS[2],
    ]);
  });

  test('should cancel edits on escape', async () => {
    await todoPage.editTodoCancel(1, 'buy some sausages');
    await todoPage.expectTodoTitles([...TODO_ITEMS]);
  });
});

// --- Counter ---
test.describe('Counter', () => {
  let todoPage: TodoPage;
  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('should display the current number of todo items', async () => {
    await todoPage.addTodo(TODO_ITEMS[0]);
    await todoPage.expectTodoCountNumber(1);
    await todoPage.addTodo(TODO_ITEMS[1]);
    await todoPage.expectTodoCountNumber(2);
  });
});

// --- Clear completed button ---
test.describe('Clear completed button', () => {
  let todoPage: TodoPage;
  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await createDefaultTodos(todoPage);
  });

  test('should display the correct text', async () => {
    await todoPage.checkTodo(0);
    await todoPage.expectClearCompletedVisible();
  });

  test('should remove completed items when clicked', async () => {
    await todoPage.checkTodo(1);
    await todoPage.clearCompleted();
    await expect(todoPage.todoItems).toHaveCount(2);
    await todoPage.expectTodoTitles([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test('should be hidden when there are no items that are completed', async () => {
    await todoPage.checkTodo(0);
    await todoPage.clearCompleted();
    await todoPage.expectClearCompletedHidden();
  });
});

// --- Persistence ---
test.describe('Persistence', () => {
  let todoPage: TodoPage;
  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test('should persist its data', async () => {
    await todoPage.addTodos([...TODO_ITEMS.slice(0, 2)]);
    await todoPage.checkTodo(0);
    await todoPage.expectTodoTitles([TODO_ITEMS[0], TODO_ITEMS[1]]);
    await expect(todoPage.todoItems.nth(0).getByRole('checkbox')).toBeChecked();
    await expect(todoPage.todoItems).toHaveClass(['completed', '']);
    await todoPage.page.waitForTimeout(100); // ensure storage is updated
    await todoPage.reload();
    await todoPage.expectTodoTitles([TODO_ITEMS[0], TODO_ITEMS[1]]);
    await expect(todoPage.todoItems.nth(0).getByRole('checkbox')).toBeChecked();
    await expect(todoPage.todoItems).toHaveClass(['completed', '']);
  });
});

// --- Routing ---
test.describe('Routing', () => {
  let todoPage: TodoPage;
  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await createDefaultTodos(todoPage);
  });

  test('should allow me to display active items', async () => {
    await todoPage.checkTodo(1);
    await todoPage.filterByActive();
    await expect(todoPage.todoItems).toHaveCount(2);
    await todoPage.expectTodoTitles([TODO_ITEMS[0], TODO_ITEMS[2]]);
  });

  test('should respect the back button', async () => {
    await todoPage.checkTodo(1);
    await test.step('Showing all items', async () => {
      await todoPage.filterByAll();
      await expect(todoPage.todoItems).toHaveCount(3);
    });
    await test.step('Showing active items', async () => {
      await todoPage.filterByActive();
    });
    await test.step('Showing completed items', async () => {
      await todoPage.filterByCompleted();
    });
    await expect(todoPage.todoItems).toHaveCount(1);
    await todoPage.goBack();
    await expect(todoPage.todoItems).toHaveCount(2);
    await todoPage.goBack();
    await expect(todoPage.todoItems).toHaveCount(3);
  });

  test('should allow me to display completed items', async () => {
    await todoPage.checkTodo(1);
    await todoPage.filterByCompleted();
    await expect(todoPage.todoItems).toHaveCount(1);
  });

  test('should allow me to display all items', async () => {
    await todoPage.checkTodo(1);
    await todoPage.filterByActive();
    await todoPage.filterByCompleted();
    await todoPage.filterByAll();
    await expect(todoPage.todoItems).toHaveCount(3);
  });

  test('should highlight the currently applied filter', async () => {
    await todoPage.expectFilterSelected('All');
    await todoPage.filterByActive();
    await todoPage.expectFilterSelected('Active');
    await todoPage.filterByCompleted();
    await todoPage.expectFilterSelected('Completed');
  });
});

// Storage/localStorage helpers remain for now, as they are not UI actions
async function checkNumberOfTodosInLocalStorage(page: Page, expected: number) {
  return await page.waitForFunction(e => {
    return JSON.parse(localStorage['react-todos']).length === e;
  }, expected);
}

async function checkNumberOfCompletedTodosInLocalStorage(page: Page, expected: number) {
  return await page.waitForFunction(e => {
    return JSON.parse(localStorage['react-todos']).filter((todo: any) => todo.completed).length === e;
  }, expected);
}

async function checkTodosInLocalStorage(page: Page, title: string) {
  return await page.waitForFunction(t => {
    return JSON.parse(localStorage['react-todos']).map((todo: any) => todo.title).includes(t);
  }, title);
}
