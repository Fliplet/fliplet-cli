# App Execution flow

## Execution flow explained

Fliplet Apps go through a series of rendering steps before screens are displayed to the end user. In the flow diagram below you can learn the different steps, how they interact with each other and how to properly code your components or app code.

![Execution flow](assets/img/execution-flow.png)

---

## When do hooks run?

Hooks can technically run at any time during the app lifecycle, but they are mostly coded so that they run after custom code has ran. This is to ensure custom code has registered any hook before such events are actually broadcasted by the system or any component having exposed such hook(s).

e.g.

1. Custom code registers a new hook listener
2. Later in the app lifecycle, the hook event is broadcasted so the connected listener runs the registered callback.