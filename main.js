// ==UserScript==
// @name         Lower Youtube preview volume
// @namespace    http://tampermonkey.net/
// @version      2026-05-09
// @description  Youtube previews are too goddamn loud and the volume is not settable, so I fixed it.
// @author       Vicbo
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function() {
    'use strict';

    const isHomeScreen = () => {
        return location.hostname === "www.youtube.com" && location.pathname === "/";
    }

    const isPreviewVideo = videoElement => {
        return !!videoElement.closest("ytd-video-preview");
    };

    const DEFAULT_PREVIEW_VOLUME = 0.25;

    const getPreviewVolume = () => {
        return GM_getValue(
            "previewVolume",
            DEFAULT_PREVIEW_VOLUME
        );
    }

    const configureVolume = async () => {
        const current = getPreviewVolume();

        const input = prompt(
            "Youtube preview volume (0.0 - 1.0)",
            current
        );

        if (input === null) return;

        let value = parseFloat(input);

        if (isNaN(value) || value < 0 || value > 1) {
            value = DEFAULT_PREVIEW_VOLUME;
        }

        await GM_setValue("previewVolume", value);
    }

    GM_registerMenuCommand(
        "Set preview volume",
        configureVolume
    );

    const volumeDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "volume");

    Object.defineProperty(HTMLMediaElement.prototype, "volume",
        {
            get() {
                return volumeDescriptor.get.call(this);
            },

            set(value) {
                if (isHomeScreen() && isPreviewVideo(this)) {
                    value = getPreviewVolume();
                }

                return volumeDescriptor.set.call(this, value);
            }
        }
    );
})();
