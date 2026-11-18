---
name: RoboBuild
description: A hands-on science workbook for building robots one step at a time.
colors:
  cobalt: "#203fc7"
  cobalt-hover: "#102994"
  link-blue: "#203fa9"
  focus-blue: "#2859d4"
  selected-blue: "#dce4ff"
  scene-blue: "#a9bad1"
  preview-blue: "#e1eaf4"
  paper: "#f4efe3"
  panel: "#fffaf0"
  raised: "#e9e4d9"
  ink: "#20253b"
  muted-ink: "#505772"
  rule: "#c7c1b5"
  control: "#848b9f"
  white: "#ffffff"
  warning-ink: "#793c10"
  warning-paper: "#f8e5c7"
typography:
  display:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(40px, 7.1vw, 96px)"
    fontWeight: 750
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "clamp(23px, 3.4vw, 43px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.028em"
  step-heading:
    fontFamily: "Source Serif 4, Georgia, serif"
    fontSize: "27px"
    fontWeight: 750
    lineHeight: 1.14
  body:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "14px"
    lineHeight: 1.5
  label:
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  field: "4px"
  button: "5px"
  popover: "8px"
  panel: "10px"
  dock: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "9px 13px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-hover}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "9px 13px"
  button-catalog:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.cobalt}"
    rounded: "{rounded.button}"
    padding: "9px 13px"
  search-field:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "9px 10px"
  catalog-wordmark:
    textColor: "{colors.cobalt}"
  part-state:
    backgroundColor: "{colors.selected-blue}"
    textColor: "{colors.link-blue}"
    rounded: "{rounded.field}"
    padding: "5px 9px"
  instruction-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.step-heading}"
    rounded: "{rounded.panel}"
  step-dock:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.dock}"
    padding: "6px"
---

# Design System: RoboBuild

## Overview

**Creative North Star: "Hands-on science workbook"**

Warm paper, cobalt ink, and large serif headings give the guide the feel of a workbook kept beside a physical build. Real CAD renders show the assemblies and parts a builder will encounter.

The guide gives the robot a single blue 3D field. Paper overlays hold the current instruction, camera actions, and step controls so builders can read and handle the model in the same view.

**Key Characteristics:**

- Warm paper surfaces with thin dividing rules.
- Cobalt actions and serif headings that mark the reading order.
- Real robot geometry and short, labeled controls.

## Colors

Cobalt marks primary actions and major headings. Link blue carries references and part states. The pale selected blue marks toggled controls and the selected part. A brighter blue outlines keyboard focus.

Paper is the catalog background, panel is the warmer light surface for overlays, and raised paper marks hover and inset notes. Ink and muted ink carry text. Use the light rule for dividers and the stronger control border for inputs and buttons. Scene blue backs the 3D workbench. Pale preview blue backs the catalog renders. Warning ink and warning paper are reserved for cautions.

## Typography

Source Serif 4 is used for the catalog lead, build titles, and guided step indices. The variable Latin font (600–800) is self-hosted under `static/fonts/` with its SIL Open Font License. Georgia is the display fallback.

Use system sans for instructions, navigation, and controls. Use tabular figures for step and part counts, and system monospace for technical identifiers and live simulation values. Guided instruction copy is 15px with a 1.55 line height.

## Layout

The catalog shell has a maximum width of 1312px and fluid gutters. All four guides use equal-size render-and-text rows with dividing rules and visible build details. The preview fills the row height and Start or Continue follows the details. At 699px and below, the intro and catalog rows stack.

The workbench uses the dynamic viewport height, with safe-area insets around the paper controls. At 900px wide and 540px high or larger, instructions sit in a left rail. At 899px wide or below, or 539px high or below, the guided rail becomes a bottom sheet above the persistent step dock. It starts collapsed and shows the current step and any warning cue in the toggle. Expanded instructions scroll inside the sheet. Parts use a right rail from 1200px wide and 540px high, and a dialog in smaller viewports.

## Elevation & Depth

Paper overlays separate from the workbench through color and position. Fine rules divide rows and panel content. Reserve soft shadows for floating View options and deeper shadows for dialogs.

## Shapes

Use small corners for fields and buttons and softened corners for panels, previews, and the dock. Keep button and field targets at least 44px high and give keyboard focus a 3px outline with a 3px offset.

## Components

- **Guide actions** use filled cobalt for Robot Hand’s Start or Continue action and the primary guided action. Other catalog actions use a cobalt outline. Secondary workbench buttons use a paper fill and an ink label.
- **Catalog previews** use the CAD renders and descriptive alt text. Render failure gets a text fallback.
- **Inventory** uses a labeled search input, two pressed-state tabs, and ruled part rows with a color name and quantity. Selected part states use a pale blue label.
- **Guided controls** keep Look at this step and See whole build in a compact camera group. Back a step, Watch this step, and Next step sit in the dock. Workshop tools expose the timeline and additional inspection controls. The movement demo uses the same scene.
- **Instruction sheet** uses a labeled disclosure with an expanded state. Keep its step description, required parts, cautions, and official reference together. The desktop rail presents the same content directly.

## Do's and Don'ts

- **Do** use the CAD previews and keep the robot in view beside the current step.
- **Do** keep step controls reachable by touch and keyboard, including with the instruction sheet expanded.
- **Do** keep warning words and original instruction links visible where builders need them.
- **Don't** use amber for decorative accents or mark step and part states by color alone.
- **Don't** place a separate framed viewer inside the workbench or add an extra canvas for the movement demo.
