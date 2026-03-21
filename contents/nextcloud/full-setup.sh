#!/data/data/com.termux/files/usr/bin/bash
set -e

# =================================================
# [0] 사용자 설정 변수 (본인의DNS계정 환경 맞춤)
# =================================================
DOMAIN_NAME="topooh.duckdns.org"
DUCKDNS_TOKEN="a04dfa9a-871c-47de-be09-5e28c109aade"
ADMIN_EMAIL="junipa7@gmail.com"
HTTP_PORT="58080"
HTTPS_PORT="58443"
DB_NAME="nextcloud"
DB_USER="ncuser"
DB_PASS="ncuser0213!"

# 인증서 경로 (acme.sh ECC 기준)
CERT_FILE="$HOME/.acme.sh/${DOMAIN_NAME}_ecc/fullchain.cer"
KEY_FILE="$HOME/.acme.sh/${DOMAIN_NAME}_ecc/${DOMAIN_NAME}.key"

echo "================================================="
echo " 1. SYSTEM UPDATE"
echo "================================================="
pkg update -y
pkg upgrade -y

echo "================================================="
echo " 2. Nextcloud 엔진 및 패키지 설치"
echo "================================================="
pkg install -y php php-fpm php-gd php-redis caddy mariadb redis curl wget unzip \
               openssl-tool cronie git termux-api

if pgrep -x "crond" > /dev/null; then
    echo "✅ crond가 이미 실행 중입니다. (Skip)"
else
    crond
fi

echo "================================================="
echo " 3. acme.sh 설치 및 SSL 인증서 발급"
echo "================================================="
# acme.sh 설치 (기존 파일 삭제 후 재설치로 꼬임 방지)
[ -d "$HOME/.acme.sh" ] || curl https://get.acme.sh | ACME_OPENSSL_BIN=$PREFIX/bin/openssl sh
source ~/.bashrc || true

# ZeroSSL 계정 등록 및 인증서 발급
export DuckDNS_Token="$DUCKDNS_TOKEN"
~/.acme.sh/acme.sh --set-default-ca --server letsencrypt
~/.acme.sh/acme.sh --register-account -m $ADMIN_EMAIL --force
~/.acme.sh/acme.sh --issue --dns dns_duckdns -d $DOMAIN_NAME --ecc --force

echo "================================================="
echo " 3. Nextcloud 본체 다운로드 및 배치"
echo "================================================="
mkdir -p $PREFIX/etc/caddy
mkdir -p $PREFIX/share/caddy
mkdir -p $HOME/nextcloud-data

# Nextcloud 설치
cd $HOME
wget -N https://download.nextcloud.com/server/releases/latest.zip
# 기존 파일이 있으면 충돌하므로 정리 후 압축 해제
rm -rf $PREFIX/share/caddy/*
unzip -q latest.zip -d $PREFIX/share/caddy/
mv $PREFIX/share/caddy/nextcloud/* $PREFIX/share/caddy/ || true
rm -rf $PREFIX/share/caddy/nextcloud

echo "================================================="
echo " 4. PHP 성능 튜닝 및 Caddy 웹서버 포트 우회"
echo "================================================="
# PHP-FPM 내부 통신 포트 활성화
sed -i 's|^listen = .*|listen = 127.0.0.1:9000|' $PREFIX/etc/php-fpm.d/www.conf
# php.ini 설정 (중복 추가 방지 위해 새로 생성)
cat <<EOF > $PREFIX/etc/php.ini
memory_limit = 1024M
upload_max_filesize = 10G
post_max_size = 10G
max_execution_time = 3600
date.timezone = Asia/Seoul
opcache.enable=1
opcache.enable_cli=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000
opcache.revalidate_freq=1
EOF

echo "================================================="
echo " 5. Caddyfile 생성 (글로벌 옵션으로 80번 포트 강제 점유 방지)"
echo "================================================="
cat <<EOF > $PREFIX/etc/caddy/Caddyfile
{
    http_port $HTTP_PORT
    https_port $HTTPS_PORT
}
# HTTP 접속 시 HTTPS로 강제 리다이렉트
http://$DOMAIN_NAME:$HTTP_PORT {
    redir https://$DOMAIN_NAME:$HTTPS_PORT{uri}
}
https://$DOMAIN_NAME:$HTTPS_PORT {
    root * $PREFIX/share/caddy

    # 발급받은 SSL 인증서 적용
    tls $CERT_FILE $KEY_FILE

    file_server
    php_fastcgi 127.0.0.1:9000
    encode gzip zstd
    # Nextcloud 필수 보안 헤더
    header {
        Strict-Transport-Security "max-age=15552000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        Referrer-Policy "no-referrer"
    }

    # CalDAV/CardDAV 리다이렉트 (동기화 앱 오류 방지)
    redir /.well-known/carddav /remote.php/dav 301
    redir /.well-known/caldav /remote.php/dav 301
}
EOF

echo "================================================="
echo " 6. MariaDB 초기화 및 서비스 시작"
echo "================================================="
# DB 초기화
if [ ! -d "$PREFIX/var/lib/mysql" ] || [ -z "$(ls -A $PREFIX/var/lib/mysql)" ]; then
    mariadb-install-db --datadir=$PREFIX/var/lib/mysql
fi
mariadbd-safe --datadir=$PREFIX/var/lib/mysql >/dev/null 2>&1 &
echo "데이터베이스가 시작될 때까지 5초 대기합니다..."
sleep 5

# DB 계정 생성
mariadb -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
mariadb -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
mariadb -e "GRANT ALL PRIVILEGES ON nextcloud.* TO '$DB_USER'@'localhost';"
mariadb -e "FLUSH PRIVILEGES;"

echo "================================================="
echo " 7. 부팅 자동화 설정"
echo "================================================="
# 자동 부팅 스크립트 작성
mkdir -p ~/.termux/boot
cat <<EOF > ~/.termux/boot/start-nextcloud.sh
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
crond
mariadbd-safe --datadir=\$PREFIX/var/lib/mysql >/dev/null 2>&1 &
sleep 5
php-fpm
redis-server --daemonize yes
caddy run --config \$PREFIX/etc/caddy/Caddyfile >/dev/null 2>&1 &
EOF
chmod +x ~/.termux/boot/start-nextcloud.sh

echo "================================================="
echo " 마스터 설정 완료! 서버 시스템을 최종 가동합니다."
echo "================================================="

redis-server --daemonize yes
php-fpm || true
pkill caddy || true
caddy run --config $PREFIX/etc/caddy/Caddyfile >/dev/null 2>&1 &