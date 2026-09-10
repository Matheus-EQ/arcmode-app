$ErrorActionPreference = "Stop"

$nodePath = Join-Path $HOME ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
$pnpm = Join-Path $HOME ".cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"
$env:PATH = "$nodePath;$env:PATH"

$projectName = Read-Host "Nome do projeto Cloudflare Pages (ex: neurosync-rpg)"
if ([string]::IsNullOrWhiteSpace($projectName)) {
  $projectName = "neurosync-rpg"
}

$accountId = Read-Host "Cloudflare Account ID"
$token = Read-Host "Cloudflare API Token" -AsSecureString
$plainToken = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
)

$env:CLOUDFLARE_ACCOUNT_ID = $accountId
$env:CLOUDFLARE_API_TOKEN = $plainToken

& $pnpm build
& $pnpm dlx wrangler pages deploy dist --project-name $projectName

$env:CLOUDFLARE_API_TOKEN = ""
