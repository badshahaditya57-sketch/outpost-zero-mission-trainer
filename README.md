# Outpost Zero - Junior Astronaut Mission Trainer

NASA Space Apps Challenge 2026 - challenge: **Build a Junior Astronaut Mission Trainer**.

**Outpost Zero** is a browser game where students *design* a Moon or Mars outpost on a build grid with 16 build points (solar arrays, batteries, oxygen plants, greenhouses and regolith radiation walls), then launch a 20-sol stress test with lunar nights, Martian dust storms and solar flares. A chart and a plain-language debrief show what failed first, so students redesign and learn the trade-offs real mission engineers face.

## Run locally
Open `index.html` in a browser. No install or build step.

## Deploy on Render (free)
1. Push this folder to a GitHub repository (files at the repo root).
2. Render dashboard > **New +** > **Static Site** > connect the repo.
3. Build command: leave empty (or `echo ok`). Publish directory: `.`
4. Click **Create Static Site**. You get a public `https://....onrender.com` link.

(`render.yaml` is included if you prefer Blueprint deploys.)

## NASA and space data used (list these in the submission form)
- NASA Moon: https://science.nasa.gov/moon/
- NASA Mars: https://science.nasa.gov/mars/
- NASA Artemis program: https://www.nasa.gov/humans-in-space/artemis/
- NASA Human Research Program, space radiation: https://www.nasa.gov/hrp/

Game values (oxygen use, radiation ratio between Moon and Mars, sunlight on Mars, night length) are simplified from these NASA resources. Please verify the facts on the pages above and adjust numbers in `game.js` if you want more accuracy.

## Super Intelligence (AI) disclosure
Code and text for this project were drafted with an AI assistant (Claude, by Anthropic) and then reviewed and edited by the team. No AI-generated images or audio are used. No NASA logos or branding are used.

## Ideas to extend (to make it your own)
- Add a crew-size slider or a second resource-trade-off screen.
- Add real NASA images (with credit) and your own artwork.
- Add a teacher mode with printable worksheets.

## Submission help
See `SUBMISSION.md` for a draft summary, judging map, NASA resource list, AI disclosure and demo storyboard.
