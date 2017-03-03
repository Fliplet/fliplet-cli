# Publishing

Publishing components on the Fliplet platform is done via the CLI command `publish` as follows:

```
$ cd my-awesome-component
$ fliplet publish
```

Publishing requires you to log in against your Fliplet Studio account:

```
$ fliplet login
```

The above command will ask for your email and password. Once successfully authenticated, you will be able to publish components, themes and menus on Fliplet.

```
$ fliplet login

Please type your Fliplet Studio login details.
prompt: email:  foo@example.com
prompt: password:  ***********

Logged in successfully. You can now publish widgets.
```

Furthermore, in order for you to publish you have to set a target `organizationId` for your component.

First, read your organizations (once you have logged in):

```
$ fliplet list-organizations

Requesting up to date organizations list from the server...

• 123: Sample organization
```

Then, simply set which organization you want to use:

```
$ fliplet organization 123

Organization set.
```

You are now ready to publish components, themes and menus on Fliplet.

---

[Back](README.md)
{: .buttons}

---