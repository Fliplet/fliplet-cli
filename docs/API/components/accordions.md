# Accordions

## Query parameters

Use the following query parameters when linking to a screen with accordions.

- **action** Set to `openAccordion` to open a specific accordion on the target screen.
- **title** The accordion title to match and open (Optional)
- **index** The index of accordion that you want to open, where 0 is the first one. (Default: 0)
- **groupIndex** The group of accordion that you want to specify. Use this to apply the index within a specific group. If this is not used, the index parameter will be used to target an accordion relative to the entire screen. (Optional)
- **scroll** (`true|false`) If `true`, users will be scrolled to the opened accordion. (Default: `false`)

### Examples

**Open the 1st accordion**

```
action=openAccordion
```

**Open and scroll to the 2nd accordion of the 2nd accordion group**

```
action=openAccordion&groupIndex=1&index=1&scroll=true
```

**Open all accordions with title "Foo bar" and scrolls to the first match**

```
action=openAccordion&title=Foo%20bar&scroll=true
```

---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}