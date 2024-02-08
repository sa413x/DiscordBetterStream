/**
 * @name DiscordBetterStream
 * @version 0.0.1
 * @description A plugin for BetterDiscord that allows you to move and zoom the stream in the Discord application.
 */

const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
  info: {
    name: "DiscordBetterStream",
    authors: [
      {
        name: "sa413x",
      },
    ],
    version: "0.0.1",
    description:
      "A plugin for BetterDiscord that allows you to move and zoom the stream in the Discord application.",
    github_raw: "",
  },
  changelog: [
    {
      title: "Initial Release",
      type: "release",
      items: ["Added the ability to move and zoom the stream window."],
    },
  ],
  defaultConfig: [],
};

module.exports = !global.ZeresPluginLibrary
  ? class {
      constructor() {
        this._config = config;
      }

      load() {
        BdApi.showConfirmationModal(
          "Library plugin is needed",
          `The library plugin needed for AQWERT'sPluginBuilder is missing. Please click Download Now to install it.`,
          {
            confirmText: "Download",
            cancelText: "Cancel",
            onConfirm: () => {
              request.get(
                "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                (error, response, body) => {
                  if (error)
                    return electron.shell.openExternal(
                      "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                    );

                  fs.writeFileSync(
                    path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
                    body
                  );
                }
              );
            },
          }
        );
      }

      start() {}

      stop() {}
    }
  : (([Plugin, Library]) => {
      const { DOMTools } = Library;

      class plugin extends Plugin {
        constructor() {
          super();
          this.updateInterval = null;
          this.eventListenersAdded = false;
          this.videoFrame = null;
          this.handleMouseDown = this.handleMouseDown.bind(this);
          this.handleMouseWheel = this.handleMouseWheel.bind(this);
        }

        onStart() {
          this.checkForVideoFrame();
          this.updateInterval = setInterval(
            () => this.checkForVideoFrame(),
            1000
          );
        }

        // Updates the video frame class every second,
        // removes old events and adds new events to the video frame
        checkForVideoFrame() {
          const newVideoFrame = DOMTools.Q(".videoFrame_b3cb57");

          if (newVideoFrame !== null && !this.eventListenersAdded) {
            newVideoFrame.style.transform = `scale(1)`;
            newVideoFrame.style.left = `1px`;
            newVideoFrame.style.top = `-60px`;
            newVideoFrame.addEventListener("mousedown", this.handleMouseDown);
            newVideoFrame.addEventListener("wheel", this.handleMouseWheel);

            this.eventListenersAdded = true;
            this.videoFrame = newVideoFrame;
          } else if (newVideoFrame === null && this.eventListenersAdded) {
            this.removeEventListeners();
          }
        }

        // Removes all listeners
        removeEventListeners() {
          if (this.videoFrame) {
            this.videoFrame.removeEventListener(
              "mousedown",
              this.handleMouseDown
            );
            this.videoFrame.removeEventListener("wheel", this.handleMouseWheel);
          }

          this.eventListenersAdded = false;
          this.videoFrame = null;
        }

        // Handles moving the video frame with the middle mouse button
        handleMouseDown(e) {
          if (e.button === 1) {
            e.preventDefault();
            const initialX = e.clientX;
            const initialY = e.clientY;
            const rect = this.videoFrame.getBoundingClientRect();

            // Fixes relative offset for the video frame
            const initialLeft =
              parseInt(this.videoFrame.style.left, 10) || rect.left;
            const initialTop =
              parseInt(this.videoFrame.style.top, 10) || rect.top;

            const onMouseMove = (moveEvent) => {
              const dx = moveEvent.clientX - initialX;
              const dy = moveEvent.clientY - initialY;

              // Applies the new offset
              this.videoFrame.style.left = initialLeft + dx + "px";
              this.videoFrame.style.top = initialTop + dy + "px";
            };

            const onMouseUp = () => {
              document.removeEventListener("mousemove", onMouseMove);
              document.removeEventListener("mouseup", onMouseUp);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
          }
        }

        // Handles zooming the video frame with the mouse wheel scroll
        handleMouseWheel(e) {
          if (e.ctrlKey) {
            e.preventDefault();
            const scaleAmount = 0.05;
            const currentScale =
              Number(this.videoFrame.style.transform.replace(/[^0-9.]/g, "")) ||
              1;
            const delta = e.deltaY < 0 ? scaleAmount : -scaleAmount;
            const newScale = Math.max(0.1, currentScale + delta);

            // Calculate the point to zoom towards
            const rect = this.videoFrame.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const newX = ((x - rect.width / 2) * delta) / newScale;
            const newY = ((y - rect.height / 2) * delta) / newScale;

            // Update the transform and translation
            this.videoFrame.style.transform = `scale(${newScale})`;
            this.videoFrame.style.left = `${
              (parseFloat(this.videoFrame.style.left) || 0) - newX
            }px`;
            this.videoFrame.style.top = `${
              (parseFloat(this.videoFrame.style.top) || 0) - newY
            }px`;
          }
        }

        onStop() {
          clearInterval(this.updateInterval);
          this.removeEventListeners();
        }

        patch() {}
      }

      return plugin;
    })(global.ZeresPluginLibrary.buildPlugin(config));
