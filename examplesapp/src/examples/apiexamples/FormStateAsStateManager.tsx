import { makeFormModel, FormState } from "formtastisch";
import * as React from "react";

const makeTodo = () =>
  makeFormModel({
    initialData: { task: "" },
    validations: {}
  });

type Todo = ReturnType<typeof makeTodo>;

// we can just have any other state and update components that are subscribed
// we just create a class that extends from FormState,
// and have any data and methods we want
class UserForm extends FormState {
  model!: Todo;

  todos: Todo[] = [];

  constructor() {
    super(makeTodo());
    this.todos.push(this.model);
  }

  // forget about sagas ducks, thunks and actions.
  // just call a method - perfectly typed, simple, predictable and you're in control
  // whenever you want to update state - just call update() that's it
  addTodo = () => {
    this.todos.push(makeTodo());
    this.update();
  };

  removeTodo = (todo: Todo) => {
    this.todos = this.todos.filter((it) => it !== todo);
    this.update();
  };
}

const formState = new UserForm();

export function FormStateAsStateManager() {
  formState.use();

  return (
    <div className="componentSection">
      {formState.todos.map((todo) => (
        <div key={todo.getUniqueReferenceKey()}>
          <input {...formState.makeInputPropsForModel(todo, "task")} />
          <button
            onClick={() => {
              formState.removeTodo(todo);
            }}
          >
            remove {todo.task}
          </button>
        </div>
      ))}
      <button
        onClick={() => {
          formState.addTodo();
        }}
      >
        add todo
      </button>
    </div>
  );
}
