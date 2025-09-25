# LiveKit SIP Integration Project

This project integrates LiveKit with SIP telephony using FreeSWITCH, enabling real-time voice communication through web browsers.

## 🔧 Prerequisites

- Docker & Docker Compose
- Node.js (version 20.19+ or 22.12+ for Vite compatibility)
- npm
- API testing tool (Insomnia/Postman)

## 📋 Setup Instructions

### 1. Configure SIP Profile

Add the `genesys.xml` file to the FreeSWITCH configuration:

```bash
# Place the genesys.xml file in the following directory:
/conf/sip_profiles/external/genesys.xml
```

> ⚠️ **SECURITY WARNING**: The `genesys.xml` file contains sensitive Genesys SIP phone configuration data. Handle with care and do not commit to public repositories.

### 2. Build LiveKit SIP Container

Build the insecure version of livekit-sip (without certificate validation):
First extract sip-main.zip and inside the folder execute docker build command.

```bash
sudo docker build -t livekit-sip-insecure -f ./build/sip/Dockerfile .
```

### 3. Start Docker Services

Navigate to the project directory and start all services:

```bash
cd /path/to/project
sudo docker compose up
```

### 4. Start Node.js Application

Run both the frontend and backend servers:

```bash
# Terminal 1: Start frontend development server
npm run dev

# Terminal 2: Start Express server for LiveKit management
node server
```

### 5. Create SIP Trunk

Use your preferred API testing tool (Insomnia/Postman) to create a SIP trunk.

First, get your local IP address:
```bash
# For Debian-based Linux systems
hostname -I | awk '{print $1}'
```

Then execute this API call:

```bash
curl --request POST \
  --url http://localhost:3000/create-trunk \
  --header 'Accept: */*' \
  --header 'Accept-Language: en-US,en;q=0.9' \
  --header 'Connection: keep-alive' \
  --header 'Content-Type: application/json' \
  --header 'Origin: http://localhost:5173' \
  --header 'Referer: http://localhost:5173/' \
  --header 'Sec-Fetch-Dest: empty' \
  --header 'Sec-Fetch-Mode: cors' \
  --header 'Sec-Fetch-Site: same-site' \
  --header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36' \
  --header 'sec-ch-ua: "Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"' \
  --header 'sec-ch-ua-mobile: ?0' \
  --header 'sec-ch-ua-platform: "Windows"' \
  --data '{
    "address": "YOUR_IP_ADDRESS:5062",
    "number": "anonymous",
    "auth_username": "",
    "auth_password": "",
    "isTls": false
  }'
```

> 📝 **Note**: Replace `YOUR_IP_ADDRESS` with your actual local IP address.

### 6. Configure Trunk ID

After the API call, you'll receive a response containing `sipTrunkId`. Update the following files:

1. Open `app.js`
2. Open `main.js`
3. Search for `trunkId` in both files
4. Replace the existing value with the `sipTrunkId` from the API response

### 7. Access the Application

Your application will be running at:
```
http://localhost:5173/app.html
```

You can now make voice calls through the web interface.

## 🚨 Important Notes

- **Single Line Limitation**: Since all users share the same phone configuration, only one person can use the system at a time
- **Shared Resource**: Please coordinate usage to avoid conflicts
- **Security**: The SIP configuration contains sensitive data - use responsibly

## 🐳 Optional: Docker Management with Portainer

For easier Docker environment management, you can install Portainer:

```bash
# Create Portainer data volume
docker volume create portainer_data

# Run Portainer container
docker run -d -p 9000:9000 -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:lts
```

Access Portainer at: `http://localhost:9000/`

## 🔧 Troubleshooting

### Node.js Version Issues
If you encounter Vite compatibility issues:
```bash
# Check Node.js version
node --version

# If version is below 20.19, upgrade using nvm
nvm install 22
nvm use 22
```

### Docker Build Issues
```bash
# Clean Docker cache if build fails
docker system prune -a
docker volume prune
```

### API Connection Issues
- Ensure all services are running
- Check that ports 3000 and 5173 are not blocked by firewall
- Verify your local IP address is correct in the API call

## 📁 Project Structure

```
├── build/sip/Dockerfile          # LiveKit SIP container configuration
├── conf/sip_profiles/external/   # FreeSWITCH SIP profiles
│   └── genesys.xml              # Genesys SIP configuration (sensitive)
├── nodeServer&UI/               # Frontend and backend code
│   ├── app.js                   # Frontend application
│   ├── main.js                  # Main application logic
│   └── server.js                # Express server
├── docker-compose.yml           # Docker services configuration
└── README.md                    # This file
```

## 🤝 Contributing

When contributing to this project:
1. Never commit sensitive SIP configuration files
2. Test changes with the shared phone line coordination
3. Update documentation for any configuration changes

---

**Happy calling! 📞**
