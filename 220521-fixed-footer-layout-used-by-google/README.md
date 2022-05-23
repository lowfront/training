# Fixed Footer Layout used By Google

[Example](https://lowfront.github.io/training/fixed-footer-layout-used-by-google)

This is the fixed layout of the footer used on the Google search page. The problem that is easily encountered in the footer layout is that if there is less content, it sticks to the bottom of the content and shows the space under the footer. Even if the content is sufficiently filled, the content may be reduced according to the browser's enlargement ratio. So if you simply place the footer statically under the content, there can be a space under the footer.

The Google Search page uses certain CSS rules to handle the footer to be pinned to the bottom of the screen regardless of content content.

1. All elements on the screen are wrapped into containers with property `position: relative; min-heihgt: 100vh`. Through this, even if the content is small, all contents secure at least the height of the screen size.

2. The content is put in the first child of the element that wraps around the whole and the second child is the wrapper that wraps around the footer.

3. The footer wrapper has an `position: static` property, and the footer has a `position: absolute` property, so that the footer is always fixed on the floor. At this time, the position target of the foot becomes the entire container with attribute `position: relative`.

This way, the footer is always fixed at the bottom regardless of the length of the content and the screen ratio of the screen.