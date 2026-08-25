using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Simple bootstrap script – shows a welcome message on screen.
/// </summary>
public class Bootstrap : MonoBehaviour
{
    private GameObject _canvas;
    private Text _label;

    void Start()
    {
        Debug.Log("[Bootstrap] Chat app started successfully.");
    }

    void Update()
    {
        // placeholder game-loop
    }
}
