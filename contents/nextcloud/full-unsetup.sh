#!/data/data/com.termux/files/usr/bin/bash

set -e

echo "================================================="
echo " Termux Nextcloud Complete Server Removal Script"
echo "================================================="

###############################################
# 1. STOP SERVERS
###############################################
echo ""
echo "[1] STOP RUNNING SERVICES"
echo "PHP-FPM, Redis, Caddy, MariaDB 서버를 종료합니다."

# PHP-FPM 종료
pkill php-fpm 2>/dev/null || true

# Redis 종료
pkill redis-server 2>/dev/null || true

# Caddy 종료
pkill caddy 2>/dev/null || true

# MariaDB 종료
pkill mariadbd 2>/dev/null || true

sleep 2
echo "서버 종료 완료."

###############################################
# 2. REMOVE NEXTCLOUD FILES
###############################################
echo ""
echo "[2] REMOVE NEXTCLOUD FILES"
echo "웹서버, 데이터 디렉토리, Nextcloud 설치 파일을 삭제합니다."

rm -rf $PREFIX/share/caddy/nextcloud
rm -rf $HOME/nextcloud-data
rm -f $HOME/latest.zip

echo "Nextcloud 관련 파일 삭제 완료."

###############################################
# 3. REMOVE CADDY CONFIG
###############################################
echo ""
echo "[3] REMOVE CADDY CONFIG"
rm -rf $PREFIX/etc/caddy
echo "Caddy 설정 삭제 완료."

###############################################
# 4. REMOVE PHP CONFIG MODIFICATIONS
###############################################
echo ""
echo "[4] REMOVE PHP CONFIG MODIFICATIONS"
# PHP 설정은 원래대로 초기화하거나 필요시 삭제
# 기존 php.ini 백업이 있다면 복원 가능
rm -f $PREFIX/etc/php.ini

###############################################
# 5. REMOVE REDIS
###############################################
echo ""
echo "[5] REMOVE REDIS DATA"
# Termux Redis는 일반적으로 데이터 없으므로 별도 삭제 필요 없음
echo "Redis 서버 종료 완료. 데이터는 자동 삭제되지 않음."

###############################################
# 6. REMOVE MARIADB DATA
###############################################
echo ""
echo "[6] REMOVE MARIADB DATA"
rm -rf $PREFIX/var/lib/mysql
rm -rf $PREFIX/var/run/mariadb
echo "MariaDB 데이터 삭제 완료."

###############################################
# 7. REMOVE AUTO START SCRIPT
###############################################
echo ""
echo "[7] REMOVE AUTO START SCRIPT"
rm -f ~/.termux/boot/start-nextcloud.sh
echo "자동 시작 스크립트 삭제 완료."

###############################################
# 8.  SSL 인증서 및 acme.sh 환경 삭제.
###############################################

# 1. acme.sh를 이용해 등록된 모든 인증서 관리 중지 및 삭제
if [ -d "$HOME/.acme.sh" ]; then
    echo "[1/4] 기존 인증서 목록 및 관리 설정 삭제 중..."
    # acme.sh가 존재할 때만 실행하며, 실패해도 중단되지 않도록 || true 처리
    $HOME/.acme.sh/acme.sh --list | tail -n +2 | awk '{print $1}' | while read -r domain; do
        if [ -n "$domain" ]; then
            $HOME/.acme.sh/acme.sh --remove -d "$domain" || echo "$domain 삭제 실패 (무시함)"
        fi
    done
else
    echo "[1/4] 삭제할 acme.sh 폴더가 없습니다. 건너뜁니다."
fi

# 2. 크론탭(Cron) 작업 초기화
echo "[2/4] 크론탭 작업 삭제 중..."
crontab -r 2>/dev/null || echo "삭제할 크론탭 작업이 없습니다."

# 3. acme.sh 설치 폴더 물리적 삭제
echo "[3/4] acme.sh 설치 폴더 제거 중..."
rm -rf "$HOME/.acme.sh"

# 4. 환경 변수 설정 파일(.bashrc, .bash_profile) 정리
echo "[4/4] 환경 변수(.bashrc, .bash_profile) 내 설정 제거 중..."
# sed로 acme.sh 관련 줄을 삭제 (해당 파일이 없어도 에러 무시)
[ -f ~/.bashrc ] && sed -i '/acme.sh/d' ~/.bashrc
[ -f ~/.bash_profile ] && sed -i '/acme.sh/d' ~/.bash_profile

# 변경사항 적용 (에러 방지를 위해 파일 존재 여부 확인 후 source)
if [ -f ~/.bashrc ]; then
    source ~/.bashrc || true
fi
if [ -f ~/.bash_profile ]; then
    source ~/.bash_profile || true
fi

###############################################
# 9. OPTIONAL: REMOVE PACKAGES
###############################################
echo ""
echo "[8] OPTIONAL: REMOVE PACKAGES"
echo "원하면 다음 명령어로 설치한 패키지 삭제 가능:"
echo "pkg uninstall -y php php-fpm php-gd php-redis caddy mariadb redis curl wget unzip termux-api"
echo ""
echo "================================================="
echo " Nextcloud Termux Server Complete Removal DONE"
echo "================================================="