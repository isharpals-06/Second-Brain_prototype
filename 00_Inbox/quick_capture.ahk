#NoEnv
SendMode Input
SetWorkingDir %A_ScriptDir%

; AutoHotkey script for J.A.R.V.I.S. (A.R.C.) Quick Capture
; Press Ctrl + Alt + Space to summon the ingestion bar.

^!Space::
InputBox, CaptureText, A.R.C. Quick Ingestion, Enter your quick note/thought to append to the neural inbox:, , 560, 150
if ErrorLevel
    return
if (CaptureText = "")
    return

; Resolve absolute path to the inbox file
InboxFile := "C:\Users\ishar\projects\secondbrain\00_Inbox\quick_capture.md"

FormatTime, CurrentTime, , yyyy-MM-dd HH:mm:ss
FileAppend, `n`n### Capture [%CurrentTime%]`n%CaptureText%`n, %InboxFile%, UTF-8

; Audio cue
SoundPlay, *64
return
