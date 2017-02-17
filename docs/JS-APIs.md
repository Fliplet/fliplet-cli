# The JS APIs

As most of our stack is made of Javascript — and you will be using it quite a lot — we have built a big set of Javascript APIs which enable you to interact with the different parts of our system, while speeding up the development as they help you with some basic functionality like other similar tools.

Please note: the JS APIs are more of a **SDK** rather than a **framework**. You are mostly free to choose how to build your components and themes and which framework to use (or not).

## Dependencies

The different parts of our SDK are split into different packages which includes one or more functionalities. To use them, you will need to import them as dependencies in your components (or themes).

Here's an example to give you a quick idea of how it works:

**1. I declare I want to use the package named `fliplet-media` in my component dependencies.**
**2. I can then use the JS APIs provided by the package, like `Fliplet.Media.Files.upload()` to upload a file.**