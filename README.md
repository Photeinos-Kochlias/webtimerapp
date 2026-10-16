# webtimerapp

A simple and easy-to-use timer application.
Just set the time and press the button. That’s it.

## Features

* Simple UI with minimal controls
* Customizable timer duration
* Sound feedback when the timer ends
* Automatic start for the next session (Pomodoro-style)

## Usage

1. Set the desired time (hours, minutes, seconds)
2. Press the start button
3. Wait for the timer to finish

## Changelog

### Ver 2.2.0 (2026/6/19 22:43 JST)

* The timer text automatically adjusts its size to always fit within the circular ring, even when displaying longer durations (e.g., over 1 hour).
* The timer continues seamlessly even if the app is closed. Progress is restored based on the elapsed time when the app is reopened.
* Users can save custom timer and Pomodoro presets for quick reuse.
* Each preset can include: Name, Description, Labels (for categorization and organization)

### Ver 2.1.0 (2026/6/18 23:19 JST)

* Added button to switch dark-mode and light-mode

### Ver 2.0.0 (2026/6/18 21:19 JST)

* Changed language from html to Next.js

### Ver 1.1.1 (2026/6/15 10:10 JST)

* Removed the maximum value limit for the hour input field
* Fixed minor bugs

### Ver 1.1.0 (2026/6/14 18:08 JST)

* Added sound feedback
* Enabled automatic start for the next Pomodoro step
* Updated URL


## Notes

* Designed for simplicity
* Behavior may vary depending on environment


## 技術スタック

- **Next.js 15** (App Router, Static Export)
- **TypeScript**
- **Web Audio API** (sound effect)
- **Theme administration with global CSS**
