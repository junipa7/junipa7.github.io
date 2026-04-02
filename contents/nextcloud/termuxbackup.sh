#!/data/data/com.termux/files/usr/bin/bash

# 1. 저장소 권한 확인 (필요시 실행)
termux-setup-storage

# 2. 경로 설정
BACKUP_PATH="/sdcard/Download/termux_backup.tar.gz"
TERMUX_FILES="/data/data/com.termux/files"

echo "백업을 시작합니다..."

# 3. 최상위 디렉토리로 이동 후 압축
cd $TERMUX_FILES
tar -zcvf $BACKUP_PATH home usr

echo "-------------------------------------------"
echo "백업이 완료되었습니다."
echo "저장 위치: $BACKUP_PATH"