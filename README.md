# NeuraForge AI Studio Preview

Static preview site. Open `index.html` directly or deploy this folder to any static hosting service.

Included:

- Text, image, video, and music/audio generation workspaces
- Model slots for GPT5.5, DeepSeek V4, gpt-image2, nanobanana, Seedance 2.0, and Veo 3.1
- Simulated generation progress
- Automatic cloud library upload flow
- Asset filtering and detail preview dialog
- Responsive desktop and mobile UI

For a production build, move the model config in `app.js` to a backend config API, then replace `simulateGeneration()` with real job submission, polling, and cloud storage callbacks.
