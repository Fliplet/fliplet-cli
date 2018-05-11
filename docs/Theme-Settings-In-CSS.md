# Use theme settings in your custom CSS

Our theme is built with reusability in mind, therefore we used SCSS variables for all the settings so that you can use them in your custom CSS.

Here is an example, let's say you want to override the background color of your `<body>` with the color of a button, on a specific screen:
```scss
body {
  background-color: $primaryButtonColor;
}
```
You would write that code in your custom CSS editor for that specific screen.

## Full list of variables

### General layouts

Background color: `$bodyBackground`  
Font family: `$bodyFontFamily`  
Font size: `$bodyFontSize`  
Font color: `$bodyTextColor`  
Font line height: `$bodyLineHeight`  
Font weight: `$bodyFontWeight`  
Text link color: `$linkColor`  
Text link color when clicked: `$linkHoverColor`  
Text link decoration when clicked: `$linkHoverDecor`  

### Intro layout

Background color: `$introBodyBackground`  
Font family: `$introBodyFontFamily`  
Font size: `$introBodyFontSize`  
Font color: `$introBodyTextColor`  
Font line height: `$introBodyLineHeight`  
Font weight: `$introBodyFontWeight`  
Overlay color: `$introOverlayColor`  
Text link color: `$introLinkColor`  
Text link color when clicked: `$introLinkHoverColor`  
Text link decoration when clicked: `$introLinkHoverDecor`  

### Headings

Heading 1 font family: `$headingOneFont`  
Heading 1 color: `$headingOneColor`  
Heading 1 size: `$headingOneSize`  
Heading 1 line height: `$headingOneHeight`  
Heading 1 weight: `$headingOneWeight`  
Heading 1 margin top: `$headingOneMarginTop`  
Heading 1 margin bottom: `$headingOneMarginBottom`  

Heading 2 font family: `$headingTwoFont`  
Heading 2 color: `$headingTwoColor`  
Heading 2 size: `$headingTwoSize`  
Heading 2 line height: `$headingTwoHeight`  
Heading 2 weight: `$headingTwoWeight`  
Heading 2 margin top: `$headingTwoMarginTop`  
Heading 2 margin bottom: `$headingTwoMarginBottom`  

Heading 3 font family: `$headingThreeFont`  
Heading 3 color: `$headingThreeColor`  
Heading 3 size: `$headingThreeSize`  
Heading 3 line height: `$headingThreeHeight`  
Heading 3 weight: `$headingThreeWeight`  
Heading 3 margin top: `$headingThreeMarginTop`  
Heading 3 margin bottom: `$headingThreeMarginBottom`  

Heading 4 font family: `$headingFourFont`  
Heading 4 color: `$headingFourColor`  
Heading 4 size: `$headingFourSize`  
Heading 4 line height: `$headingFourHeight`  
Heading 4 weight: `$headingFourWeight`  
Heading 4 margin top: `$headingFourMarginTop`  
Heading 4 margin bottom: `$headingFourMarginBottom`  

Heading 5 font family: `$headingFiveFont`  
Heading 5 color: `$headingFiveColor`  
Heading 5 size: `$headingFiveSize`  
Heading 5 line height: `$headingFiveHeight`  
Heading 5 weight: `$headingFiveWeight`  
Heading 5 margin top: `$headingFiveMarginTop`  
Heading 5 margin bottom: `$headingFiveMarginBottom`  

Heading 6 font family: `$headingSixFont`  
Heading 6 color: `$headingSixColor`  
Heading 6 size: `$headingSixSize`  
Heading 6 line height: `$headingSixHeight`  
Heading 6 weight: `$headingSixWeight`  
Heading 6 margin top: `$headingSixMarginTop`  
Heading 6 margin bottom: `$headingSixMarginBottom`  

### Menus

Menu font: `$menuFont`  
Menu font size: `$menuFontSize`  
Bar background color: `$menuTopNavBackground`  
Bar font color: `$menuTopNavFontColor`  
Bar font shadow color: `$menuTopNavFontShadowColor`  
Bar border color: `$menuTopNavBorder`  
Bar back button or arrows color: `$menuBackButtonColor`  
Menu button color: `$menuButtonColor`  
Menu background color: `$menuBackgroundColor`  
Menu font color: `$menuFontColor`  
Menu close button color: `$menuCloseButtonColor`  
Menu footer background color: `$menuFooterBackgroundColor`  
Menu footer font color: `$menuFooterFontColor`  
Circle menu background color: `$menuExpBackground`  
Circle menu background color when open: `$menuExpBackgroundOpen`  
Circle menu button color: `$menuExpButtonColor`  
Circle menu button color when open: `$menuExpButtonColorOpen`  
Circle menu button icon color: `$menuExpButtonIconColor`  
Circle menu button icon color when open: `$menuExpButtonIconColorOpen`  
Circle menu font color: `$menuExpFontColor`  
Circle menu footer font color: `$menuExpFooterFontColor`  

### Accordions

Heading background color: `$accordionHeadingBg`  
Heading background color when open: `$accordionHeadingBgActive`  
Heading text color: `$accordionHeadingText`  
Heading text color when open: `$accordionHeadingTextActive`  
Heading chevron color: `$accordionHeadingChevron`  
Heading chevron color when open: `$accordionHeadingChevronActive`  
Accordion border: `$accordionBorder`  

### App List

Loading bars color: `$appListLoader`  
Section heading text color: `$appListHeadingsColor`  
Section heading text weight: `$appListHeadingsWeight`  
Preparing download icon color: `$appListPreparingIconColor`  
Download icon color: `$appListDownloadIconColor`  
Options icon color: `$appListInitialIconColor`  
Download completed icon color: `$appListCompletedIconColor`  
Download progress bar color: `$appListProgressBarColor`  
Download progress bar background color: `$appListProgressBarBGColor`  

Overlay background color: `$appListLoginOverlayColor`  
Overlay text color: `$appListLoginOverlayTextColor`  
Overlay top bar background color: `$appListLoginOverlayNavBar`  
Overlay top bar text color: `$appListLoginOverlayNavBarTextColor`  
Overlay close button color: `$appListCloseButtonColor`  
Overlay close button text color: `$appListCloseButtonTextColor`  
Overlay close button border color: `$appListCloseButtonBorderColor`  

### Buttons

Primary button color: `$primaryButtonColor`  
Primary button text color: `$primaryButtonTextColor`  
Primary button border: `$primaryButtonBorder`  
Primary button border radius: `$primaryButtonBorderRadius`  
Primary button color when clicked: `$primaryButtonHoverColor`  
Primary button text color when clicked: `$primaryButtonHoverTextColor`  
Primary button border when clicked: `$primaryButtonHoverBorder`  

Secondary button color: `$secondaryButtonColor`  
Secondary button text color: `$secondaryButtonTextColor`  
Secondary button border: `$secondaryButtonBorder`  
Secondary button border radius: `$secondaryButtonBorderRadius`  
Secondary button color when clicked: `$secondaryButtonHoverColor`  
Secondary button text color when clicked: `$secondaryButtonHoverTextColor`  
Secondary button border when clicked: `$secondaryButtonHoverBorder`  

### Chat

Chat general background color: `$chatBackgroundColor`  
Chat general text color: `$chatTextColor`  
Conversations list background color: `$chatConvoListBackgroundColor`  
Active conversations background color: `$chatConvoListActiveBackground`  
Active conversations right border color: `$chatConvoListActiveBorder`  
Profile top bar backgroud color: `$chatProfileTopBarBackground`  
Profile top bar text color: `$chatProfileTopBarTextColor`  
Right side message bubble background color: `$chatOwnBubbleBackground`  
Right side message bubble text color: `$chatOwnBubbleTextColor`  
Left side message bubble background color: `$chatOthersBubbleBackground`  
Left side message bubble text color: `$chatOthersBubbleTextColor`  
Input bar background color: `$chatInputBarBackground`  
Text area border color: `$chatInputBorder`  
Text area border color when active: `$chatInputActiveBorder`  

### Charts

Chart color 1: `$chartColor1`  
Chart color 2: `$chartColor2`  
Chart color 3: `$chartColor3`  
Chart color 4: `$chartColor4`  
Chart color 5: `$chartColor5`  
Chart color 6: `$chartColor6`  
Chart color 7: `$chartColor7`  
Chart color 8: `$chartColor8`  
Chart color 9: `$chartColor9`  
Chart color 10: `$chartColor10`  

### Directories - General

Directory general background color: `$directoryBackgroundColor`  
Directory general text color: `$directoryTextColor`  

### Directories - List

List item separator line: `$directoryListBorderColor`  
List item arrow color: `$directoryListChevronColor`  
List item title color: `$directoryListTitleColor`  
List item title size: `$directoryListTitleSize`  
List item title weight: `$directoryListTitleWeight`  
List item subtitle color: `$directoryListDescColor`  
List item subtitle size: `$directoryListDescSize`  
List item subtitle weight: `$directoryListDescWeight`  
List item tags background color: `$directoryListTagsColor`  
List item tags text color: `$directoryListTagsTextColor`  

Active list item background color: `$directoryActiveListColor`  
Active list item arrow color: `$directoryActiveListChevronColor`  
Active list item title color: `$directoryActiveListTitleColor`  
Active list item title size: `$directoryActiveListTitleSize`  
Active list item title weight: `$directoryActiveListTitleWeight`  
Active list item subtitle color: `$directoryActiveListDescColor`  
Active list item subtitle size: `$directoryActiveListDescSize`  
Active list item subtitle weight: `$directoryActiveListDescWeight`  
Active list item tags background color: `$directoryActiveListTagsColor`  
Active list item tags text color: `$directoryActiveListTagsTextColor`  

Alphabet divider color: `$directorySeparatorColor`  
Alphabet divider text color: `$directorySeparatorTextColor`  
Search box color: `$directorySearchColor`  
Search box color: `$directorySearchTextColor`  
Cancel search color: `$directorySearchCancel`  
Cancel search color when clicked: `$directorySearchCancelHover`  

### Directories - Detail view

Directory details top bar background color (mobile): `$directoryOverlayNavColor`  
Directory details top bar text color (mobile): `$directoryOverlayNavTextColor`  
Directory details top bar border (mobile): `$directoryOverlayNavBorderColor`  
Directory details background color (mobile): `$directoryOverlayContentColor`  
Directory details general text color: `$directoryOverlayContentTextColor`  
Directory details title text color: `$directoryOverlayContentTitleColor`  
Directory details title font: `$directoryOverlayContentTitleFont`  
Directory details title font size: `$directoryOverlayContentTitleFontSize`  
Directory details label text color: `$directoryOverlayContentLabelColor`  
Directory details label opacity: `$directoryOverlayContentLabelOpacity`  
Directory details label font: `$directoryOverlayContentLabelFont`  
Directory details label font size: `$directoryOverlayContentLabelFontSize`  
Directory details value text color: `$directoryOverlayContentValueColor`  
Directory details value font: `$directoryOverlayContentValueFont`  
Directory details value font size: `$directoryOverlayContentValueFontSize`  

### Forms

Labels font weight: `$formLabelWeight`  
Text fields border: `$formInputBorder`  
Text fields border radius: `$formInputBorderRadius`  
Text fields border when active: `$formInputBorderFocus`  
Text fields border with error: `$formInputBorderError`  
Single & multiple choice background color: `$formToggleBackgroundColor`  
Single & multiple choice border: `$formToggleBorder`  
Single & multiple choice icon color: `$formToggleColor`  
Single & multiple choice background color when selected: `$formToggleActiveBackgroundColor`  
Dropdown text color: `$formSelectTextColor`  
Dropdown arrow background color: `$formSelectArrowBackground`  
Dropdown arrow color: `$formSelectArrow`  
Required fields note color: `$formRequiredColor`  
Star color: `$formStarRating`  
Selected star color: `$formStarRatingSelected`  

### Lists

Background color: `$listBackgroundColor`  
Title color: `$titleColor`  
Title font size: `$titleSize`  
Title font weight: `$titleWeight`  
Description color: `$descriptionColor`  
Description font size: `$descriptionSize`  
Description font weight: `$descriptionWeight`  
List item separator line: `$listSeparatorColor`  
Arrow color: `$listChevronColor`  
List item background color when clicked: `$listClickColor`  
My List toggle buttons color: `$listMyListToggleColor`  
My List selected button text color: `$listMyListToggleActiveColor`  
List swipe default background color: `$listMyListSwipeColor`  
List swipe default text color: `$listMyListSwipeTextColor`  
List swipe right background color: `$listMyListSwipeRightColor`  
List swipe right text color: `$listMyListSwipeRightTextColor`  
List swipe left background color: `$listMyListSwipeLeftColor`  
List swipe left text color: `$listMyListSwipeLeftTextColor`  
PDF file list search border: `$listSearchBorder`  
PDF file list cancel search button: `$listSearchCancel`  
RSS highlight color for unread entries: `$rssHighlight`  
RSS striped background color: `$rssStripes`  

### Lock

Input fields border: `$lockInput`  
Input fields border when active: `$lockInputFocus`  
Back button color: `$lockChevronColor`  
Touch ID button border: `$touchIDBorder`  

### Login and Registration

Input fields border: `$fieldBorder`  
Input fields border radius: `$fieldBorderRadius`  
Back button color: `$chevronColor`  
Separator between back button and input text: `$chevronSeparator`  

### Panels

Title color: `$panelTitleColor`  
Title font size: `$panelTitleSize`  
Title font weight: `$panelTitleWeight`  
Description color: `$panelDescriptionColor`  
Description font size: `$panelDescriptionSize`  
Description font weight: `$panelDescriptionWeight`  
Panel background color: `$panelBackgroundColor`  
Panel border: `$panelBorder`  
Panel border radius: `$panelBorderRadius`  

### Photo Sharing

Photo container border: `$imageContainerBorder`  
Photo upload overlay background color: `$imageOverlayBackgroundColor`  
Photo upload overlay text color: `$imageOverlayTextColor`  
Photo upload overlay top bar background color: `$imageOverlayNavBackgroundColor`  
Photo upload overlay top bar text color: `$imageOverlayNavTextColor`  

### Push Notifications Overlay

Overlay background color: `$pushBackgroundColor`  
Overlay text color: `$pushTextColor`  
Overlay title font size: `$pushTitleSize`  
Overlay title font weight: `$pushTitleWeight`  
Accept button text color: `$pushAcceptButton`  
Buttons background color when tapped: `$pushButtonActive`  

### Slider

Slider heading color: `$sliderHeadingColor`  
Slider heading font size: `$sliderHeadingSize`  
Slider heading font weight: `$sliderHeadingWeigth`  
Slider heading line height: `$sliderHeadingHeight`  
Slider text color: `$sliderTextColor`  
Slider text font size: `$sliderTextSize`  
Slider text font weight: `$sliderTextWeight`  
Slider text line height: `$sliderTextHeight`  
Pagination dots width: `$paginationBulletWidth`  
Pagination dots height: `$paginationBulletHeight`  
Pagination dots color: `$paginationBulletColor`  
Pagination dots border: `$paginationBulletBorder`  
Pagination active dots color: `$paginationBulletColorActive`  
Pagination active dots border: `$paginationBulletBorderActive`  
Navigation arrows color: `$paginationChevronsColor`  

### Tables

Table border top: `$tableBorderTop`  
Table border right: `$tableBorderRight`  
Table border bottom: `$tableBorderBottom`  
Table border left: `$tableBorderLeft`  
Table row border top: `$rowBorderTop`  
Table row border right: `$rowBorderRight`  
Table row border bottom: `$rowBorderBottom`  
Table row border left: `$rowBorderLeft`  
Table cell border top: `$cellBorderTop`  
Table cell border right: `$cellBorderRight`  
Table cell border bottom: `$cellBorderBottom`  
Table cell border left: `$cellBorderLeft`  
Table cell padding: `$cellPadding`  


---

[Back](README.md)
{: .buttons}