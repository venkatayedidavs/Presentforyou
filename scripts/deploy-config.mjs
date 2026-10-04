import path from "node:path"
import { pathToFileURL } from "node:url"

export const REQUIRED_DEPLOY_SETTINGS = [
  "GCP_PROJECT_ID",
  "GCP_REGION",
  "GCP_WORKLOAD_IDENTITY_PROVIDER",
  "GCP_SERVICE_ACCOUNT",
]

export class DeployConfigError extends Error {
  constructor(message, missing = []) {
    super(message)
    this.name = "DeployConfigError"
    this.missing = missing
  }
}

function blank(value) {
  return String(value ?? "").trim()
}

export function resolveDeployConfig(env) {
  const missing = REQUIRED_DEPLOY_SETTINGS.filter((key) => !blank(env[key]))
  if (missing.length > 0) {
    throw new DeployConfigError(
      [
        "Google Cloud is not connected. Nothing was deployed, and there is no live URL.",
        `Missing settings: ${missing.join(", ")}.`,
        "Set them as repository variables in CI. Do not commit them. Project id and region are not secrets.",
        "See docs/deploy-gcp.md.",
      ].join("\n"),
      missing,
    )
  }

  const projectId = blank(env.GCP_PROJECT_ID)
  const region = blank(env.GCP_REGION)
  const workloadIdentityProvider = blank(env.GCP_WORKLOAD_IDENTITY_PROVIDER)
  const serviceAccount = blank(env.GCP_SERVICE_ACCOUNT)
  const problems = []

  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) {
    problems.push(
      "GCP_PROJECT_ID is not a Google Cloud project id (6–30 characters: a letter, then lowercase letters, digits, or hyphens, not ending in a hyphen).",
    )
  }
  if (!/^[a-z]{2,}(?:-[a-z]+)+\d+$/.test(region)) {
    problems.push(
      "GCP_REGION is not a Cloud Run region id. Copy the region id from the Cloud Run locations list.",
    )
  }
  if (
    !/^projects\/[0-9]+\/locations\/global\/workloadIdentityPools\/[a-z0-9-]+\/providers\/[a-z0-9-]+$/.test(
      workloadIdentityProvider,
    )
  ) {
    problems.push(
      "GCP_WORKLOAD_IDENTITY_PROVIDER must be the provider resource name: projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL/providers/PROVIDER.",
    )
  }
  if (
    !/^[a-z][a-z0-9-]{2,30}@[a-z][a-z0-9-]{4,28}[a-z0-9]\.iam\.gserviceaccount\.com$/.test(
      serviceAccount,
    )
  ) {
    problems.push(
      "GCP_SERVICE_ACCOUNT must be the runtime service account email and end in .iam.gserviceaccount.com.",
    )
  }

  if (problems.length > 0) {
    throw new DeployConfigError(
      [
        "Google Cloud settings are present but not usable. Nothing was deployed, and there is no live URL.",
        ...problems,
        "See docs/deploy-gcp.md.",
      ].join("\n"),
    )
  }

  return {
    projectId,
    region,
    workloadIdentityProvider,
    serviceAccount,
    service: "given",
    source: ".",
    allowUnauthenticated: true,
    envVars: {
      REGISTRAR: "mock",
      DATA_DIR: "/tmp/given-data",
    },
  }
}

function main() {
  try {
    const config = resolveDeployConfig(process.env)
    if (process.argv.includes("--json")) {
      process.stdout.write(`${JSON.stringify(config)}\n`)
      return
    }
    process.stdout.write(
      "Cloud Run deploy config is complete for service given. No deploy was run from this check.\n",
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${message}\n`)
    process.exitCode = 1
  }
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ""
if (import.meta.url === entry) main()
