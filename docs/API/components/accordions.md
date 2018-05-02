# Accordions

## Query parameters

Use the following query parameters when linking to a screen with accordions.

* `action` (String) Set to `openAccordion` to open a specific accordion on the target screen.
* `index` (Number) The index of accordion that you want to open, where 0 is the first one. (Default: 0)
* `groupIndex` (Number - Optional) The group of accordion that you want to specify. Use this to apply the index within a specific group. If this is not used, the index parameter will be used to target an accordion relative to the entire screen.
* `scroll` (Boolean) If `true`, users will be scrolled to the opened accordion. (Default: `false`)

### Example 1

Open the 1st accordion.

```
?action=openAccordion
```

### Example 2

Open and scroll to the 2nd accordion of the 2nd accordion group.

```
?action=openAccordion&groupIndex=1&index=1&scroll=true
```

---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}