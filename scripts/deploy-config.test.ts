import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { resolveDeployConfig, DeployConfigError } from "./deploy-config.mjs"
import { describe, expect, it } from "vitest"

// Fixture strings for the checker only. They are not a Google Cloud project.
const fixture = {
  GCP_PROJECT_ID: "unit-test-project",
  GCP_REGION: "us-central1",
  GCP_WORKLOAD_IDENTITY_PROVIDER:
    "projects/123456789012/locations/global/workloadIdentityPools/given-ci/providers/github-actions",
  GCP_SERVICE_ACCOUNT: "given-runtime@unit-test-project.iam.gserviceaccount.com",
}

describe("Cloud Run deploy config", () => {
  it("fails closed when every connection setting is missing", () => {
    const env = { ...process.env }
    delete env.GCP_PROJECT_ID
    delete env.GCP_REGION
    delete env.GCP_WORKLOAD_IDENTITY_PROVIDER
    delete env.GCP_SERVICE_ACCOUNT

    const result = spawnSync(process.execPath, ["scripts/deploy-config.mjs"], {
      encoding: "utf8",
      env,
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain("Nothing was deployed")
    expect(result.stderr).toContain("there is no live URL")
    for (const key of [
      "GCP_PROJECT_ID",
      "GCP_REGION",
      "GCP_WORKLOAD_IDENTITY_PROVIDER",
      "GCP_SERVICE_ACCOUNT",
    ]) {
      expect(result.stderr).toContain(key)
    }
    expect(`${result.stdout}${result.stderr}`).not.toMatch(/https?:\/\/\S+/)
    expect(`${result.stdout}${result.stderr}`).not.toContain("run.app")
  })

  it("names only the missing settings", () => {
    expect(() =>
      resolveDeployConfig({
        ...fixture,
        GCP_REGION: " ",
        GCP_SERVICE_ACCOUNT: "",
      }),
    ).toThrow(DeployConfigError)

    try {
      resolveDeployConfig({
        ...fixture,
        GCP_REGION: "",
        GCP_SERVICE_ACCOUNT: "",
      })
    } catch (error) {
      expect(error).toBeInstanceOf(DeployConfigError)
      expect((error as DeployConfigError).missing).toEqual([
        "GCP_REGION",
        "GCP_SERVICE_ACCOUNT",
      ])
      expect((error as Error).message).not.toContain("GCP_PROJECT_ID")
    }
  })

  it("returns Cloud Run args and does not deploy", () => {
    const config = resolveDeployConfig(fixture)
    expect(config).toMatchObject({
      projectId: fixture.GCP_PROJECT_ID,
      region: fixture.GCP_REGION,
      service: "given",
      source: ".",
      allowUnauthenticated: true,
      envVars: { REGISTRAR: "mock" },
    })
    expect(config).not.toHaveProperty("url")
    expect(JSON.stringify(config)).not.toContain("run.app")
  })

  it("rejects a malformed project id without deploying", () => {
    expect(() =>
      resolveDeployConfig({ ...fixture, GCP_PROJECT_ID: "Not A Project" }),
    ).toThrow(/GCP_PROJECT_ID/)
  })

  it("wires the workflow to fail before authentication or deploy", () => {
    const workflow = readFileSync(".github/workflows/deploy.yml", "utf8")
    const dockerfile = readFileSync("Dockerfile", "utf8")
    const checkAt = workflow.indexOf("scripts/deploy-config.mjs")
    const authAt = workflow.indexOf("google-github-actions/auth")
    const deployAt = workflow.indexOf("google-github-actions/deploy-cloudrun")

    expect(checkAt).toBeGreaterThan(-1)
    expect(authAt).toBeGreaterThan(checkAt)
    expect(deployAt).toBeGreaterThan(authAt)
    expect(workflow).not.toMatch(/project_id:\s*[a-z0-9][a-z0-9-]+/)
    expect(workflow).not.toMatch(/[a-z0-9-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com/)
    expect(dockerfile).toContain("HOSTNAME=0.0.0.0")
    expect(dockerfile).toContain("PORT=8080")
    expect(dockerfile).not.toMatch(/GCP_PROJECT_ID=/)
  })
})
