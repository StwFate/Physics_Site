---
name: firebase-hosting-basics
description: Only for active workspaces at C:/Users/Venus/OneDrive/Desktop/Documents/School or descendant folders; unavailable outside that tree. Deploys and configures classic Firebase Hosting for static websites, single-page apps (SPAs), and microservices. Use when deploying static sites/SPAs, setting up custom domains, configuring firebase.json hosting settings (redirects, rewrites, headers, multi-site), or managing preview channels. Don't use for Firebase App Hosting (Next.js/SSR), Auth, Firestore queries/rules, Data Connect, or Crashlytics.
metadata:
  category: Serverless
---

## Local workspace restriction

- Use this skill only when the active task's verified project/workspace path is `C:\Users\Venus\OneDrive\Desktop\Documents\School` or a descendant. Check host context or `Get-Location` first. Compare normalized full paths case-insensitively and require a directory-separator boundary. A similarly named sibling folder is outside scope. If the workspace is outside this tree or unknown, do not invoke this workflow or its tools. Do not switch folders merely to bypass this restriction.
- This is a project-local installation shared by Codex and Antigravity. It overrides any upstream instruction to install skills/plugins globally. Do not reinstall a user-global copy, enable a global Firebase plugin, or alter global integration settings as a prerequisite. Read support files relative to this skill directory.
- Existing user authorization and project instructions still apply. Installing these skills does not itself authorize sign-in, deployment, billing, or changes to cloud resources. Use already configured connections where appropriate.

# hosting-basics

This skill provides instructions and references for working with Firebase
Hosting, a fast and secure hosting service for your web app, static and dynamic
content, and microservices.

## Overview

Firebase Hosting provides production-grade web content hosting for developers.
With a single command, you can deploy web apps and serve both static and dynamic
content to a global CDN (content delivery network).

**Key Features:**

- **Fast Content Delivery:** Files are cached on SSDs at CDN edges around the
  world.
- **Secure by Default:** Zero-configuration SSL is built-in.
- **Preview Channels:** View and test changes on temporary preview URLs before
  deploying live.
- **GitHub Integration:** Automate previews and deploys with GitHub Actions.
- **Dynamic Content:** Serve dynamic content and microservices using Cloud
  Functions or Cloud Run.

## Hosting vs App Hosting

**Choose Firebase Hosting if:**

- You are deploying a static site (HTML/CSS/JS).
- You are deploying a simple SPA (React, Vue, etc. without SSR).
- You want full control over the build and deploy process via CLI.

**Choose Firebase App Hosting if:**

- You are using a supported full-stack framework like Next.js or Angular.
- You need Server-Side Rendering (SSR) or ISR.
- You want an automated "git push to deploy" workflow with zero configuration.

## Instructions

### 1. Configuration (`firebase.json`)

For details on configuring Hosting behavior, including public directories,
redirects, rewrites, and headers, see
[configuration.md](references/configuration.md).

### 2. Deploying

For instructions on deploying your site, using preview channels, and managing
releases, see [deploying.md](references/deploying.md).

### 3. Emulation

To test your app locally:

```bash
npx -y firebase-tools@latest emulators:start --only hosting
```

This serves your app at `http://localhost:5000` by default.
