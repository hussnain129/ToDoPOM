import { Page, Locator, expect } from '@playwright/test';

export class TodoPage {
  readonly page: Page;
  readonly newTodo: Locator;
  readonly todoItems: Locator;
  readonly todoTitles: Locator;
  readonly todoCount: Locator;
  readonly toggleAll: Locator;
  readonly clearCompletedButton: Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodo = page.getByPlaceholder('What needs to be done?');
    this.todoItems = page.getByTestId('todo-item');
    this.todoTitles = page.getByTestId('todo-title');
    this.todoCount = page.getByTestId('todo-count');
    this.toggleAll = page.getByLabel('Mark all as complete');
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
    this.filterAll = page.getByRole('link', { name: 'All' });
    this.filterActive = page.getByRole('link', { name: 'Active' });
    this.filterCompleted = page.getByRole('link', { name: 'Completed' });
  }

  async goto() {
    await this.page.goto('https://demo.playwright.dev/todomvc');
  }

  async addTodo(todo: string) {
    await this.newTodo.fill(todo);
    await this.newTodo.press('Enter');
  }

  async addTodos(todos: string[]) {
    for (const todo of todos) {
      await this.addTodo(todo);
    }
  }

  async toggleTodo(index: number) {
    await this.todoItems.nth(index).getByRole('checkbox').check();
  }

  async unToggleTodo(index: number) {
    await this.todoItems.nth(index).getByRole('checkbox').uncheck();
  }

  async editTodo(index: number, newText: string) {
    const todo = this.todoItems.nth(index);
    await todo.dblclick();
    const editBox = todo.getByRole('textbox', { name: 'Edit' });
    await editBox.fill(newText);
    await editBox.press('Enter');
  }

  async editTodoBlur(index: number, newText: string) {
    const todo = this.todoItems.nth(index);
    await todo.dblclick();
    const editBox = todo.getByRole('textbox', { name: 'Edit' });
    await editBox.fill(newText);
    await editBox.dispatchEvent('blur');
  }

  async editTodoCancel(index: number, newText: string) {
    const todo = this.todoItems.nth(index);
    await todo.dblclick();
    const editBox = todo.getByRole('textbox', { name: 'Edit' });
    await editBox.fill(newText);
    await editBox.press('Escape');
  }

  async removeTodo(index: number) {
    // Not directly used in the original tests, but can be added if needed
  }

  async removeTodoByEmptyEdit(index: number) {
    const todo = this.todoItems.nth(index);
    await todo.dblclick();
    const editBox = todo.getByRole('textbox', { name: 'Edit' });
    await editBox.fill('');
    await editBox.press('Enter');
  }

  async checkTodo(index: number) {
    await this.todoItems.nth(index).getByRole('checkbox').check();
  }

  async uncheckTodo(index: number) {
    await this.todoItems.nth(index).getByRole('checkbox').uncheck();
  }

  async clearCompleted() {
    await this.clearCompletedButton.click();
  }

  async clearCompletedIfVisible() {
    if (await this.clearCompletedButton.isVisible()) {
      await this.clearCompletedButton.click();
    }
  }

  async filterByAll() {
    await this.filterAll.click();
  }

  async filterByActive() {
    await this.filterActive.click();
  }

  async filterByCompleted() {
    await this.filterCompleted.click();
  }

  async getTodoCount() {
    return await this.todoItems.count();
  }

  async getTodoTexts() {
    return await this.todoTitles.allTextContents();
  }

  async isTodoCompleted(index: number) {
    return await this.todoItems.nth(index).getAttribute('class').then(cls => cls?.includes('completed'));
  }

  async expectTodoTitles(titles: string[]) {
    await expect(this.todoTitles).toHaveText(titles);
  }

  async expectTodoCount(count: number) {
    await expect(this.todoCount).toContainText(count.toString());
  }

  async expectClearCompletedVisible() {
    await expect(this.clearCompletedButton).toBeVisible();
  }

  async expectClearCompletedHidden() {
    await expect(this.clearCompletedButton).toBeHidden();
  }

  async expectTodoCountText(text: string) {
    await expect(this.todoCount).toHaveText(text);
  }

  async expectTodoCountNumber(count: number) {
    await expect(this.todoCount).toContainText(count.toString());
  }

  async reload() {
    await this.page.reload();
  }

  async expectFilterSelected(filter: 'All' | 'Active' | 'Completed') {
    let locator;
    if (filter === 'All') locator = this.filterAll;
    if (filter === 'Active') locator = this.filterActive;
    if (filter === 'Completed') locator = this.filterCompleted;
    await expect(locator).toHaveClass(/selected/);
  }

  async goBack() {
    await this.page.goBack();
  }

  async getTodoItem(index: number) {
    return this.todoItems.nth(index);
  }

  async doubleClickTodo(index: number) {
    await this.todoItems.nth(index).dblclick();
  }

  async getEditBox(index: number) {
    return this.todoItems.nth(index).getByRole('textbox', { name: 'Edit' });
  }
} 