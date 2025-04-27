# README-NEXT-STEPS.md

These are the recommended next steps once you have the backend running locally and want to prepare for a production launch.

---

## 1. Secure & Harden

- **HTTPS / SSL**  
  - Use Let’s Encrypt (Certbot) or AWS Certificate Manager.
  - Terminate SSL at your load balancer (ELB) or reverse proxy (NGINX).

- **Environment Variables**  
  - Do **not** commit your `.env` to source control.
  - Use AWS Secrets Manager or Parameter Store for production secrets.

- **Database Credentials**  
  - Restrict RDS access to only your app server’s IP or VPC.
  - Enable automated backups and multi-AZ for resilience.

---

## 2. Choose a Hosting Strategy

### a) Single EC2 + PM2
1. Launch an **Amazon EC2** instance (Ubuntu LTS).
2. SSH in, install Node.js, MySQL client, and Git.
3. Clone your repo, install dependencies.
4. Install PM2 globally:
   ```bash
   npm install -g pm2
