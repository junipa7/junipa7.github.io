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
NEXTCLOUD_USER="junipa7"
NEXTCLOUD_PASS="leesh0213!"

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
               openssl-tool cronie git termux-api imagemagick ffmpeg
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
touch ~/.bashrc && source ~/.bashrc  || true

# ZeroSSL 계정 등록 및 인증서 발급  -- 7일 동안 5회 이상 받으면 에러발생 이때는 아래의 제한회피 사용
#export DuckDNS_Token="$DUCKDNS_TOKEN"
#~/.acme.sh/acme.sh --set-default-ca --server letsencrypt
#~/.acme.sh/acme.sh --register-account -m $ADMIN_EMAIL --force
#~/.acme.sh/acme.sh --issue --dns dns_duckdns -d $DOMAIN_NAME --ecc --force

# ZeroSSL 사용으로 변경 (Let's Encrypt 제한 회피)
export DuckDNS_Token="$DUCKDNS_TOKEN"
~/.acme.sh/acme.sh --set-default-ca --server zerossl
~/.acme.sh/acme.sh --register-account -m $ADMIN_EMAIL --force
~/.acme.sh/acme.sh --issue --dns dns_duckdns -d $DOMAIN_NAME --ecc --force


echo "================================================="
echo " 3. Nextcloud 본체 다운로드 및 배치"
echo "================================================="
mkdir -p $PREFIX/etc/caddy
mkdir -p $PREFIX/share/caddy
mkdir -p $HOME/nextcloud-data

# Nextcloud 설치 및 숨김 파일 보존 처리
cd $HOME
wget -N https://download.nextcloud.com/server/releases/latest.zip

# 1. 기존 경로 정리
rm -rf $PREFIX/share/caddy/*

# 2. 압축 해제 (임시 폴더 사용)
unzip -q latest.zip -d $PREFIX/share/caddy/

# 3. 숨김 파일( .htaccess, .user.ini 등)을 포함하여 이동
# . 기호를 사용하여 폴더 내의 모든 항목(숨김 포함)을 상위로 이동시킵니다.
cp -rn $PREFIX/share/caddy/nextcloud/. $PREFIX/share/caddy/

# 4. 잔재 정리
rm -rf $PREFIX/share/caddy/nextcloud
rm -f $HOME/latest.zip

# 5. 권한 강제 재설정 (Termux 환경 최적화)
chmod 644 $PREFIX/share/caddy/.htaccess
chmod 644 $PREFIX/share/caddy/.user.ini

echo "================================================="
echo " 4. PHP 성능 튜닝 및 Caddy 웹서버 포트 우회"
echo "================================================="
# PHP-FPM 내부 통신 포트 활성화
sed -i 's|^listen = .*|listen = 127.0.0.1:9000|' $PREFIX/etc/php-fpm.d/www.conf
# 환경 변수 초기화 방지 설정 추가
sed -i 's/.*clear_env = .*/clear_env = no/' $PREFIX/etc/php-fpm.d/www.conf

# php.ini 설정 (중복 추가 방지 위해 새로 생성)
cat <<EOF > $PREFIX/etc/php/php.ini
memory_limit = 2048M
upload_max_filesize = 10G
post_max_size = 10G
max_execution_time = 3600
date.timezone = Asia/Seoul

# OPcache 최적화 설정
opcache.enable=1
opcache.enable_cli=1
opcache.memory_consumption=512
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.revalidate_freq=1

extension=redis.so
EOF

echo "================================================="
echo " 5. Caddyfile 생성 (글로벌 옵션으로 80번 포트 강제 점유 방지)"
echo "================================================="
cat <<EOF > $PREFIX/etc/caddy/Caddyfile
{
    http_port 58080
    https_port 58443
}
# HTTP 접속 시 HTTPS로 강제 리다이렉트
http://topooh.duckdns.org:58080 {
    redir https://topooh.duckdns.org:58443{uri}
}
https://topooh.duckdns.org:58443 {
    root * /data/data/com.termux/files/usr/share/caddy

    # 발급받은 SSL 인증서 적용
    tls /data/data/com.termux/files/home/.acme.sh/topooh.duckdns.org_ecc/fullchain.cer /data/data/com.termux/files/home/.acme.sh/topooh.duckdns.org_ecc/topooh.duckdns.org.key

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

    # 데이터 폴더 및 설정 폴더 접근 차단
    @forbidden {
        path /data/* /config/* /db_structure /README /3rdparty/* /lib/* /templates/* /occ /console.php
    }
    respond @forbidden "Access Denied" 403

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

# DB 계정 생성 (수정본)
mariadb -u root -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`;"
mariadb -u root -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
mariadb -u root -e "GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';"
mariadb -u root -e "FLUSH PRIVILEGES;"

echo "================================================="
echo " 7. 부팅 자동화 설정"
echo "================================================="
# 자동 부팅 스크립트 작성
mkdir -p ~/.termux/boot
cat <<EOF > ~/.termux/boot/start-nextcloud.sh
#!/data/data/com.termux/files/usr/bin/bash

# 1. 시스템 잠자기 방지 및 기본 서비스
termux-wake-lock
sshd
crond

# 2. 데이터베이스 실행
mariadbd-safe --datadir=$PREFIX/var/lib/mysql >/dev/null 2>&1 &
echo "데이터베이스 시작 대기 중 (10초)..."
sleep 10  # DB가 완전히 올라올 시간을 조금 더 줍니다.

# 3. Redis 실행 (캐싱 속도 향상)
redis-server --daemonize yes

# 4. PHP-FPM 실행 (Nextcloud 엔진)
php-fpm

# 5. Caddy 웹 서버 실행
caddy run --config $PREFIX/etc/caddy/Caddyfile >/dev/null 2>&1 &

# 6. [추가] Nextcloud 내부 작업(Cron) 예약 확인
# crontab에 등록되어 있지 않다면 등록합니다.
(crontab -l 2>/dev/null | grep -q "cron.php") || (echo "*/5 * * * * php -f /data/data/com.termux/files/usr/share/caddy/cron.php" | crontab -)

echo "Nextcloud 서버가 성공적으로 시작되었습니다!"
EOF
chmod +x ~/.termux/boot/start-nextcloud.sh

echo "================================================="
echo " 8. 최종 시스템 최적화 및 수리"
echo "================================================="
NC_OCC="php $PREFIX/share/caddy/occ"

if $NC_OCC status | grep -q "installed: true"; then
    echo "MIME 유형 마이그레이션 중..."
    $NC_OCC maintenance:repair --include-expensive
    
    echo "데이터베이스 인덱스 최적화 중..."
    $NC_OCC db:add-missing-indices
    
    echo "빅 인트(BigInt) 변환 중..."
    $NC_OCC db:convert-filecache-bigint --no-interaction

    echo "누락된 인덱스를 추가합니다..."
    $NC_OCC db:add-missing-indices

fi

echo "================================================="
echo " 9. 마스터 설정 완료! 서버 시스템을 최종 가동합니다."
echo "================================================="

redis-server --daemonize yes
php-fpm || true
pkill caddy || true
caddy run --config $PREFIX/etc/caddy/Caddyfile >/dev/null 2>&1 &

sleep 10

echo "================================================="
echo " 10. Nextcloud 초기 설치 (CLI 방식)"
echo "================================================="
NC_OCC="php $PREFIX/share/caddy/occ"

# 관리자 계정 생성 및 DB 연결 설치
$NC_OCC maintenance:install \
  --database "mysql" \
  --database-host "127.0.0.1" \
  --database-name "$DB_NAME" \
  --database-user "$DB_USER" \
  --database-pass "$DB_PASS" \
  --admin-user "$NEXTCLOUD_USER" \
  --admin-pass "$NEXTCLOUD_PASS" \
  --data-dir "$HOME/nextcloud-data"

# 설치 후 안정화를 위한 대기
sleep 5

echo "================================================="
echo " 11. Redis PHP 확장 모듈 수동 컴파일 및 적용"
echo "================================================="
# 기존 폴더 정리 및 최신 소스 다운로드
cd $HOME
rm -rf phpredis
git clone https://github.com/phpredis/phpredis.git
cd phpredis

# Termux 환경에 맞춘 헤더 경로 지정 및 빌드
export C_INCLUDE_PATH=$PREFIX/include/php:$PREFIX/include/php/main:$PREFIX/include/php/TSRM:$PREFIX/include/php/Zend:$PREFIX/include/php/ext:$PREFIX/include/php/ext/date/lib
phpize
./configure
make -j4

# 컴파일된 모듈 적용 및 설정
cp modules/redis.so $PREFIX/lib/php/
grep -q "extension=redis.so" $PREFIX/etc/php/php.ini || echo "extension=redis.so" >> $PREFIX/etc/php/php.ini

# PHP-FPM 재시작 및 모듈 로드 확인
pkill php-fpm || true
php-fpm
echo "Redis 모듈 로드 상태:"
php -m | grep redis

echo "================================================="
echo " 12. Nextcloud config.php 최적화 및 캐시 최종 설정"
echo "================================================="
# 설치가 정상적으로 완료되었는지 확인 후 설정 진행
if $NC_OCC status | grep -q "installed: true"; then
    echo "[+] 기본 시스템 설정 적용 중..."
    $NC_OCC config:system:set default_phone_region --value="KR"
    $NC_OCC config:system:set trusted_proxies 0 --value="127.0.0.1"
    $NC_OCC config:system:set forwarded_for_headers 0 --value="HTTP_X_FORWARDED_FOR"
    $NC_OCC config:system:set trusted_domains 1 --value="$DOMAIN_NAME"
    $NC_OCC config:system:set trusted_domains 0 --value="localhost"
    $NC_OCC config:system:set maintenance_window_start --type integer --value 2
    $NC_OCC config:system:set server_id --value=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 10)

    echo "[+] 파일 및 용량 제한 설정..."
    $NC_OCC config:app:set files max_chunk_size --value 5242880
    $NC_OCC user:setting junipa7 files quota "1 GB"

    echo "[+] Redis 기반 캐시 및 파일 잠금 설정..."
    $NC_OCC config:system:set redis host --value="localhost"
    $NC_OCC config:system:set redis port --value=6379 --type=integer
    $NC_OCC config:system:set memcache.local --value="\OC\Memcache\Redis"
    $NC_OCC config:system:set memcache.locking --value="\OC\Memcache\Redis"

    echo "[+] 크론(Cron) 백그라운드 작업 등록..."
    $NC_OCC background:cron
    # 기존 중복 등록 방지 후 새 크론탭 적용
    (crontab -l 2>/dev/null | grep -v "cron.php"; echo "*/5 * * * * php -f $PREFIX/share/caddy/cron.php") | crontab -

    echo "[+] 데이터베이스 및 MIME 최적화 (다소 시간이 소요될 수 있습니다)..."
    $NC_OCC maintenance:repair --include-expensive
    $NC_OCC db:add-missing-indices
    $NC_OCC db:convert-filecache-bigint --no-interaction

    echo "[+] 동영상 미리보기 설정 추가..."
    $NC_OCC app:disable app_api

    # 1. 미리보기 생성기 목록에 Video(Movie) 추가
    $NC_OCC config:system:set enabledPreviewProviders 0 --value="OC\\Preview\\Movie"
    $NC_OCC config:system:set enabledPreviewProviders 1 --value="OC\\Preview\\PNG"
    $NC_OCC config:system:set enabledPreviewProviders 2 --value="OC\\Preview\\JPEG"
    $NC_OCC config:system:set enabledPreviewProviders 3 --value="OC\\Preview\\GIF"
    $NC_OCC config:system:set enabledPreviewProviders 4 --value="OC\\Preview\\BMP"
    $NC_OCC config:system:set enabledPreviewProviders 5 --value="OC\\Preview\\MarkDown"
    $NC_OCC config:system:set enabledPreviewProviders 6 --value="OC\\Preview\\MP3"
    $NC_OCC config:system:set enabledPreviewProviders 7 --value="OC\\Preview\\TXT"

    # 2. FFmpeg 실행 파일 경로 지정 (1번에서 확인한 경로 입력)
    $NC_OCC config:system:set preview_ffmpeg_path --value="$PREFIX/bin/ffmpeg"

    # 미리보기 최대 크기 제한 (성능을 위해 너무 크게 잡지 마세요)
    $NC_OCC config:system:set preview_max_x --value=1024
    $NC_OCC config:system:set preview_max_y --value=1024

    # 동영상 미리보기 생성 허용
    $NC_OCC config:system:set enable_previews --value=true --type=bool

    # 기본 생성 명령어 실행
    $NC_OCC preview:generate

    # 주기적 자동 생성 설정 - crontab 편집 (crontab -e) 또는 아래 명령어 실행
(crontab -l 2>/dev/null; echo "*/15 * * * * php -f $PREFIX/share/caddy/occ preview:pre-generate") | crontab -

    echo "[+] 불필요한 앱 비활성화..."
    $NC_OCC app:disable app_api

    echo "================================================="
    echo " 🎉 Nextcloud 서버의 모든 설정이 완벽하게 완료되었습니다!"
    echo "================================================="
else
    echo "================================================================="
    echo " ⚠️ 오류: Nextcloud 코어 설치가 정상적으로 완료되지 않아"
    echo " 최적화 설정을 건너뛰었습니다. 로그를 확인해 주세요."
    echo "================================================================="
fi
