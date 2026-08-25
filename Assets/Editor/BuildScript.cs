using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEngine;

/// <summary>
/// Headless build helper – invoked by GameCI to produce the APK.
/// Can also be run manually:
///   unity -quit -batchmode -executeMethod BuildScript.BuildAndroid
/// </summary>
public static class BuildScript
{
    [MenuItem("Build/Android APK")]
    public static void BuildAndroid()
    {
        var scenes = new[] { "Assets/Scenes/SampleScene.unity" };
        var options = new BuildPlayerOptions
        {
            scenes = scenes,
            locationPathName = "build/Chat.apk",
            target = BuildTarget.Android,
            options = BuildOptions.None
        };

        var report = BuildPipeline.BuildPlayer(options);
        if (report.summary.result == BuildResult.Succeeded)
            Debug.Log("[Build] Android build succeeded: " + report.summary.outputPath);
        else
            Debug.LogError("[Build] Android build failed: " + report.summary.result);
    }
}
