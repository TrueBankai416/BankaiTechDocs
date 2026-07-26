# Disable-GDID-Tracking.ps1
# Run directly or right-click -> Run with PowerShell. Self-elevates via UAC if needed.

param([switch]$Enforce, [switch]$RefreshFW)

Set-ExecutionPolicy Bypass -Scope Process -Force

$script:BlockedDomains   = "dds.microsoft.com", "fd.dds.microsoft.com", "aad.cs.dds.microsoft.com", "cdpcs.access.microsoft.com", "activity.windows.com"
$script:FirewallRuleName = "Block-GDID-Telemetry"
$script:TaskName         = "GDID-Telemetry-Enforcement"
$script:FwTaskName       = "GDID-Firewall-Refresh"
$script:EnforcePath      = "$env:ProgramData\GDIDBlock"
$script:ScriptDest       = "$script:EnforcePath\Disable-GDID-Tracking.ps1"
# Capture script path at module scope; $PSCommandPath is empty when run as selected text
$script:RunningPath      = if ($PSCommandPath) { $PSCommandPath } elseif ($MyInvocation.MyCommand.Path) { $MyInvocation.MyCommand.Path } else { $null }

function Test-Elevation {
    $principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $principal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

function Get-CurrentGDID {
    try {
        $hex = (Get-ItemProperty "HKCU:\SOFTWARE\Microsoft\IdentityCRL\ExtendedProperties" -Name "LID" -ErrorAction Stop).LID
        $decimal = [Convert]::ToUInt64($hex, 16)
        return "g:$decimal (hex $hex)"
    } catch {
        return $null
    }
}

function Show-Status {
    Write-Host ""
    Write-Host "=== GDID / Identity Registration Status ===" -ForegroundColor Cyan

    $gdid = Get-CurrentGDID
    if ($gdid) {
        Write-Host "Current GDID:              $gdid" -ForegroundColor Yellow
    } else {
        Write-Host "Current GDID:              not present"
    }

    $cdpSvc = Get-Service "CDPSvc" -ErrorAction SilentlyContinue
    Write-Host "CDPSvc:                    $(if ($cdpSvc) { "$($cdpSvc.Status) / StartType=$($cdpSvc.StartType)" } else { "not found" })"

    $cdpTemplate = Get-Service "CDPUserSvc" -ErrorAction SilentlyContinue
    Write-Host "CDPUserSvc (template):     $(if ($cdpTemplate) { "$($cdpTemplate.Status) / StartType=$($cdpTemplate.StartType)" } else { "not found" })"
    $cdpUserSvc = Get-Service "CDPUserSvc_*" -ErrorAction SilentlyContinue
    if ($cdpUserSvc) {
        foreach ($svc in $cdpUserSvc) {
            Write-Host "$($svc.Name):$(' ' * [Math]::Max(1, 22 - $svc.Name.Length))$($svc.Status) (instance - startup controlled by template)"
        }
    }

    $wlidsvc = Get-Service "wlidsvc" -ErrorAction SilentlyContinue
    Write-Host "wlidsvc:                   $(if ($wlidsvc) { "$($wlidsvc.Status) / StartType=$($wlidsvc.StartType)" } else { "not found" })"

    $policyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System"
    $activityFeed = (Get-ItemProperty $policyPath -Name "EnableActivityFeed" -ErrorAction SilentlyContinue).EnableActivityFeed
    Write-Host "Activity Feed policy:      $(if ($null -ne $activityFeed) { "EnableActivityFeed=$activityFeed" } else { "not configured" })"

    $identityStore = Test-Path "HKLM:\SOFTWARE\Microsoft\IdentityStore"
    Write-Host "HKLM IdentityStore:        $(if ($identityStore) { "present" } else { "absent" })"

    $negativeCache = Test-Path "HKLM:\SOFTWARE\Microsoft\IdentityCRL\NegativeCache"
    Write-Host "HKLM NegativeCache:        $(if ($negativeCache) { "present" } else { "absent" })"

    $cdpCache = Test-Path "$env:LOCALAPPDATA\ConnectedDevicesPlatform"
    Write-Host "Local CDP cache folder:    $(if ($cdpCache) { "present" } else { "absent" })"

    $hostsPath = "$env:WINDIR\System32\drivers\etc\hosts"
    $hostsContent = Get-Content $hostsPath -ErrorAction SilentlyContinue
    $blockedCount = 0
    foreach ($domain in $script:BlockedDomains) {
        if ($hostsContent -match "^(0\.0\.0\.0|::0)\s+$([regex]::Escape($domain))\s*$") { $blockedCount++ }
    }
    Write-Host "Hosts file blocking:       $blockedCount / $($script:BlockedDomains.Count) endpoints blocked"

    $fwRule = Get-NetFirewallRule -DisplayName $script:FirewallRuleName -ErrorAction SilentlyContinue
    Write-Host "Firewall rule:             $(if ($fwRule) { "present ($($fwRule.Action), Enabled=$($fwRule.Enabled))" } else { "absent" })"

    $enforceTask = Get-ScheduledTask -TaskName $script:TaskName -ErrorAction SilentlyContinue
    Write-Host "Persistence task:          $(if ($enforceTask) { "installed (State=$($enforceTask.State))" } else { "not installed" })"
    Write-Host ""
}

function Block-EndpointsInHosts {
    Write-Host "[INFO] Forcing hosts file block entries"
    $hostsPath = "$env:WINDIR\System32\drivers\etc\hosts"

    # Clear read-only flag if set
    $hostsFile = Get-Item $hostsPath -ErrorAction SilentlyContinue
    if ($hostsFile -and $hostsFile.IsReadOnly) {
        $hostsFile.IsReadOnly = $false
        Write-Host "[INFO] Cleared read-only flag on hosts file"
    }

    $hostsLines = Get-Content $hostsPath -ErrorAction SilentlyContinue
    $newLines = [System.Text.StringBuilder]::new()
    $added = 0

    foreach ($domain in $script:BlockedDomains) {
        $pattern = "^(0\.0\.0\.0|::0)\s+$([regex]::Escape($domain))\s*$"
        if (-not ($hostsLines -match $pattern)) {
            $null = $newLines.AppendLine("0.0.0.0 $domain")
            $null = $newLines.AppendLine("::0 $domain")
            $added++
        }
    }

    if ($newLines.Length -gt 0) {
        try {
            # Use a temp file + copy to sidestep AV file locks on hosts
            $tmp = [System.IO.Path]::GetTempFileName()
            [System.IO.File]::WriteAllText($tmp, ($hostsLines -join "`r`n") + "`r`n" + $newLines.ToString())
            Copy-Item -Path $tmp -Destination $hostsPath -Force -ErrorAction Stop
            Remove-Item $tmp -Force -ErrorAction SilentlyContinue
            Write-Host "[INFO] Hosts file: added $added domain(s)"
        } catch {
            Write-Host "[WARN] Could not write to hosts file: $_" -ForegroundColor Yellow
            Write-Host "[WARN] If Tamper Protection is ON, disable it temporarily in Windows Security > Virus & threat protection settings." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[INFO] Hosts file: all domains already blocked"
    }
}

function Block-EndpointsInFirewall {
    Write-Host "[INFO] Forcing firewall block rule"
    Remove-NetFirewallRule -DisplayName $script:FirewallRuleName -ErrorAction SilentlyContinue

    $resolvedAddresses = @(foreach ($domain in $script:BlockedDomains) {
        Resolve-DnsName -Name $domain -Type A -ErrorAction SilentlyContinue |
            Where-Object { $_.Type -eq "A" } |
            Select-Object -ExpandProperty IPAddress
        Resolve-DnsName -Name $domain -Type AAAA -ErrorAction SilentlyContinue |
            Where-Object { $_.Type -eq "AAAA" } |
            Select-Object -ExpandProperty IPAddress
    }) | Select-Object -Unique

    if ($resolvedAddresses) {
        New-NetFirewallRule -DisplayName $script:FirewallRuleName `
            -Direction Outbound `
            -Action Block `
            -RemoteAddress $resolvedAddresses `
            -Profile Any `
            -Enabled True `
            -ErrorAction SilentlyContinue | Out-Null
    }
}

function Unblock-Endpoints {
    Write-Host ""
    Write-Host "[INFO] Removing network blocks (Hosts & Firewall)..." -ForegroundColor Cyan

    # Remove hosts file entries
    $hostsPath = "$env:WINDIR\System32\drivers\etc\hosts"
    if (Test-Path $hostsPath) {
        $hostsContent = Get-Content $hostsPath -ErrorAction SilentlyContinue
        $filteredContent = $hostsContent | Where-Object {
            $line = $_
            $isBlocked = $false
            foreach ($domain in $script:BlockedDomains) {
                if ($line -match [regex]::Escape($domain)) { $isBlocked = $true; break }
            }
            -not $isBlocked
        }
        try {
            $tmp = [System.IO.Path]::GetTempFileName()
            [System.IO.File]::WriteAllLines($tmp, $filteredContent)
            Copy-Item -Path $tmp -Destination $hostsPath -Force -ErrorAction Stop
            Remove-Item $tmp -Force -ErrorAction SilentlyContinue
            Write-Host "[INFO] Cleaned domain entries from hosts file."
        } catch {
            Write-Host "[WARN] Could not clean hosts file: $_" -ForegroundColor Yellow
        }
    }

    # Remove firewall rule
    Remove-NetFirewallRule -DisplayName $script:FirewallRuleName -ErrorAction SilentlyContinue
    Write-Host "[INFO] Removed firewall rule: $script:FirewallRuleName"
    Write-Host "[INFO] Network endpoints unblocked." -ForegroundColor Green
    Write-Host ""
}

function Install-PersistenceTask {
    Write-Host "[INFO] Installing persistence scheduled tasks"
    New-Item $script:EnforcePath -ItemType Directory -Force | Out-Null

    # Copy this script to a stable path so the scheduled tasks always find it
    if ($script:RunningPath) {
        Copy-Item -Path $script:RunningPath -Destination $script:ScriptDest -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host "[WARN] Script path could not be determined (run as file, not pasted text)." -ForegroundColor Yellow
        Write-Host "[WARN] Manually copy this script to $script:ScriptDest for the scheduled tasks to work." -ForegroundColor Yellow
    }

    $ps    = "powershell.exe"
    $flags = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $script:ScriptDest + '"'
    $prin  = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $cfg   = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 5) -MultipleInstances IgnoreNew -Hidden -StartWhenAvailable

    $action  = New-ScheduledTaskAction -Execute $ps -Argument "$flags -Enforce"
    $trigger = New-ScheduledTaskTrigger -AtStartup
    Register-ScheduledTask -TaskName $script:TaskName -Action $action -Trigger $trigger -Principal $prin -Settings $cfg -Force -ErrorAction SilentlyContinue | Out-Null
    Write-Host "[INFO] Startup enforcement task installed: $script:TaskName"

    $fwAction  = New-ScheduledTaskAction -Execute $ps -Argument "$flags -RefreshFW"
    $fwTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "03:00"
    Register-ScheduledTask -TaskName $script:FwTaskName -Action $fwAction -Trigger $fwTrigger -Principal $prin -Settings $cfg -Force -ErrorAction SilentlyContinue | Out-Null
    Write-Host "[INFO] Weekly firewall refresh task installed: $script:FwTaskName"
}

function Remove-PersistenceTask {
    Write-Host "[INFO] Removing persistence scheduled tasks"
    Unregister-ScheduledTask -TaskName $script:TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $script:FwTaskName -Confirm:$false -ErrorAction SilentlyContinue
    Remove-Item $script:EnforcePath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "[INFO] Persistence tasks and scripts removed"
}

function New-LocalAccountPrompt {
    Write-Host ""
    Write-Host "[RECOMMENDED] Blocking Microsoft identity services may disrupt Microsoft" -ForegroundColor Cyan
    Write-Host "              account logins. A local administrator account ensures you" -ForegroundColor Cyan
    Write-Host "              can always log in regardless of network or service state." -ForegroundColor Cyan
    Write-Host ""
    $response = Read-Host "Create a local administrator account now? (Y/N)"
    if ($response -notmatch '^[Yy]') {
        Write-Host "[INFO] Skipping local account creation."
        return
    }

    $username = Read-Host "Username"
    if ([string]::IsNullOrWhiteSpace($username)) {
        Write-Host "[WARN] No username entered. Skipping local account creation." -ForegroundColor Yellow
        return
    }

    $password = Read-Host "Password" -AsSecureString
    $confirm  = Read-Host "Confirm password" -AsSecureString

    $b1 = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $b2 = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($confirm)
    $match = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($b1) -eq `
             [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($b2)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b1)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b2)

    if (-not $match) {
        Write-Host "[WARN] Passwords do not match. Skipping local account creation." -ForegroundColor Yellow
        return
    }

    try {
        New-LocalUser -Name $username -Password $password -FullName $username `
            -Description "Local admin - created by GDID remediation tool" -ErrorAction Stop
        Add-LocalGroupMember -Group "Administrators" -Member $username -ErrorAction Stop
        Write-Host "[INFO] Local administrator account '$username' created successfully." -ForegroundColor Green
    } catch {
        Write-Host "[WARN] Could not create local account: $_" -ForegroundColor Yellow
    }
}

function Invoke-Remediation {
    Write-Host ""
    Write-Host "[INFO] Starting GDID remediation" -ForegroundColor Cyan

    New-LocalAccountPrompt
    Write-Host ""

    $gdid = Get-CurrentGDID
    if ($gdid) {
        Write-Host "[INFO] GDID prior to remediation: $gdid"
    } else {
        Write-Host "[INFO] No LID entry found under HKCU - device is either unregistered or already remediated"
    }

    Write-Host "[INFO] Disabling Connected Devices Platform services (CDPSvc, CDPUserSvc)"
    Stop-Service "CDPSvc" -Force -ErrorAction SilentlyContinue
    try {
        Set-Service "CDPSvc" -StartupType Disabled -ErrorAction Stop
        Write-Host "[INFO] Service disabled: CDPSvc"
    } catch {
        Write-Host "[WARN] Could not disable CDPSvc: $_" -ForegroundColor Yellow
    }
    Get-Service "CDPUserSvc_*" -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Service $_.Name -Force -ErrorAction SilentlyContinue
        Write-Host "[INFO] Instance stopped: $($_.Name)"
    }
    # Disable the template service - instances inherit startup type from the template
    $scResult = sc.exe config CDPUserSvc start= disabled 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[INFO] CDPUserSvc template disabled"
    } else {
        Write-Host "[WARN] Could not disable CDPUserSvc template: $scResult" -ForegroundColor Yellow
    }

    Write-Host "[INFO] Disabling Activity Feed / Activity History"
    New-Item "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Force | Out-Null
    New-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "EnableActivityFeed" -Value 0 -PropertyType DWord -Force | Out-Null
    New-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "PublishUserActivities" -Value 0 -PropertyType DWord -Force | Out-Null
    New-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System" -Name "UploadUserActivities" -Value 0 -PropertyType DWord -Force | Out-Null

    Write-Host "[INFO] Removing residual Device PUID / Device Id registry entries"
    Remove-ItemProperty "HKCU:\SOFTWARE\Microsoft\IdentityCRL\ExtendedProperties" -Name "LID" -ErrorAction SilentlyContinue

    if (Test-Path "HKCU:\SOFTWARE\Microsoft\IdentityCRL\Immersive\production\Token") {
        Get-ChildItem "HKCU:\SOFTWARE\Microsoft\IdentityCRL\Immersive\production\Token" -ErrorAction SilentlyContinue | ForEach-Object {
            Remove-ItemProperty $_.PsPath -Name "DeviceId" -ErrorAction SilentlyContinue
        }
    }

    # HKLM IdentityStore is owned by TrustedInstaller and cannot be removed by admin processes.
    # Its presence does not affect telemetry blocking; skipping.
    Write-Host "[INFO] HKLM IdentityStore: skipped (TrustedInstaller-owned, does not affect blocking)"
    Remove-Item "HKLM:\SOFTWARE\Microsoft\IdentityCRL\NegativeCache" -Recurse -Force -ErrorAction SilentlyContinue

    Remove-Item "$env:LOCALAPPDATA\ConnectedDevicesPlatform" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "[INFO] Local Connected Devices Platform cache purged"

    Block-EndpointsInFirewall
    Block-EndpointsInHosts

    Write-Host "[INFO] Disabling Microsoft Account Sign-in Assistant service (wlidsvc)"
    Stop-Service "wlidsvc" -Force -ErrorAction SilentlyContinue
    Set-Service "wlidsvc" -StartupType Disabled -ErrorAction SilentlyContinue

    Install-PersistenceTask

    Write-Host "[INFO] Remediation complete. All identity registration services disabled, endpoints blocked, residual state cleared." -ForegroundColor Green
    Write-Host ""
}

function Invoke-Rollback {
    Write-Host ""
    Write-Host "[INFO] Starting full rollback to default settings..." -ForegroundColor Cyan

    # 1. Unblock network
    Unblock-Endpoints

    # 2. Restore services
    Write-Host "[INFO] Restoring services (CDPSvc, CDPUserSvc, wlidsvc)..."
    Set-Service "CDPSvc" -StartupType Automatic -ErrorAction SilentlyContinue
    Start-Service "CDPSvc" -ErrorAction SilentlyContinue

    # Note: CDPUserSvc* default is Automatic (Trigger Start). Restore the template;
    # instances are managed by Windows automatically on user session events.
    sc.exe config CDPUserSvc start= auto | Out-Null
    Write-Host "[INFO] CDPUserSvc template restored to Automatic"
    Get-Service "CDPUserSvc_*" -ErrorAction SilentlyContinue | ForEach-Object {
        Start-Service $_.Name -ErrorAction SilentlyContinue
        Write-Host "[INFO] Instance started: $($_.Name)"
    }

    Set-Service "wlidsvc" -StartupType Manual -ErrorAction SilentlyContinue
    Start-Service "wlidsvc" -ErrorAction SilentlyContinue

    # 3. Remove Activity Feed restriction policies
    Write-Host "[INFO] Removing Activity Feed registry restriction policies..."
    $policyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System"
    Remove-ItemProperty $policyPath -Name "EnableActivityFeed" -ErrorAction SilentlyContinue
    Remove-ItemProperty $policyPath -Name "PublishUserActivities" -ErrorAction SilentlyContinue
    Remove-ItemProperty $policyPath -Name "UploadUserActivities" -ErrorAction SilentlyContinue

    Remove-PersistenceTask

    Write-Host "[INFO] Full rollback complete. Services re-enabled and restrictions removed." -ForegroundColor Green
    Write-Host ""
}

# Enforcement and firewall-refresh modes run silently from scheduled tasks (SYSTEM, no UI)
if ($Enforce) {
    Stop-Service "CDPSvc" -Force -ErrorAction SilentlyContinue
    Stop-Service "wlidsvc" -Force -ErrorAction SilentlyContinue
    Set-Service "CDPSvc" -StartupType Disabled -ErrorAction SilentlyContinue
    Set-Service "wlidsvc" -StartupType Disabled -ErrorAction SilentlyContinue
    sc.exe config CDPUserSvc start= disabled | Out-Null
    Get-Service "CDPUserSvc_*" -ErrorAction SilentlyContinue | Stop-Service -Force -ErrorAction SilentlyContinue
    $p = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\System"
    New-Item $p -Force | Out-Null
    @("EnableActivityFeed", "PublishUserActivities", "UploadUserActivities") | ForEach-Object {
        Set-ItemProperty $p -Name $_ -Value 0 -Type DWord -Force -ErrorAction SilentlyContinue
    }
    exit 0
}

if ($RefreshFW) {
    Block-EndpointsInFirewall
    exit 0
}

if (-not (Test-Elevation)) {
    if (-not $script:RunningPath) {
        Write-Host "[ERROR] Cannot self-elevate: script path is unknown." -ForegroundColor Red
        Write-Host "        Right-click the .ps1 file and choose 'Run with PowerShell'." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "[INFO] Not elevated - launching elevated window via UAC..." -ForegroundColor Yellow
    Write-Host "[INFO] This window will close. Accept the UAC prompt to continue." -ForegroundColor Yellow
    Start-Process PowerShell -Verb RunAs -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $script:RunningPath)
    exit
}

do {
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host "  GDID / Device PUID Remediation Tool" -ForegroundColor Cyan
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host "  1. Disable GDID / Telemetry"
    Write-Host "  2. Full Rollback (Restore defaults)"
    Write-Host "  3. Unblock network endpoints only"
    Write-Host "  4. Check status"
    Write-Host "  5. Exit"
    Write-Host ""
    $choice = Read-Host "Select an option (1-5)"

    switch ($choice) {
        "1" { Invoke-Remediation }
        "2" { Invoke-Rollback }
        "3" { Unblock-Endpoints }
        "4" { Show-Status }
        "5" { Write-Host "Exiting." }
        default { Write-Host "[WARN] Invalid selection." -ForegroundColor Yellow }
    }
} while ($choice -ne "5")