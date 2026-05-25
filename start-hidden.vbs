Set WshShell = CreateObject("WScript.Shell")
Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\") - 1)
WshShell.CurrentDirectory = scriptDir
WshShell.Run "node -r dotenv/config src\presence.js", 0, False
