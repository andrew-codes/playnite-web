# Project: Playnite Web MQTT Plugin

## Description

Plugin to the Playnite application capable of receiving MQTT messages to start, stop, restart, install, and uninstall games in a Playnite instance. This plugin is intended to work together with Playnite Web to support home automation of users' game libraries.

## Tech Stack

- C#

## Code Conventions

## Project Structure

- Models: data classes
- Services
  - Mqtt: implementation details for connecting, subscribing, publishing to a MQTT broker
  - Subscribers: contracts for subscribing to game action events
- UI: XAML UI for the settings of the plugin
- manifest.yaml: generated file when releasing a new version, do not update this file manually
- PlayniteWebMqtt.cs: entrypoint for the application
