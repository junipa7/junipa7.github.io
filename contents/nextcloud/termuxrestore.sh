#!/data/data/com.termux/files/usr/bin/bash

# 1. 경로 설정
BACKUP_PATH="/sdcard/Download/termux_backup.tar.gz"
TERMUX_FILES="/data/data/com.termux/files"

# 2. 백업 파일 존재 여부 확인
if [ ! -f "$BACKUP_PATH" ]; then
    echo "오류: $BACKUP_PATH 파일을 찾을 수 없습니다."
    exit 1
fi

echo "복원을 시작합니다. 기존 데이터가 교체될 수 있습니다..."

# 3. 최상위 디렉토리로 이동
cd $TERMUX_FILES

# 4. 압축 풀기 (기존 파일 덮어쓰기)
tar -zxvf $BACKUP_PATH

echo "-------------------------------------------"
echo "복원이 완료되었습니다. Termux를 재시작하세요."