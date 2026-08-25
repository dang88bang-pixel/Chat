# 🎮 GameCI – Automatischer Android-Build

Dieses Dokument beschreibt, wie der GitHub-Actions-Workflow **🔨 Build Android APK** konfiguriert wird,
sodass jeder Push auf `main` automatisch eine **APK** als Artefakt bereitstellt – ganz ohne lokale Unity-Installation.

---

## 📋 Voraussetzungen

| Bedarf | Hinweis |
|--------|---------|
| Unity-Lizenz | **Personal** (kostenlos) oder **Plus/Pro** |
| Unity Version | `2022.3.20f1` (im Workflow definiert; an eure Version anpassen) |
| GitHub-Repo   | `dang88bang-pixel/Chat` |

---

## 🔑 Lizenz-Setup (einmalig)

### Variante A – Personal License (kostenlos)

1. **Workflow ausführen:**  
   GitHub → Repo → **Actions** → Workflow **„🔑 Unity-Lizenz aktivieren"** → *Run workflow*
   
   > Dieser Workflow ist optional – er existiert als Convenience. Alternativ könnt ihr die Lizenz manuell exportieren:

2. **Lizenz-Datei (.ulf) erzeugen:**  
   Öffne <https://license.unity3d.com/manual> → *Sign in* → *Manage license* → *Request license file*  
   Lade die heruntergeladene `.ulf`-Datei herunter.

3. **Inhalt als Secret hinterlegen:**  
   Repo → **Settings** → **Secrets and variables** → **Actions** → *New repository secret*  
   - Name: `UNITY_LICENSE`  
   - Value: Kompletter Dateiinhalt der `.ulf`-Datei (einschließlich `-----BEGIN LICENSE FILE-----` … `-----END LICENSE FILE-----`)

### Variante B – Plus / Pro License

| Secret | Wert |
|--------|------|
| `UNITY_EMAIL` | Unity-Account E-Mail |
| `UNITY_PASSWORD` | Unity-Account Passwort |
| `UNITY_SERIAL` | Serial-Key (z.B. `XXXX-XXXX-XXXX-XXXX-XXXX`) |

Diese drei Secrets unter **Settings → Secrets and variables → Actions** anlegen.

---

## 🚀 So funktioniert der Build

```
Push / PR → GitHub Actions → Unity in Docker (GameCI) → APK → Artefakt-Download
```

1. **Trigger:** Jeder Push auf `main` oder Feature-Branches (`arena/**`), sowie Pull Requests.
2. **Cache:** Der `Library/`-Ordner wird gecacht – Folge-Builds sind deutlich schneller.
3. **Build:** `game-ci/unity-builder` kompiliert das Projekt für `Android` (APK).
4. **Artefakt:** Die fertige `.apk` steht im Workflow-Run unter **Artifacts** zum Download bereit (30 Tage Aufbewahrung).

---

## 📁 Projektstruktur

```
Chat/
├── Assets/
│   ├── Scenes/
│   │   └── SampleScene.unity        # Startszene
│   ├── Scripts/
│   │   └── Bootstrap.cs             # Bootstrap-Skript
│   └── Editor/
│       └── BuildScript.cs           # Headless-Build-Helper
├── Packages/
│   └── manifest.json                # Unity Package Manager
├── ProjectSettings/
│   └── ...                          # Unity Project Settings
├── .github/
│   └── workflows/
│       └── build-android.yml        # GameCI Workflow
└── docs/
    └── GAMECI.md                    # Dieses Dokument
```

---

## ⚙️ Anpassungen

### Unity-Version ändern
Im Workflow (`build-android.yml`) bei `unityVersion` die gewünschte Version eintragen.  
**Wichtig:** Die Version muss exakt mit der im Projekt verwendeten übereinstimmen (`ProjectSettings/ProjectVersion.txt`).

### Build-Target wechseln
Für andere Plattformen `targetPlatform` ändern:
- `StandaloneWindows64` – Windows
- `StandaloneOSX` – macOS
- `WebGL` – WebGL
- `iOS` – iOS (benötigt macOS-Runner)

### Custom Build Script
Wenn ihr ein eigenes Build-Script verwendet:
```yaml
with:
  customParameters: -executeMethod BuildScript.BuildAndroid
```

---

## ❓ Troubleshooting

| Problem | Lösung |
|---------|--------|
| `License activation failed` | Secret `UNITY_LICENSE` prüfen – vollständige `.ulf`-Datei inkl. Header/Footer? |
| `Build failed with error` | Unity-Version im Workflow mit Projektversion abgleichen |
| `No APK found` | `buildsPath` und `locationPathName` in `BuildScript.cs` prüfen |
| Cache-Hits funktionieren nicht | Cache-Key prüfen; `Library/` Ordner muss lokal existieren |

---

## 🔗 Nützliche Links

- [GameCI Dokumentation](https://game.ci/)
- [game-ci/unity-builder](https://github.com/game-ci/unity-builder)
- [Unity License Manual](https://license.unity3d.com/manual)
- [Unity Build Target Reference](https://docs.unity3d.com/ScriptReference/BuildTarget.html)
