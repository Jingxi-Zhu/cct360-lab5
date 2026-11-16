
document.addEventListener("DOMContentLoaded", function () {

    const audio = document.getElementById("cityAudio");
    const playButton = document.getElementById("playButton");
    const playIcon = document.getElementById("playIcon");
    const restartButton = document.getElementById("restartButton");
    const progressBar = document.getElementById("progressBar");
    const volumeSlider = document.getElementById("volumeSlider");
    const currentTimeDisplay = document.getElementById("currentTime");
    const durationDisplay = document.getElementById("duration");
    const soundIndicator = document.getElementById("soundIndicator");

    const sceneNumber = document.getElementById("sceneNumber");
    const sceneLabel = document.getElementById("sceneLabel");
    const sceneTitle = document.getElementById("sceneTitle");
    const sceneDescription = document.getElementById("sceneDescription");

    const sceneButtons = document.querySelectorAll(".scene-button");
    const sceneElements = document.querySelectorAll(".scene");

    const scenes = [
        {
            id: "morning",
            start: 0,
            number: "01 / 03",
            label: "MORNING IN SHANGHAI",
            title: "The City Awakens",
            description: "Bicycle bells ring beneath the plane trees. Birds sing as the city slowly begins its day."
        },
        {
            id: "afternoon",
            start: 25,
            number: "02 / 03",
            label: "AFTERNOON IN SHANGHAI",
            title: "The City in Motion",
            description: "Busy streets, passing buses and conversations fill the air. Shanghai moves to the rhythm of everyday life."
        },
        {
            id: "evening",
            start: 55,
            number: "03 / 03",
            label: "EVENING IN SHANGHAI",
            title: "When the Lights Come On",
            description: "The skyline begins to glow. Music drifts through the night as the city settles into a different rhythm."
        }
    ];

    let activeScene = "morning";

    audio.volume = 0.8;

    function formatTime(seconds) {
        if (!Number.isFinite(seconds)) {
            return "0:00";
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        return minutes + ":" + String(remainingSeconds).padStart(2, "0");
    }

    function updateScene(sceneId) {
        if (activeScene === sceneId) {
            return;
        }

        const selectedScene = scenes.find(function (scene) {
            return scene.id === sceneId;
        });

        if (!selectedScene) {
            return;
        }

        activeScene = sceneId;

        sceneElements.forEach(function (element) {
            element.classList.toggle("active", element.id === sceneId);
        });

        sceneButtons.forEach(function (button) {
            const isActive = button.dataset.scene === sceneId;

            button.classList.toggle("active", isActive);

            if (isActive) {
                button.setAttribute("aria-current", "true");
            } else {
                button.removeAttribute("aria-current");
            }
        });

        sceneNumber.textContent = selectedScene.number;
        sceneLabel.textContent = selectedScene.label;
        sceneTitle.textContent = selectedScene.title;
        sceneDescription.textContent = selectedScene.description;

        sceneTitle.style.animation = "none";
        sceneDescription.style.animation = "none";

        void sceneTitle.offsetWidth;

        sceneTitle.style.animation = "contentAppear 0.9s ease both";
        sceneDescription.style.animation = "contentAppear 1.1s ease both";
    }

    function updateSceneFromTime() {
        const time = audio.currentTime;

        if (time >= 55) {
            updateScene("evening");
        } else if (time >= 25) {
            updateScene("afternoon");
        } else {
            updateScene("morning");
        }
    }

    function updatePlayButton() {
        if (audio.paused) {
            playIcon.innerHTML = "&#9654;";
            playButton.setAttribute("aria-label", "Play audio");
            soundIndicator.classList.remove("playing");
        } else {
            playIcon.innerHTML = "&#10074;&#10074;";
            playButton.setAttribute("aria-label", "Pause audio");
            soundIndicator.classList.add("playing");
        }
    }

    function playAudio() {
        const playRequest = audio.play();

        if (playRequest !== undefined) {
            playRequest.catch(function (error) {
                console.error("Audio playback failed:", error);
            });
        }
    }

    playButton.addEventListener("click", function () {
        if (audio.paused) {
            if (audio.ended) {
                audio.currentTime = 0;
            }

            playAudio();
        } else {
            audio.pause();
        }
    });

    restartButton.addEventListener("click", function () {
        audio.currentTime = 0;
        updateSceneFromTime();
        playAudio();
    });

    sceneButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const selectedScene = button.dataset.scene;

            const scene = scenes.find(function (item) {
                return item.id === selectedScene;
            });

            if (!scene) {
                return;
            }

            audio.currentTime = scene.start;
            updateSceneFromTime();

            playAudio();
        });
    });

    audio.addEventListener("timeupdate", function () {
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
        progressBar.value = audio.currentTime;

        updateSceneFromTime();
    });

    audio.addEventListener("loadedmetadata", function () {
        if (Number.isFinite(audio.duration)) {
            progressBar.max = audio.duration;
            durationDisplay.textContent = formatTime(audio.duration);
        }
    });

    progressBar.addEventListener("input", function () {
        if (audio.readyState === 0) {
            return;
        }

        audio.currentTime = Number(progressBar.value);
        currentTimeDisplay.textContent = formatTime(audio.currentTime);

        updateSceneFromTime();
    });

    volumeSlider.addEventListener("input", function () {
        audio.volume = Number(volumeSlider.value);
    });

    audio.addEventListener("play", updatePlayButton);
    audio.addEventListener("pause", updatePlayButton);

    audio.addEventListener("ended", function () {
        updatePlayButton();
        progressBar.value = audio.duration;
        currentTimeDisplay.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("error", function () {
        console.error("Unable to load the Shanghai soundscape audio file.");
        updatePlayButton();
    });

    document.addEventListener("keydown", function (event) {
        const activeElement = document.activeElement;
        const tagName = activeElement ? activeElement.tagName : "";

        if (
            event.code === "Space" &&
            tagName !== "BUTTON" &&
            tagName !== "INPUT" &&
            tagName !== "TEXTAREA"
        ) {
            event.preventDefault();

            if (audio.paused) {
                playAudio();
            } else {
                audio.pause();
            }
        }
    });

    sceneButtons.forEach(function (button) {
        button.classList.toggle(
            "active",
            button.dataset.scene === activeScene
        );
    });

    const firstButton = document.querySelector(
        '.scene-button[data-scene="morning"]'
    );

    if (firstButton) {
        firstButton.setAttribute("aria-current", "true");
    }

    updatePlayButton();

});
