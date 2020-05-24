/**
 @license
 Copyright (c) 2015-2020 Lablup Inc. All rights reserved.
 */

import {css, customElement, html, LitElement, property} from "lit-element";

class Task {
  tasktitle: string;
  taskid: string;
  taskobj: Object;
  status: string;
  created_at: number;
  finished_at: number;

  constructor(title: string, obj: Object, taskid: string) {
    this.tasktitle = title;
    this.taskid = taskid;
    this.taskobj = obj;
    this.created_at = Date.now();
    this.finished_at = 0;
    this.status = 'active';
  }

  remove() {
    delete this.taskobj;
  }
}

/**
 Backend.AI Task manager for Console

 `backend-ai-tasker` is a background task manager for console.

 Example:
 @group Backend.AI Console
 @element backend-ai-tasker
 */
@customElement("backend-ai-tasker")
export default class BackendAiTasker extends LitElement {
  public shadowRoot: any;
  public updateComplete: any;

  @property({type: Object}) indicator;
  @property({type: Array}) taskstore;
  @property({type: Array}) finished;
  @property({type: Object}) pooler;
  @property({type: Boolean}) active = true;

  /**
   *  Backend.AI Task manager for Console
   *
   */
  constructor() {
    super();
    this.taskstore = [];
    this.finished = [];
    this.indicator = globalThis.lablupIndicator;
    this.pooler = setInterval(() => {
      this.gc();
    }, 10000);
  }

  static get styles() {
    return [
      // language=CSS
      css``];
  }

  render() {
    // language=HTML
    return html`
    `;
  }

  shouldUpdate() {
    return this.active;
  }

  firstUpdated() {
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   *  Add task to task list.
   *
   * @param {Object} task - Object / Promise instance to add.
   * @param {string} taskid - Task ID. It should be unique. If no taskid is given, it will be autogenerated (recommended)
   */
  add(title, task, taskid: string = '') {
    if (taskid === '') {
      taskid = this.generate_UUID();
    }
    let item = new Task(title, task, taskid);
    if (task != null && typeof task.then === 'function') { // For Promise type task
      task.then(() => {
          this.finished.push(taskid);
        }
      );
    } else { // For function type task (not supported yet)
      return false;
    }
    this.taskstore.push(item);
    this.signal();
    return true;
  }

  /**
   *  Remove task from task list.
   *
   * @param {string} taskid - Task ID to remove.
   */
  remove(taskid: string = '') {
    let result = this.taskstore.filter(obj => {
      return obj.taskid === taskid
    });
    if (result.length > 0) {
      let index = this.taskstore.indexOf(result[0]);
      if (index > -1) {
        result[0].remove();
        this.taskstore.splice(index, 1);
      }
      delete result[0];
      index = this.finished.indexOf(taskid);
      if (index > -1) {
        this.finished.splice(index, 1);
      }
      this.signal();
    }
  }

  /**
   *  List current tasks in task list.
   *
   * @param {string} taskid - Task ID to remove.
   */
  list() {
    return this.taskstore;
  }

  generate_UUID() {
    let dt = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  /**
   *  Garbage collector. Automatically called for 15 second each.
   *
   */
  async gc() {
    if (this.finished.length > 0) {
      this.finished.forEach((item) => {
        this.remove(item);
      });
    }
  }

  signal() {
    let event: CustomEvent = new CustomEvent('backend-ai-task-changed', {"detail": {"tasks": this.taskstore}});
    document.dispatchEvent(event);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "backend-ai-tasker": BackendAiTasker;
  }
}
