---
name: firebase-crashlytics
description: Only for active workspaces at C:/Users/Venus/OneDrive/Desktop/Documents/School or descendant folders; unavailable outside that tree. Comprehensive guide for Firebase Crashlytics, including provisioning and SDK usage. Use this skill when the user needs help setting up Crashlytics, adding crash reporting, or using the Crashlytics SDK in their application.
metadata:
  category: CloudObservabilityAndMonitoring
  upstream_compatibility: This skill is best used with the Firebase CLI, but does not require it. Firebase CLI can be accessed through `npx -y firebase-tools@latest`.
---

## Local workspace restriction

- Use this skill only when the active task's verified project/workspace path is `C:\Users\Venus\OneDrive\Desktop\Documents\School` or a descendant. Check host context or `Get-Location` first. Compare normalized full paths case-insensitively and require a directory-separator boundary. A similarly named sibling folder is outside scope. If the workspace is outside this tree or unknown, do not invoke this workflow or its tools. Do not switch folders merely to bypass this restriction.
- This is a project-local installation shared by Codex and Antigravity. It overrides any upstream instruction to install skills/plugins globally. Do not reinstall a user-global copy, enable a global Firebase plugin, or alter global integration settings as a prerequisite. Read support files relative to this skill directory.
- Existing user authorization and project instructions still apply. Installing these skills does not itself authorize sign-in, deployment, billing, or changes to cloud resources. Use already configured connections where appropriate.

# Crashlytics

This skill provides a complete guide for getting started with Crashlytics on
Android or iOS. Crash data collected from client applications can be read using
the MCP server in the Firebase CLI.

## Prerequisites

Provisioning Crashlytics requires both a Firebase project and a Firebase app,
either Android or iOS. To read the data collected by Crashlytics, install the
MCP server in the Firebase CLI. See the `firebase-basics` skill for references.

## SDK Setup

To learn how to setup Crashlytics in your application code, choose your
platform:

- **Android**: [android_setup.md](references/android_setup.md)
- **iOS**: [ios_setup.md](references/ios_setup.md)

## SDK Usage

The SDK provides a number of features to make crash reports more actionable.

- Add custom keys
- Add custom logs
- Set user identifiers
- Report non-fatal exceptions

To learn how to customize crash reports and add additional debugging data,
consult the documentation for your platform.

- **Android**:
  [Customize Crash Reports for Android](https://firebase.google.com/docs/crashlytics/android/customize-crash-reports.md)
- **iOS**:
  [Customize Crash Reports for Apple Platforms](https://firebase.google.com/docs/crashlytics/ios/customize-crash-reports.md)
