# Connect Given to Google Cloud

Nothing is deployed. There is no live URL.

## What is in the repo, and why

Given runs as a container on Cloud Run. The container listens on `0.0.0.0` and on the `PORT` Cloud Run sets (the image defaults that port to 8080). Checkout, the mock registrar, and the published sites are the same app.

The pipeline is `.github/workflows/deploy.yml`, the image is `Dockerfile`, and `scripts/deploy-config.mjs` is the gate in front of deploy.

This repository is an unpublished Cursor Origin draft. Origin does not run GitHub Actions. A push here does not deploy, and adding the workflow file does not create a running service. The workflow is the pipeline a GitHub Actions runner will execute once this project is connected to a CI host that runs it. Do not put a project id, a service-account key, or any other credential in the repo.

Authentication is keyless. The workflow uses Workload Identity Federation (OIDC). It does not use a long-lived JSON key.

The deploy job's first step runs `node scripts/deploy-config.mjs`. If any required setting is missing or malformed, that step exits with an error that names the setting, and the authenticate and deploy steps do not run.

## What you set once

Set these as repository variables on the CI host. Do not commit them. Project id and region are not secrets. The workload identity provider resource name and the service account email are not secret keys either; they stay out of git because they name your project.

| Variable | What to put |
| --- | --- |
| `GCP_PROJECT_ID` | The project id of the Google Cloud project you create or choose. |
| `GCP_REGION` | The Cloud Run region id you choose. Copy it from the Cloud Run locations list. Region ids look like `us-central1`. |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | The full provider resource name. |
| `GCP_SERVICE_ACCOUNT` | The email of the service account below. |

Version 1 uses that one service account for both jobs: GitHub Actions impersonates it to deploy, and Cloud Run runs the service as that same account.

## Steps in Google Cloud

1. Create or choose a project. Copy its project id from the project picker in the console. Leave the id out of this repo.
2. Choose a Cloud Run region and copy its region id.
3. Enable the APIs the pipeline calls. Replace the project flag with your project id when you run this:

   ```bash
   gcloud services enable \
     run.googleapis.com \
     artifactregistry.googleapis.com \
     cloudbuild.googleapis.com \
     iamcredentials.googleapis.com \
     iam.googleapis.com \
     --project=YOUR_PROJECT_ID
   ```

4. Create a service account with id `given-runtime`. Copy its email (`given-runtime@YOUR_PROJECT_ID.iam.gserviceaccount.com`). Grant that account:
   - Cloud Run Admin (`roles/run.admin`)
   - Service Account User (`roles/iam.serviceAccountUser`) on itself
   - Artifact Registry Writer (`roles/artifactregistry.writer`)
   - Cloud Build Editor (`roles/cloudbuild.builds.editor`)
   - Storage Admin (`roles/storage.admin`), which Cloud Build needs to upload the source
5. Create a Workload Identity Pool with id `given-ci`.
6. Add an OIDC provider with id `github-actions`.
   - Issuer: `https://token.actions.githubusercontent.com`
   - Attribute mapping: `google.subject` = `assertion.sub`, and `attribute.repository` = `assertion.repository`
   - When GitHub Actions is connected, restrict the provider to that repository. Until then there is no repository for the condition to trust, and nothing deploys.
7. Allow that provider to impersonate `given-runtime` with `roles/iam.workloadIdentityUser` on the service account. The member is:

   ```text
   principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/given-ci/attribute.repository/OWNER/REPO
   ```

   `PROJECT_NUMBER` is the number of your project, not the project id. `OWNER/REPO` is the GitHub repository that will run the workflow, once that exists.
8. Copy the provider resource name. It has this shape:

   ```text
   projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/given-ci/providers/github-actions
   ```

9. On the CI repository, create the four variables listed above. Do not create a JSON key.

## What a later push does

The workflow listens for pushes to `main`. It runs the tests, then the connection check, then keyless auth, then Cloud Run deploy of service `given` from the `Dockerfile`. The service is public (`--allow-unauthenticated`) and runs with `REGISTRAR=mock`.

Registrations on Cloud Run are written under `/tmp/given-data`. That disk is ephemeral. It is enough for this version's mock; it is not a database.

If you want to see the closed failure before any of this is set, run:

```bash
node scripts/deploy-config.mjs
```

That command exits 1, names the missing settings, and does not deploy. There is still no live URL.
