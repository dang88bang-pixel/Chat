# Chat 🎮

Ein Unity-Projekt mit automatischem CI/CD-Build via **GameCI**.

## ⚡ Quick Start

Jeder Push auf `main` oder Feature-Branches baut automatisch eine **Android-APK** in der GitHub-Cloud – ohne lokale Unity-Installation.

Die fertige APK steht im Workflow-Run unter **Artifacts** zum Download bereit.

## 📦 Projektstruktur

```
Chat/
├── Assets/
│   ├── Scenes/SampleScene.unity     # Startszene
│   ├── Scripts/Bootstrap.cs         # Bootstrap-Skript
│   └── Editor/BuildScript.cs        # Headless-Build-Helper
├── ProjectSettings/                  # Unity Project Settings
├── .github/workflows/
│   ├── build-android.yml            # 🔨 Build Android APK
│   └── activate-license.yml         # 🔑 Unity-Lizenz aktivieren
└── docs/GAMECI.md                   # Einrichtungsdokumentation
```

## 🔧 CI/CD einrichten

Siehe **[docs/GAMECI.md](docs/GAMECI.md)** für die komplette Anleitung.

### Kurzversion:

1. **Unity-Lizenz als Secret hinterlegen:**
   - **Personal:** `UNITY_LICENSE` ← Inhalt der `.ulf`-Datei
   - **Plus/Pro:** `UNITY_EMAIL`, `UNITY_PASSWORD`, `UNITY_SERIAL`
2. Fertig! Jeder Push baut die APK automatisch. 🎉

## 🛠 Lokaler Build

```bash
# Unity Editor öffnen und Build starten
unity -quit -batchmode -executeMethod BuildScript.BuildAndroid
```

## 📋 Tech Stack

- **Unity** (2022.3 LTS)
- **GameCI** (Docker-basierter CI)
- **GitHub Actions**
