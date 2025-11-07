# Project: Playnite Web Plugin

## Description

Plugin to the Playnite application responsible for sending Playnite game data to the Playnite Web web application via a GraphQL request.

## Tech Stack

- C#

## Code Conventions

## Project Structure

- Models: data classes
- Services
  - Publishers: directories of implementations of different kind of ways to publish data to Playnite Web app; primarily being GraphQL
  - Subscribers: directories of various ways to subscribe to events from Playnite Web; primarily being GraphQL via websockets
  - Updaters: code to update Playnite data from subscribed events from Playnite Web app
- UI: XAML UI for the settings of the plugin
- manifest.yaml: generated file when releasing a new version, do not update this file manually
- PlayniteWeb.cs: entrypoint for the application
