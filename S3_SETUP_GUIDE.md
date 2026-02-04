# Save Images to AWS S3 – Step-by-Step Guide

This guide walks you through setting up AWS S3 so your app can save vehicle photos, weight record photos, moisture photos, and expense receipts.

---

## Part 1: Create AWS S3 Bucket

### Step 1.1 – Log in to AWS
1. Go to [https://console.aws.amazon.com](https://console.aws.amazon.com)
2. Sign in with your AWS account

### Step 1.2 – Create bucket
1. Search for **S3** in the top search bar → open **S3**
2. Click **Create bucket**
3. Fill in:
   - **Bucket name:** `biochar-photos-yourcompany` (must be globally unique, e.g. `biochar-photos-acme-2024`)
   - **Region:** e.g. `us-east-1` (keep this for later)
4. **Block Public Access:**  
   - Uncheck **Block all public access**  
   - Confirm in the warning checkbox
5. Click **Create bucket**

### Step 1.3 – Allow public read (for viewing photos)
1. Open your new bucket → **Permissions**
2. Under **Bucket policy**, click **Edit**
3. Paste (replace `YOUR-BUCKET-NAME` with your bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

4. Click **Save changes**

### Step 1.4 – CORS (for browser uploads)
1. In your bucket → **Permissions**
2. Scroll to **Cross-origin resource sharing (CORS)**
3. Click **Edit** and paste:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

4. Click **Save changes**

---

## Part 2: Create IAM User for S3 Access

### Step 2.1 – Create user
1. Search for **IAM** in AWS Console → open **IAM**
2. Go to **Users** → **Create user**
3. **User name:** `biochar-s3-uploader`
4. Click **Next**

### Step 2.2 – Attach policy
1. Choose **Attach policies directly**
2. Click **Create policy** (opens new tab)
3. Choose **JSON** and paste (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

4. Click **Next** → Name: `BiocharS3Upload` → **Create policy**
5. Go back to the user creation tab, refresh policies, search for `BiocharS3Upload`, select it
6. Click **Next** → **Create user**

### Step 2.3 – Create access keys
1. Open the user `biochar-s3-uploader`
2. **Security credentials** → **Access keys** → **Create access key**
3. Use **Application running outside AWS** → **Next** → **Create access key**
4. Copy and save:
   - **Access key ID** (e.g. `AKIA...`)
   - **Secret access key** (shown once; save it somewhere safe)

---

## Part 3: Configure the App

### Step 3.1 – Local (.env.local)

Add to `.env.local`:

```
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxx
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key_here
VITE_S3_BUCKET_NAME=biochar-photos-yourcompany
```

Replace with your real values and bucket name.

### Step 3.2 – Railway (Frontend)

For `sowandreapchara-frontend`:

1. Railway → **sowandreapchara-frontend** → **Variables**
2. Add:

| Variable | Value |
|----------|-------|
| `VITE_AWS_REGION` | `us-east-1` |
| `VITE_AWS_ACCESS_KEY_ID` | your Access Key ID |
| `VITE_AWS_SECRET_ACCESS_KEY` | your Secret Access Key |
| `VITE_S3_BUCKET_NAME` | your bucket name |

3. Save and redeploy frontend

---

## Part 4: Wire Up S3 Upload (Current State)

Your app already has:
- `src/services/s3Service.ts` – upload helpers
- Frontend can use `uploadVehiclePhotos`, `uploadWeightPhoto`, `uploadMoisturePhoto`

The app currently sends photo data (base64) directly to the API and stores it in the database. To switch to S3:

1. **Before submit:** Upload each photo with `s3Service` and get the returned URL
2. **Submit:** Send these URLs to the API instead of base64
3. **API:** Store the S3 URLs in the database

If you want, the next step is to add this wiring in:
- Raw Biomass Procurement (vehicle + weight photos)
- Expenses (receipt)
- Moisture photos (if used)

---

## Part 5: Security Note

Using `VITE_AWS_*` exposes credentials in the browser. Safer options:

1. **Presigned URLs:** API generates a temporary upload URL; frontend uploads directly to S3 without exposing credentials
2. **Backend upload:** Frontend sends base64 to API; API uploads to S3 and saves the URL

Both require server-side changes but are more secure.

---

## Quick Checklist

- [ ] S3 bucket created
- [ ] Bucket policy allows public read
- [ ] CORS configured
- [ ] IAM user created with S3 policy
- [ ] Access keys saved
- [ ] Env vars set in `.env.local` and Railway frontend
- [ ] Frontend wired to use `s3Service` before submit (if desired)

---

## Folder structure in S3

Photos will be stored as:
- `vehicle-photos/` – vehicle images
- `weight-photos/` – weight record photos
- `moisture-photos/` – moisture photos  
- `receipts/` – expense receipts (if implemented)
