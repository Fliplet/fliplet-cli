# Custom Headers

Fliplet allows you to set custom headers for your apps. This feature is useful for enhancing security, controlling resource loading, and adding custom HTTP headers to your applications.

## Setting up Custom Headers

### Step 1: Plan your headers

1. **Identify your needs**: Determine what custom headers you want to add to your app
2. **Research requirements**: Understand the specific header format and values needed for your use case

### Step 2: Assign custom headers to your Fliplet application

1. **Open your app**: Open the app you want to configure with custom headers

2. **Access Developer Options**: Click the `</>` icon on the right-hand toolbar to open Developer Options

3. **Add the configuration code**: In the JavaScript section, paste the following code snippet, making sure to replace the example headers with your desired configuration:

```javascript
async function setCustomHeaders() {
  await Fliplet.App.Settings.set({
    enableCustomHeaders: true,
    customHeaders: [
      // Replace header name and value with your desired configuration
      {
        name: 'Content-Security-Policy',
        value: "default-src 'self';"
      }
    ]
  });
  Fliplet.Modal.alert({ message: 'The custom header has been added. You can now remove the code.' });
}

setCustomHeaders();
```

4. **Save and remove the code**: Once saved, you'll see a success message. You can then delete the code snippet and save the Developer Options again

5. **Publish your app**: Your app will need to have its changes published via Studio in order for the custom headers to be set

### Step 3: Test your custom headers

Once your custom headers are live, test them using these methods:

1. **Browser Developer Tools**: Check the Network tab to verify headers are being sent
2. **Online testing tools**: Use appropriate tools for your specific header type
3. **Functionality testing**: Verify that your headers are working as expected

## Example Custom Header Configurations

### Content Security Policy (CSP) Example

```javascript
async function setCSPHeaders() {
  await Fliplet.App.Settings.set({
    enableCustomHeaders: true,
    customHeaders: [
      {
        name: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' *.fliplet.com; style-src 'self' 'unsafe-inline' *.fliplet.com; img-src 'self' data: *.fliplet.com; font-src 'self' *.fliplet.com; connect-src 'self' *.fliplet.com"
      }
    ]
  });
}
```

### Strict Security Headers Example

```javascript
async function setSecurityHeaders() {
  await Fliplet.App.Settings.set({
    enableCustomHeaders: true,
    customHeaders: [
      {
        name: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' *.fliplet.com; style-src 'self' 'unsafe-inline' *.fliplet.com; img-src 'self' data: *.fliplet.com; font-src 'self' *.fliplet.com; connect-src 'self' *.fliplet.com; frame-src 'none'; object-src 'none'"
      },
      {
        name: 'X-Frame-Options',
        value: 'DENY'
      },
      {
        name: 'X-Content-Type-Options',
        value: 'nosniff'
      }
    ]
  });
}
```

### Multiple Custom Headers Example

```javascript
async function setMultipleHeaders() {
  await Fliplet.App.Settings.set({
    enableCustomHeaders: true,
    customHeaders: [
      {
        name: 'X-Custom-Header',
        value: 'CustomValue'
      },
      {
        name: 'Cache-Control',
        value: 'no-cache, no-store, must-revalidate'
      },
      {
        name: 'Pragma',
        value: 'no-cache'
      }
    ]
  });
}
```

## Common Header Types

| Header Name | Purpose | Example Value |
|-------------|---------|---------------|
| `Content-Security-Policy` | Security policy for resource loading | `default-src 'self'` |
| `X-Frame-Options` | Prevent clickjacking | `DENY` or `SAMEORIGIN` |
| `X-Content-Type-Options` | Prevent MIME type sniffing | `nosniff` |
| `Cache-Control` | Control caching behavior | `no-cache, no-store` |
| `X-Custom-Header` | Custom application headers | `YourCustomValue` |

## Troubleshooting

### Common Issues

1. **Headers not appearing**: Ensure the app has been published after setting the headers
2. **Incorrect header format**: Verify the header name and value syntax
3. **Conflicting headers**: Check for conflicts with existing headers

### Debugging Tips

- Use browser developer tools to inspect network requests and headers
- Test headers incrementally to identify issues
- Check the browser console for any related errors
- Verify header syntax and values

## Best Practices

1. **Start simple**: Begin with basic headers and add complexity gradually
2. **Test thoroughly**: Always test your headers in various browsers and devices
3. **Document your headers**: Keep track of why certain headers are needed
4. **Monitor performance**: Some headers can impact app performance
5. **Stay updated**: Regularly review and update your headers as your app evolves
