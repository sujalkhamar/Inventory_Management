# 🗄️ MongoDB Database Setup Guide

This application requires MongoDB to store Users, Products, and Sales data. You can either run MongoDB **locally** on your computer, or use **MongoDB Atlas** (a free cloud database).

Choose **one** of the methods below:

---

## Method 1: Using MongoDB Atlas (Recommended & Easiest)

MongoDB Atlas hosts your database in the cloud. It's free, requires no local installation, and is ready for production.

### Step 1: Create an Account & Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and sign up.
2. Create a **New Project** (you can name it "InventoryProject").
3. Click **Build a Database** and choose the **FREE (Shared)** cluster option.
4. Select a provider (AWS/Google) and a region close to you. Click **Create Cluster**.

### Step 2: Set Up Database Access (Username/Password)
1. In the "Quickstart" or "Security" menu on the left, go to **Database Access**.
2. Click **Add New Database User**.
3. Choose "Password" as the authentication method.
4. Enter a username (e.g., `admin`) and a secure password. 
5. **Important:** Copy this password, you will need it soon! Click **Add User**.

### Step 3: Set Up Network Access (IP Whitelist)
1. On the left sidebar, go to **Network Access**.
2. Click **Add IP Address**.
3. Click **Allow Access from Anywhere** (this adds `0.0.0.0/0`).
4. Click **Confirm**.

### Step 4: Get Your Connection String
1. On the left sidebar, go to **Database** (under Deployments).
2. Click the **Connect** button on your cluster.
3. Click **Drivers** (or "Connect your application").
4. Copy the connection string provided. It will look something like this:
   `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Step 5: Connect Your App
1. Open the `backend/.env` file in your code editor.
2. Replace `<password>` with the password you created in Step 2.
3. Change the text right after `.net/` and before `?` to the name you want for your database (e.g., `inventory_db`).
4. Set the `MONGO_URI` variable:
   ```env
   MONGO_URI=mongodb+srv://admin:MySecretPassword123@cluster0.xxxxx.mongodb.net/inventory_db?retryWrites=true&w=majority
   ```
5. Start your server (`npm run dev`). If it says `MongoDB Connected`, you are good to go!

---

## Method 2: Using MongoDB Locally (For Offline Dev)

If you prefer to keep your data stored directly on your computer's hard drive without using the internet.

### Step 1: Install MongoDB Compass & Server
1. Download [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Install it. During installation, make sure **"Install MongoDB Compass"** is checked. (Compass is a visual GUI for viewing your database).

### Step 2: Start MongoDB
1. Depending on your OS, MongoDB usually runs automatically as a background service after installation.
2. Open **MongoDB Compass**.
3. It will show a default connection string: `mongodb://localhost:27017`. Click **Connect**.

### Step 3: Connect Your App
1. Open the `backend/.env` file in your code editor.
2. Set the `MONGO_URI` variable to your local connection string, followed by the database name:
   ```env
   MONGO_URI=mongodb://localhost:27017/inventory_db
   ```
3. Start your server (`npm run dev`). If it says `MongoDB Connected`, you are good to go! 
*(The database `inventory_db` will be created automatically the first time you save a user or product).*

---

## Troubleshooting

- **"MongoTimeoutError" or "bad auth"**: This means your Atlas username or password in the `MONGO_URI` is incorrect. Double-check them. Note that your database username/password is *different* from your Atlas website login credentials.
- **IP Address Error**: If using Atlas on a strict network (like a university or corporate VPN), your IP might be blocked. Go to Network Access in Atlas and make sure `0.0.0.0/0` is active.
