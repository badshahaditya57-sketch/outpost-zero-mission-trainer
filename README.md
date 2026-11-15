# Outpost Zero - Junior Astronaut Mission Trainer

**A browser-based mission trainer where students design a Moon or Mars outpost, predict what will fail, and stress-test it.**

Built by Team The Vision for the NASA Space Apps Challenge 2026.
Challenge: *Build a Junior Astronaut Mission Trainer*.

**Play it:** [https://outpost-zero-mission-trainer.onrender.com]

---

## Overview

Space-themed STEM content often hides the engineering trade-offs that decide whether a mission succeeds. Outpost Zero puts those trade-offs in the player's hands.

Players get a limited build budget and place parts on a grid: solar arrays, batteries, oxygen plants, greenhouses and regolith radiation walls. They predict what will go wrong first, then launch a 20-sol (Mars-day) test for a crew of four. The test includes lunar nights, Martian dust storms and solar flares. A chart and a short debrief explain what happened, and players redesign and try again.

## Features

- **Design-first gameplay:** build on a 6 x 4 grid under a point budget.
- **Prediction step:** guess the first failure before testing, then compare.
- **Two locations:** the Moon (strong sun, long nights, high radiation) and Mars (weaker sun, dust storms).
- **Three difficulty levels:** Cadet (20 points), Pilot (16) and Commander (13), with different event frequencies.
- **Challenge codes:** a seed fixes nights, storms and flares so classmates can compare designs fairly.
- **Feedback:** health, oxygen and food chart, star rating (1 to 3), score and best score saved in the browser.
- **Classroom tools:** shareable result text and a printable mission certificate.
- **Accessibility:** keyboard-operable controls, labelled buttons, visible focus and reduced-motion support.

## How to play

1. Choose your name, level, challenge code and location.
2. Pick a part and tap empty plots to build. Tap a built part to remove it.
3. Choose a prediction and launch the 20-sol test.
4. Read the chart and debrief, then improve the design.

Stars: 1 for surviving, 2 for finishing with 60% health or more, 3 for also saving at least 3 build points.

## Simulation model

All values are simplified for learning and tuned for playability.

| Item | Rule |
|---|---|
| Crew | 4 astronauts; use 4 oxygen and 4 food per sol |
| Starting stores | 30 oxygen, 30 food; battery starts full |
| Habitat | Uses 1 power per sol |
| Solar array (2 pts) | 3 power in daylight, scaled by location (Moon 1.0, Mars 0.5) |
| Battery (1 pt) | Stores 5 power |
| Oxygen plant (3 pts) | Makes 4 oxygen; uses 2 power |
| Greenhouse (3 pts) | Makes 3 food; uses 2 power |
| Regolith wall (2 pts) | Each reduces radiation damage by about 22% |
| Lunar night | 3 of every 9 sols (shortened from about 14 Earth days) |
| Dust storm (Mars) | 3 sols at 25% sunlight |
| Solar flare | 3.5 x radiation for that sol |
| Radiation | Moon baseline about 2.2 x Mars baseline |
| Failure penalties | No oxygen: -25 health; no food: -10 health |

If power is short, oxygen and food production scale down in proportion.

## Tech stack

Plain HTML, CSS and JavaScript. No framework, no build step and no external runtime dependencies. Progress (name and best scores) is stored in the browser's `localStorage` only; no data is sent anywhere.

```
index.html   page shell
style.css    visual style and print styles
game.js      game logic, simulation and UI
render.yaml  optional Render blueprint
```

## Run locally

Open `index.html` in any modern browser. No installation is needed.

## Deploy

The project is a static site and is hosted on Render.

1. Push the repository to GitHub with the files at the root.
2. In Render, choose **New > Static Site** and connect the repository.
3. Leave the build command empty and set the publish directory to `.`.

## NASA data and references

Facts and game values are simplified from these NASA resources:

- NASA Moon: https://science.nasa.gov/moon/
- NASA Mars: https://science.nasa.gov/mars/
- NASA Artemis: https://www.nasa.gov/humans-in-space/artemis/
- NASA Human Research Program: https://www.nasa.gov/hrp/

The game is a teaching model, not a flight-accurate simulation. No NASA logos, flags or mission identifiers are used.

## Use of AI tools

In line with the Space Apps Super Intelligence (SI) guidelines, we are disclosing where AI was used:

- **Code:** the initial HTML, CSS and JavaScript were generated with Claude (Anthropic). [Describe what your team changed, tested and added.]
- **Text:** the first drafts of this README and the submission text were written with Claude. [Describe your edits.]
- **Images, audio and video:** none are AI-generated. The interface uses only code-drawn shapes and text.

Our team chose the project direction, reviewed and tested the game, and is responsible for its content.

## Team

Team The Vision: Aditya Raj and Mayank Kumar

## Acknowledgements

Thanks to NASA and the Space Apps Challenge organizers and local leads for the challenge and for the public data and resources that informed this project.

