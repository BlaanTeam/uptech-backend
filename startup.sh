# install dependecies

if  command -v npm &>/dev/null; then
    echo "Installing dependencies..."
    npm install
    # fix vulnerabilities
    echo "Fixing vulnerability..."
    npm audit fix --force
else
    echo "Please install npm !"
    exit 1
fi

DB_USER="root"
DB_PASS="passWord&UpTech"
REDIS_PASS="passWord&UpTech"
env="
ENV=production
PORT=8080
DB_DNS_SRV=disabled
DB_HOST=localhost
DB_PORT=27017
DB_USER=$DB_USER
DB_PASS=$DB_PASS
DB_NAME=uptech
DB_HOST_PRODUCTION=localhost
DB_PORT_PRODUCTION=27017
DB_USER_PRODUCTION=$DB_USER
DB_PASS_PRODUCTION=$DB_PASS
DB_NAME_PRODUCTION=uptech
JWT_ACCESS_TOKEN_SECRET_KEY=super-access-token-secret
JWT_REFRESH_TOKEN_SECRET_KEY=supre-secret-key-here
JWT_CONFIRMATION_SECRET_KEY=super-confirmation-secret-key
JWT_FORGOR_PASSWORD_SECRET_KEY=super-forgot-password-secret-key
MAIL_SMTP_HOST=smtp.mailtrap.io
MAIL_SMTP_PORT=2525
MAIL_SMTP_USER=763a6c9841e427
MAIL_SMTP_PASS=bb01cc744e0723
MAIL_SMTP_SENDER=uptech-f7e8ce@inbox.mailtrap.io
USE_TLS=false
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASS=$REDIS_PASS"
echo  "$env" > .env 
