# TV Mode

A Foundry VTT module for an account that is only used to show scenes on a TV. It hides the whole Foundry interface on that account, leaves a floating button to bring it back, and zooms each scene to fill the screen from top to bottom.

## Install

In Foundry: **Add-on Modules → Install Module**, paste this manifest URL and click **Install**:

```
https://github.com/FruityOwl/foundry-tv-mode/releases/latest/download/module.json
```

Then enable **TV Mode** in your world's **Manage Modules**.

## Set up

As GM, open **Configure Settings → TV Mode** and choose the **TV account**. No other account changes in any way, and the change reaches the TV straight away.

## Using it

- The TV account starts with the interface hidden.
- The round button shows the state of the interface: an open eye while it is on screen, a crossed-out eye while it is hidden. Click it to switch.
- Drag the button to move it. Its position and the on/off choice are remembered per browser.

## Fitting scenes to the screen

Each time a scene opens on the TV account, it is centred and zoomed so its top and bottom edges meet the top and bottom of the screen. It fits again if the window changes height, for example when you go full screen.

- This only moves the view on the TV. Nothing is saved to the scene, and other accounts keep their own view.
- An image wider than the screen is cut off at the sides. A narrower one leaves empty space beside it.
- A very small image stops at Foundry's maximum zoom, so it may not reach the edges.
- You can still zoom and pan by hand on the TV; the next scene fits again.
- Turn it off under **Configure Settings → TV Mode → Fit each scene to the screen height**.

## What stays on screen

Only the scene, the [Cast & Scene](https://github.com/DungeonMaxter/cast-and-scene) stage if you use that module, and the button.

Everything else is hidden, including windows and widgets from other modules, notifications, and other users' cursors, pings and rulers on the scene. That also covers anything shown to players as a window, such as a handout image: it appears once you show the interface.

The one exception is a modal dialog that needs an answer. The browser blocks the rest of the page while one is open, so it stays visible to keep the button usable.

## Compatibility

Foundry VTT 14. Tested with 14.368.

## Releasing a new version

Bump `version` in `module.json` and push to `main`. The GitHub Action builds `module.zip` and publishes a release; Foundry then offers the update.

## License

MIT. See [LICENSE](LICENSE).
